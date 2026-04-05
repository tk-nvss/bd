import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import WalletTransaction from "@/models/WalletTransaction";
import PricingConfig from "@/models/PricingConfig";
import crypto from "crypto";
import mongoose from "mongoose";

/* =====================================================
   STATIC PRICING (BGMI MANUAL ONLY FOR API)
===================================================== */
const MANUAL_GAMES: Record<string, any> = {
    "bgmi-manual": {
        "bgmi-60": 70,
        "bgmi-325": 353,
        "bgmi-660": 697,
        "bgmi-1800": 1767,
        "bgmi-3850": 3584,
        "bgmi-8100": 7100,
    },
    "bgmi": {
        "bgmi-60": 70,
        "bgmi-325": 353,
        "bgmi-660": 697,
        "bgmi-1800": 1767,
        "bgmi-3850": 3584,
        "bgmi-8100": 7100,
    },
};

export async function POST(req: Request) {
    let session: any = null;

    try {
        await connectDB();
        
        session = await mongoose.startSession();
        session.startTransaction();

        /* ---------- AUTH & IDEMPOTENCY ---------- */
        const apiKey = req.headers.get("x-api-key");
        const idempotencyKey = req.headers.get("x-idempotency-key");

        if (!apiKey) {
            return NextResponse.json({ success: false, message: "API Key required" }, { status: 401 });
        }

        const user = await User.findOne({ apiKey }).session(session);
        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid API Key" }, { status: 401 });
        }

        // Check Idempotency Key
        if (idempotencyKey) {
            const existingOrder = await Order.findOne({
                userId: user._id,
                idempotencyKey
            }).session(session);

            if (existingOrder) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json({
                    success: true,
                    message: "Duplicate request detected. Returning existing order.",
                    orderId: existingOrder.orderId,
                    price: existingOrder.price,
                    isDuplicate: true
                });
            }
        }

        if (user.userType !== "member" && user.userType !== "owner" && user.userType !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        /* ---------- BODY & VALIDATION ---------- */
        let body: any;
        try {
            const rawBody = await req.text();
            if (!rawBody) {
                return NextResponse.json({ success: false, message: "Empty request body" }, { status: 400 });
            }
            body = JSON.parse(rawBody);
        } catch (err: any) {
            console.error("JSON PARSE ERROR:", err);
            return NextResponse.json({ success: false, message: "Invalid JSON in request" }, { status: 400 });
        }

        const {
            gameSlug,
            itemSlug,
            itemName,
            playerId,
            zoneId = "N/A",
            email,
            phone,
        } = body;

        // Restriction: Only bgmi for now
        if (gameSlug !== "bgmi-manual" && gameSlug !== "bgmi") {
            return NextResponse.json({
                success: false,
                message: "API support for this game is currently restricted. Only 'bgmi-manual' is allowed."
            }, { status: 400 });
        }

        if (!itemSlug || !playerId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Strict Player ID Validation
        if (playerId.length < 5 || playerId.length > 15) {
            return NextResponse.json({ success: false, message: "Invalid Player ID format" }, { status: 400 });
        }

        /* ---------- PRICE CALCULATION ---------- */
        const gamePricing = MANUAL_GAMES[gameSlug];
        if (!gamePricing || !gamePricing[itemSlug]) {
            return NextResponse.json({ success: false, message: "Invalid game or item slug" }, { status: 400 });
        }

        let price = gamePricing[itemSlug];

        // Check for user-specific pricing overrides if not owner
        // 🔒 FIX: Skip markups for BGMI so base price (70) is used even for Members/Admins
        if (user.userType !== "owner" && gameSlug !== "bgmi" && gameSlug !== "bgmi-manual") {
            const pricingConfig = await PricingConfig.findOne({ userType: user.userType }).session(session);
            if (pricingConfig) {
                const fixed = pricingConfig.overrides?.find(
                    (o: any) => o.gameSlug === gameSlug && o.itemSlug === itemSlug
                );

                if (fixed?.fixedPrice != null) {
                    price = Number(fixed.fixedPrice);
                } else if (pricingConfig.slabs?.length) {
                    const slab = pricingConfig.slabs.find(
                        (s: any) => price >= s.min && price < s.max
                    );
                    if (slab) price = Math.ceil(price * (1 + slab.percent / 100));
                }
            }
        }

        /* ---------- WALLET PAYMENT (ONLY) ---------- */
        if ((user.wallet || 0) < price) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ success: false, message: "Insufficient wallet balance" }, { status: 400 });
        }

        const balanceBefore = user.wallet || 0;
        const balanceAfter = balanceBefore - price;

        // Deduct balance
        user.wallet = balanceAfter;
        await user.save({ session });

        /* ---------- CREATE ORDER ---------- */
        const orderId = "API" + Date.now().toString(36) + crypto.randomBytes(4).toString("hex");

        const newOrder = await Order.create([{
            orderId,
            userId: user._id,
            gameSlug,
            itemSlug,
            itemName: itemName || itemSlug,
            playerId,
            zoneId,
            paymentMethod: "wallet",
            price,
            email: email || user.email || null,
            phone: phone || user.phone || null,
            status: "pending", // Manual games start as pending for admin to process
            paymentStatus: "success",
            topupStatus: "pending",
            isManual: true,
            idempotencyKey: idempotencyKey || undefined,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Longer expiry for successful orders
        }], { session });

        /* ---------- TRANSACTION LOG ---------- */
        await WalletTransaction.create([{
            transactionId: `WAL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
            userId: user._id,
            type: "payment",
            amount: price,
            balanceBefore,
            balanceAfter,
            status: "success",
            paymentMethod: "wallet",
            description: `API Order: ${itemName || itemSlug} for ${playerId}`,
            orderId: orderId,
        }], { session });

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            success: true,
            message: "Order placed successfully via API",
            orderId,
            price,
            balanceRemaining: balanceAfter,
        });

    } catch (err: any) {
        console.error("API ORDER ERROR:", err);
        if (session) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            session.endSession();
        }
        return NextResponse.json({ success: false, message: err.message || "Internal Server Error" }, { status: 500 });
    }
}
