import { connectDB } from "@/lib/mongodb";
import SupportQuery from "@/models/SupportQuery";
import jwt from "jsonwebtoken";

/* ================= AUTH (ADMIN ONLY) ================= */
function verifyAdmin(req) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
        throw { status: 401, message: "Unauthorized" };
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "admin" && decoded.userType !== "owner") {
        throw { status: 403, message: "Forbidden" };
    }

    return decoded;
}

export async function GET(req) {
    try {
        await connectDB();
        verifyAdmin(req);

        /* ================= STATS ================= */
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [stats, totalQueries] = await Promise.all([
            SupportQuery.aggregate([
                {
                    $facet: {
                        // Volume
                        v1d: [{ $match: { createdAt: { $gte: oneDayAgo } } }, { $count: "count" }],
                        v7d: [{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $count: "count" }],
                        v30d: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $count: "count" }],

                        // Status
                        open: [{ $match: { status: "open" } }, { $count: "count" }],
                        progress: [{ $match: { status: "in_progress" } }, { $count: "count" }],
                        resolved: [{ $match: { status: "resolved" } }, { $count: "count" }],
                    }
                }
            ]),
            SupportQuery.countDocuments({})
        ]);

        const dashboardStats = {
            v1d: stats[0]?.v1d[0]?.count || 0,
            v7d: stats[0]?.v7d[0]?.count || 0,
            v30d: stats[0]?.v30d[0]?.count || 0,
            open: stats[0]?.open[0]?.count || 0,
            progress: stats[0]?.progress[0]?.count || 0,
            resolved: stats[0]?.resolved[0]?.count || 0,
            totalQueries: totalQueries,
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
