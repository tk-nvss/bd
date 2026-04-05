import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch last 5 orders created via API for this user
        const orders = await Order.find({
            userId: decoded.userId,
            orderId: { $regex: /^API_/ } // Orders starting with API_
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("orderId itemName playerId price status createdAt");

        return NextResponse.json({
            success: true,
            orders
        });

    } catch (err) {
        return NextResponse.json({ success: false, message: "Failed to fetch usage history" }, { status: 500 });
    }
}
