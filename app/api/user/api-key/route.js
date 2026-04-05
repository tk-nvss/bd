import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("apiKey userType");

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Only active for members and owners
        const isAuthorized = user.userType === "member" || user.userType === "owner";

        return NextResponse.json({
            success: true,
            apiKey: user.apiKey,
            isAuthorized,
        });

    } catch (err) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
}

export async function POST(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Role check
        if (user.userType !== "member" && user.userType !== "owner") {
            return NextResponse.json({ success: false, message: "Only members and owners can generate API keys" }, { status: 403 });
        }

        // Generate new key
        const newApiKey = "TK_MW_" + crypto.randomBytes(24).toString("hex");

        user.apiKey = newApiKey;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "API key generated successfully",
            apiKey: newApiKey,
        });

    } catch (err) {
        return NextResponse.json({ success: false, message: "Failed to generate API key" }, { status: 500 });
    }
}
