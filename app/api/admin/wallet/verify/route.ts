import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";

export async function POST(req: Request) {
    try {
        await connectDB();

        /* ---------- ADMIN AUTH ---------- */
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        // Check if user is admin/owner
        const adminUser = await User.findById(decoded.userId);
        if (!adminUser || (adminUser.userType !== "admin" && adminUser.userType !== "owner")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { orderId, invoiceId: bodyInvoiceId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ message: "Missing orderId" }, { status: 400 });
        }

        /* ---------- LOCK TRANSACTION ---------- */
        const transaction = await WalletTransaction.findOneAndUpdate(
            { transactionId: orderId, status: "pending" },
            { $set: { status: "processing" } },
            { new: true }
        );

        if (!transaction) {
            const alreadySuccess = await WalletTransaction.findOne({ transactionId: orderId, status: "success" });
            if (alreadySuccess) return NextResponse.json({ success: true, message: "Already successful." });
            return NextResponse.json({ success: false, message: "Transaction not found or not pending." });
        }

        /* ---------- CHECK GATEWAY (ZiniPay V1) ---------- */
        const invoiceId = bodyInvoiceId || transaction.gatewayTxnId || orderId;
        const ziniApiKey = process.env.XTRA_USER_TOKEN!;

        const resp = await fetch("https://api.zinipay.com/v1/payment/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "zini-api-key": ziniApiKey,
            },
            body: JSON.stringify({
                invoiceId: invoiceId,
                apiKey: ziniApiKey,
            }),
        });

        const data = await resp.json();
        const gatewaySuccess = data?.status === "COMPLETED" || data?.status === "SUCCESS";

        if (!gatewaySuccess) {
            transaction.status = "pending";
            await transaction.save();
            return NextResponse.json({ success: false, message: `Gateway status: ${data?.status || "FAILED"} (${data?.message || "Verify failed"})` });
        }

        const amount = Number(data?.amount || data?.data?.amount || 0);
        if (!amount) {
            transaction.status = "pending";
            await transaction.save();
            return NextResponse.json({ success: false, message: "Invalid amount from gateway." });
        }

        /* ---------- UPDATE ---------- */
        const user = await User.findOneAndUpdate(
            { userId: transaction.userId },
            { $inc: { wallet: amount } },
            { new: true }
        );

        if (!user) {
            transaction.status = "pending";
            await transaction.save();
            return NextResponse.json({ success: false, message: "User not found." });
        }

        transaction.status = "success";
        transaction.balanceBefore = (user.wallet || 0) - amount;
        transaction.balanceAfter = user.wallet;
        transaction.amount = amount;
        await transaction.save();

        return NextResponse.json({
            success: true,
            message: `Successfully verified and added ₹${amount} to user wallet.`,
        });
    } catch (error: any) {
        console.error("Admin Wallet Verify Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}
