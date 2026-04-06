import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WalletTransaction from "@/models/WalletTransaction";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();

    /* ---------- AUTH (JWT) ---------- */
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET!
      );
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    /* ---------- WALLET RECHARGE ---------- */
    const userType = decoded.userType || "user";
    if (userType !== "user" && userType !== "member" && userType !== "owner" && userType !== "admin") {
      return NextResponse.json({
        success: false,
        message: "Wallet recharge is only available for admins, members, owners and users.",
      });
    }

    const userId = decoded.userId;
    const { amount, mobile } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" });
    }

    const transactionId = `RECH-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    // Create a pending transaction
    await WalletTransaction.create({
      transactionId,
      userId,
      type: "deposit",
      amount: parseFloat(amount),
      balanceBefore: 0, // Will be updated on success
      balanceAfter: 0, // Will be updated on success
      status: "pending",
      paymentMethod: "gateway",
      description: `Wallet recharge via UPI`,
    });

    /* ---------- PAYMENT GATEWAY (ZiniPay V1 API) ---------- */
    const ziniApiKey = process.env.XTRA_USER_TOKEN!;

    const ziniPayload = {
      cus_name: decoded.userName || "Customer",
      cus_email: decoded.email || "",
      amount: String(amount),
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URLU}/dashboard/wallet`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URLU}/dashboard/wallet`,
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URLU}/api/webhook`,
      metadata: {
        orderId: transactionId,
        type: "wallet-topup",
        userId: userId,
        phone: mobile || "",
      },
    };

    const resp = await fetch("https://api.zinipay.com/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": ziniApiKey,
      },
      body: JSON.stringify(ziniPayload),
    });

    const data = await resp.json();

    if (!data?.status) {
      return NextResponse.json({
        success: false,
        message: data?.message || "Payment gateway error",
      });
    }

    // Capture Invoice ID if provided
    if (data.invoiceId) {
      const tx = await WalletTransaction.findOne({ transactionId });
      if (tx) {
        tx.gatewayTxnId = data.invoiceId;
        await tx.save();
      }
    }

    return NextResponse.json({
      success: true,
      paymentUrl: data.payment_url,
      orderId: transactionId,
    });
  } catch (err: any) {
    console.error("Wallet recharge error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
