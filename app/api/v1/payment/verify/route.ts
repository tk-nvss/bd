import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, apiKey: requestApiKey } = body;

    if (!invoiceId) {
      return NextResponse.json({
        status: false,
        message: "invoiceId is required",
      }, { status: 400 });
    }

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

    if (data.status === "COMPLETED" || data.status === "SUCCESS") {
      return NextResponse.json({
        status: "COMPLETED",
        transaction_id: data.transaction_id || (data.data && data.data.transactionId),
        invoiceId: data.invoiceId || invoiceId,
        amount: data.amount || (data.data && data.data.amount),
        currency: data.currency || (data.data && data.data.currency) || "INR",
        paymentMethod: data.paymentMethod || (data.data && data.data.paymentMethod),
        customerName: data.customerName || (data.data && data.data.customerName),
        customerEmail: data.customerEmail || (data.data && data.data.customerEmail),
        metadata: data.metadata || (data.data && data.data.metadata) || {},
        createdAt: data.createdAt || (data.data && data.data.createdAt),
        raw: data
      });
    } else {
      return NextResponse.json({
        status: data.status || "FAILED",
        message: data.message || "Payment verification failed",
        raw: data
      }, { status: 400 });
    }

  } catch (err: any) {
    console.error("V1 PAYMENT VERIFY ERROR:", err);
    return NextResponse.json({
      status: false,
      message: err.message || "Internal server error",
    }, { status: 500 });
  }
}
