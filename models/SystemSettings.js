import mongoose from "mongoose";

const SystemSettingsSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.SystemSettings || mongoose.model("SystemSettings", SystemSettingsSchema);
