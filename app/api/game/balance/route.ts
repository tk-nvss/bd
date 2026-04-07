import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/api-service/balance?currency=USD`;
    // console.log("FETCHING BALANCE FROM:", url);

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
    });

    const data = await resp.json();
    // console.log("BALANCE API RAW RESPONSE:", data);

    // If data is an object, check for data.data.balance or data.balance
    let rawBalance = data?.data?.balance ?? data?.balance ?? 0;

    // Parse numeric value if it's a string like "9.99 USD"
    const balanceValue = typeof rawBalance === 'string'
      ? parseFloat(rawBalance.replace(/[^\d.-]/g, ''))
      : (typeof rawBalance === 'number' ? rawBalance : 0);

    // console.log("EXTRACTED BALANCE VALUE:", balanceValue);

    return NextResponse.json({ success: true, balance: balanceValue });
  } catch (error: any) {
    console.error("BALANCE CHECK ERROR:", error);
    return NextResponse.json({ success: true, balance: 0 });
  }
}
