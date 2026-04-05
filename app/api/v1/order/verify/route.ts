import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

export async function POST(req: Request) {
    try {
        await connectDB();

        /* ---------- AUTH (API KEY) ---------- */
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ success: false, message: "API Key required" }, { status: 401 });
        }

        const user = await User.findOne({ apiKey });
        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid API Key" }, { status: 401 });
        }

        /* ---------- BODY ---------- */
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, message: "Missing orderId" }, { status: 400 });
        }

        /* ---------- FETCH ORDER ---------- */
        const order = await Order.findOne({
            orderId,
            userId: user._id // Security: Ensure order belongs to this API user
        }).select("orderId gameSlug itemSlug itemName playerId status topupStatus price createdAt");

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            order: {
                orderId: order.orderId,
                game: order.gameSlug,
                item: order.itemSlug,
                name: order.itemName,
                playerId: order.playerId,
                status: order.status,
                topupStatus: order.topupStatus,
                price: order.price,
                date: order.createdAt
            }
        });

    } catch (err: any) {
        console.error("API VERIFY ERROR:", err);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
