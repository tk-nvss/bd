import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      cus_name, 
      cus_email, 
      amount, 
      redirect_url, 
      cancel_url, 
      webhook_url, 
      metadata 
    } = body;

    if (!amount || !redirect_url) {
      return NextResponse.json({
        status: false,
        message: "Missing required fields: amount and redirect_url",
      }, { status: 400 });
    }

    const ziniApiKey = process.env.XTRA_USER_TOKEN!;

    const resp = await fetch("https://api.zinipay.com/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": ziniApiKey,
      },
      body: JSON.stringify({
        cus_name: cus_name || "Customer",
        cus_email: cus_email || "",
        amount: String(amount),
        redirect_url,
        cancel_url: cancel_url || redirect_url,
        webhook_url: webhook_url || "",
        metadata: metadata || {},
      }),
    });

    const data = await resp.json();

    if (!data?.status) {
      return NextResponse.json({
        status: false,
        message: data?.message || "Gateway error",
      }, { status: 502 });
    }

    return NextResponse.json({
      status: true,
      message: data.message || "Payment URL generated successfully",
      payment_url: data.payment_url,
      invoiceId: data.invoiceId // Pass through if available
    });

  } catch (err: any) {
    console.error("V1 PAYMENT CREATE ERROR:", err);
    return NextResponse.json({
      status: false,
      message: err.message || "Internal server error",
    }, { status: 500 });
  }
}
