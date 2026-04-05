import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";


export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log("Raw Webhook Body:", rawBody);

    let json;
    try {
      json = JSON.parse(rawBody);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { 
      status, 
      order_id: bodyOrderId, 
      metadata, 
      invoiceId, 
      remark1: bodyRemark1 
    } = json;

    const order_id = bodyOrderId || metadata?.orderId || metadata?.order_id;
    const isSuccess = status === "SUCCESS" || status === "COMPLETED";
    const remark1 = bodyRemark1 || metadata?.remark1 || (metadata?.type === "wallet-topup" ? "wallet-topup" : null);

    await connectDB();

    if (isSuccess && order_id) {
      // 1. Check if it's a wallet recharge
      if (remark1 === "wallet-topup") {
        const transaction = await WalletTransaction.findOneAndUpdate(
          { transactionId: order_id, status: "pending" },
          { $set: { status: "processing" } }, 
          { new: true }
        );

        if (transaction) {
          const user = await User.findOneAndUpdate(
            { _id: transaction.userId },
            {
              $inc: { wallet: transaction.amount },
              $set: { lastRecharge: transaction.amount }
            },
            { new: true }
          );

          if (user) {
            transaction.status = "success";
            transaction.balanceBefore = (user.wallet || 0) - transaction.amount;
            transaction.balanceAfter = user.wallet;
            if (invoiceId) transaction.gatewayTxnId = invoiceId;
            await transaction.save();

            console.log(`Wallet recharged (Webhook V1) for user ${user.userId}: +${transaction.amount}`);
          } else {
            transaction.status = "pending";
            await transaction.save();
          }
        }
      }
      // 2. Otherwise it's a normal game order
      else {
        const order = await Order.findOne({ orderId: order_id });
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "success";
          order.status = "pending"; 
          if (invoiceId) order.gatewayOrderId = invoiceId;
          await order.save();
          console.log(`Order ${order_id} marked as paid (Webhook V1)`);
        }
      }

      return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Webhook received but status not SUCCESS" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
