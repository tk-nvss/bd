import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

/* =========================
   AUTH HELPER
========================= */
function verifyOwner(req) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
        throw { status: 401, message: "Unauthorized" };
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "owner") {
        throw { status: 403, message: "Forbidden" };
    }

    return decoded;
}

export async function GET(req) {
    try {
        await connectDB();
        verifyOwner(req);

        /* ================= STATS ================= */
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [orderStats, totalOrders] = await Promise.all([
            Order.aggregate([
                {
                    $facet: {
                        // Counts
                        new1d: [{ $match: { createdAt: { $gte: oneDayAgo } } }, { $count: "count" }],
                        new7d: [{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $count: "count" }],
                        new30d: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $count: "count" }],
                        pending: [{ $match: { status: "pending" } }, { $count: "count" }],

                        // Revenue (Only successful orders)
                        rev1d: [
                            { $match: { status: "success", createdAt: { $gte: oneDayAgo } } },
                            { $group: { _id: null, total: { $sum: "$price" } } }
                        ],
                        rev7d: [
                            { $match: { status: "success", createdAt: { $gte: sevenDaysAgo } } },
                            { $group: { _id: null, total: { $sum: "$price" } } }
                        ],
                        rev30d: [
                            { $match: { status: "success", createdAt: { $gte: thirtyDaysAgo } } },
                            { $group: { _id: null, total: { $sum: "$price" } } }
                        ],
                        revTotal: [
                            { $match: { status: "success" } },
                            { $group: { _id: null, total: { $sum: "$price" } } }
                        ]
                    }
                }
            ]),
            Order.countDocuments({})
        ]);

        const dashboardStats = {
            new1d: orderStats[0]?.new1d[0]?.count || 0,
            new7d: orderStats[0]?.new7d[0]?.count || 0,
            new30d: orderStats[0]?.new30d[0]?.count || 0,
            pending: orderStats[0]?.pending[0]?.count || 0,
            totalOrders: totalOrders,
            revenue1d: orderStats[0]?.rev1d[0]?.total || 0,
            revenue7d: orderStats[0]?.rev7d[0]?.total || 0,
            revenue30d: orderStats[0]?.rev30d[0]?.total || 0,
            revenueTotal: orderStats[0]?.revTotal[0]?.total || 0,
        };

        return Response.json({
            success: true,
            stats: dashboardStats,
        });

    } catch (err) {
        return Response.json(
            { success: false, message: err.message || "Server error" },
            { status: err.status || 500 }
        );
    }
}
