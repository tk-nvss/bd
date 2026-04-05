import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
    try {
        await connectDB();

        /* ================= AUTH ================= */
        const auth = req.headers.get("authorization");
        if (!auth?.startsWith("Bearer "))
            return Response.json({ message: "Unauthorized" }, { status: 401 });

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType !== "owner")
            return Response.json({ message: "Forbidden" }, { status: 403 });

        /* ================= STATS ================= */
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [totalUsers, stats, userStats] = await Promise.all([
            User.countDocuments({}),
            User.aggregate([
                { $group: { _id: null, totalWallet: { $sum: "$wallet" } } }
            ]),
            User.aggregate([
                {
                    $facet: {
                        newSignins: [{ $match: { createdAt: { $gte: oneDayAgo } } }, { $count: "count" }],
                        newSignins7d: [{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $count: "count" }],
                        last1d: [{ $match: { lastLogin: { $gte: oneDayAgo } } }, { $count: "count" }],
                        last7d: [{ $match: { lastLogin: { $gte: sevenDaysAgo } } }, { $count: "count" }],
                        last30d: [{ $match: { lastLogin: { $gte: thirtyDaysAgo } } }, { $count: "count" }],
                    }
                }
            ])
        ]);

        const dashboardStats = {
            newSignins: userStats[0]?.newSignins[0]?.count || 0,
            newSignins7d: userStats[0]?.newSignins7d[0]?.count || 0,
            active1d: userStats[0]?.last1d[0]?.count || 0,
            active7d: userStats[0]?.last7d[0]?.count || 0,
            active30d: userStats[0]?.last30d[0]?.count || 0,
            totalUsers: totalUsers,
            totalWalletCredit: stats[0]?.totalWallet || 0,
        };

        return Response.json({
            success: true,
            stats: dashboardStats,
        });
    } catch (err) {
        console.error(err);
        return Response.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
