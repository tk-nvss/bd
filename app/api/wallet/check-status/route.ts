import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";

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

    const userId = decoded.userId;
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId" },
        { status: 400 }
      );
    }

    /* ---------- FETCH & LOCK TRANSACTION ---------- */
    const transaction = await WalletTransaction.findOneAndUpdate(
      { transactionId: orderId, status: "pending" },
      { $set: { status: "processing" } }, // Atomic lock
      { new: true }
    );

    if (!transaction) {
      // Check if it was already successful
      const alreadySuccess = await WalletTransaction.findOne({
        transactionId: orderId,
        status: "success"
      });

      if (alreadySuccess) {
        return NextResponse.json({
          success: true,
          message: "Payment was already successfully verified and added to your wallet.",
        });
      }

      return NextResponse.json({
        success: false,
        message: "Transaction not found or already being processed."
      });
    }

    // Security check: ensure transaction belongs to user
    if (transaction.userId !== userId) {
      // Rollback status
      transaction.status = "pending";
      await transaction.save();
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    /* ---------- CHECK GATEWAY STATUS (ZiniPay V1) ---------- */
    const { invoiceId: bodyInvoiceId } = await req.json();
    const invoiceId = bodyInvoiceId || transaction.gatewayOrderId || orderId;
    const ziniApiKey = process.env.XTRA_USER_TOKEN!;
    
    console.log("VERIFYING WALLET RECHARGE:", { orderId, invoiceId });

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
    console.log("ZINIPAY WALLET VERIFY RESPONSE:", data);

    const gatewaySuccess = data?.status === "COMPLETED" || data?.status === "SUCCESS";

    // ✅ Store the response even on failure
    transaction.gatewayResponse = data;
    if (data.transaction_id) transaction.gatewayTransactionId = data.transaction_id;

    if (!gatewaySuccess) {
      // Rollback status so user can try again later
      transaction.status = "pending";
      await transaction.save();
      console.log("WALLET RECHARGE FAILED/PENDING:", { orderId, dataStatus: data.status });
      return NextResponse.json({
        success: false,
        message: "Payment is still pending (" + (data.status || "FAILED") + ")",
      });
    }

    const amount = Number(data?.amount || data?.data?.amount || 0);

    /* =====================================================
       SECURITY CHECK: META USER MATCH
    ===================================================== */
    const metaUserId = data?.metadata?.userId;
    if (metaUserId && metaUserId !== userId) {
      console.error("FRAUD ALERT: WALLET RECHARGE USER MISMATCH", { userId, metaUserId });
      transaction.status = "failed";
      await transaction.save();
      return NextResponse.json({
        success: false,
        message: "Fraudulent wallet recharge detected (User Mismatch)",
      });
    }

    if (!amount) {
      transaction.status = "pending";
      await transaction.save();
      return NextResponse.json({
        success: false,
        message: "Invalid transaction amount received from gateway",
      });
    }

    /* ---------- UPDATE USER WALLET & TRANSACTION ---------- */
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { wallet: amount, order: 1 }
      },
      { new: true }
    );

    if (!user) {
      transaction.status = "pending";
      await transaction.save();
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Mark transaction as success Final
    transaction.status = "success";
    transaction.balanceBefore = (user.wallet || 0) - amount;
    transaction.balanceAfter = user.wallet;
    transaction.amount = amount;
    await transaction.save();

    return NextResponse.json({
      success: true,
      message: "Wallet recharged successfully!",
      amount,
      newWallet: user.wallet,
    });
  } catch (error: any) {
    console.error("Wallet check-status error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
