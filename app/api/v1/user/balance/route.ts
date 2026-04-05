import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await connectDB();

        /* ---------- AUTH (API KEY) ---------- */
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ success: false, message: "API Key required" }, { status: 401 });
        }

        const user = await User.findOne({ apiKey }).select("wallet userType name");
        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid API Key" }, { status: 401 });
        }

        // Role check
        if (user.userType !== "member" && user.userType !== "owner" && user.userType !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            balance: user.wallet || 0,
            userType: user.userType,
            name: user.name
        });

    } catch (err: any) {
        console.error("API BALANCE ERROR:", err);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
