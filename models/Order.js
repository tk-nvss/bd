import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, index: true },

    gameSlug: String,
    itemSlug: String,
    itemName: String,
    playerId: String,
    zoneId: String,
    paymentMethod: String,
    price: Number,
    email: String,
    phone: String,
    status: {
      type: String,
      enum: [
        "pending", "success", "failed", "refund",
        "PENDING", "SUCCESS", "FAILED", "REFUND"
      ],
      default: "pending"
    },
    // ✅ NEW: Top-up status
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refund"],
      default: "pending",
    },

    /* ================= TOP-UP STATUS ================= */
    topupStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refund"],
      default: "pending",
    },
    isManual: { type: Boolean, default: false },
    expiresAt: Date,

    /* ================= API SPECIFIC ================= */
    idempotencyKey: { type: String, sparse: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
