import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/api-service/balance?currency=USD`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
    });

    const data = await resp.json();
    const balanceValue = typeof data === "number" ? data : (data?.balance || 0);

    return NextResponse.json({ success: true, balance: balanceValue });
  } catch (error: any) {
    console.error("BALANCE CHECK ERROR:", error);
    return NextResponse.json({ success: true, balance: 0 });
  }
}
