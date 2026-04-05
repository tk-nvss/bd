import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";
import jwt from "jsonwebtoken";

export async function GET() {
    try {
        await connectDB();
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({ maintenanceMode: false });
        }
        return Response.json({ success: true, settings });
    } catch (error) {
        console.error("GET SETTINGS ERROR:", error);
        return Response.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();

        // AUTH
        const auth = req.headers.get("authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Only OWNER can change settings
        if (decoded.userType !== "owner") {
            return Response.json({ message: "Forbidden" }, { status: 403 });
        }

        const { maintenanceMode } = await req.json();

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings({ maintenanceMode });
        } else {
            settings.maintenanceMode = maintenanceMode;
            settings.updatedAt = new Date();
        }

        await settings.save();

        return Response.json({ success: true, settings });
    } catch (error) {
        console.error("PATCH SETTINGS ERROR:", error);
        return Response.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
