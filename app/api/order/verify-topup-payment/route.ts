import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    /* =====================================================
       AUTH (JWT)
    ===================================================== */
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET!
      );
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const tokenUserId = decoded.userId;

    /* =====================================================
       REQUEST BODY
    ===================================================== */
    const body = await req.json();
    const { orderId } = body;
    console.log("VERIFYING ORDER:", orderId);

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({
        success: false,
        message: "Invalid or missing orderId",
      }, { status: 400 });
    }

    /* =====================================================
       FETCH ORDER
    ===================================================== */
    const order = await Order.findOne({ orderId });

    if (!order) {
      console.log("ORDER NOT FOUND:", orderId);
      return NextResponse.json({
        success: false,
        message: "Order not found",
      });
    }

    /* =====================================================
       🔒 OWNERSHIP CHECK (CRITICAL)
    ===================================================== */
    if (order.userId && order.userId !== tokenUserId) {
      console.warn("OWNERSHIP MISMATCH:", { orderId, orderUserId: order.userId, tokenUserId });
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Already completed → safe exit
    if (order.status === "success") {
      console.log("ORDER ALREADY SUCCESSFUL:", orderId);
      return NextResponse.json({
        success: true,
        message: "Already processed",
        topupResponse: order.externalResponse,
      });
    }

    // Identify manual games
    const isManual = order.isManual;

    /* =====================================================
       AUTO-FAIL / EXPIRE CHECK (90 SECONDS TIMEOUT)
    ===================================================== */
    const timeSinceCreation = Date.now() - new Date(order.createdAt).getTime();

    // If order is more than 90 seconds old and still not marked success...
    // SKIP FOR MANUAL GAMES (they wait for admin)
    if (!isManual && timeSinceCreation > 90 * 1000 && order.status === "pending") {
      console.log("ORDER TIMEOUT (90s):", orderId);
      order.status = "failed";
      // We don't mark paymentStatus as failed yet because they might have paid
      // but the topup failed to trigger within the window.
      if (order.topupStatus === "pending") {
        order.topupStatus = "failed";
      }
      await order.save();

      return NextResponse.json({
        success: false,
        message: "Order verification timeout (90s). Please contact support if amount was deducted.",
      });
    }

    // Traditional expiry check (safety fallback)
    if (!isManual && order.expiresAt && Date.now() > order.expiresAt.getTime()) {
      console.log("ORDER EXPIRED:", orderId);
      order.status = "failed";
      order.paymentStatus = "failed";
      await order.save();

      return NextResponse.json({
        success: false,
        message: "Order expired",
      });
    }

    /* =====================================================
       CHECK GATEWAY STATUS / WALLET STATUS (ZiniPay V1)
    ===================================================== */
    const { invoiceId: bodyInvoiceId } = body;
    const invoiceId = bodyInvoiceId || order.gatewayOrderId;

    if (order.paymentMethod === "wallet") {
      console.log("PROCESSING WALLET PAYMENT FOR:", orderId);
      // Wallet payments are verified during creation
      if (order.paymentStatus !== "success") {
        return NextResponse.json({
          success: false,
          message: "Wallet payment not completed",
        });
      }
    } else {
      if (!invoiceId) {
        console.error("INVOICE ID MISSING:", orderId);
        return NextResponse.json({
          success: false,
          message: "Invoice ID missing for verification",
        });
      }

      const ziniApiKey = process.env.XTRA_USER_TOKEN!;
      console.log("VERIFYING WITH ZINIPAY:", { invoiceId, orderId });
      
      const resp = await fetch("https://api.zinipay.com/v1/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "zini-api-key": ziniApiKey,
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          apiKey: ziniApiKey,
        }),
      });

      const data = await resp.json();
      console.log("ZINIPAY VERIFY RESPONSE:", data);
      const txnStatus = data?.status; // ZiniPay V1 uses 'status' top-level

      /* =====================================================
         PAYMENT STATES
      ===================================================== */
      if (txnStatus === "PENDING" || txnStatus === "INITIATED") {
        return NextResponse.json({
          success: false,
          message: "Payment pending, please wait",
        });
      }

      if (txnStatus !== "SUCCESS" && txnStatus !== "COMPLETED") {
        console.log("PAYMENT FAILED STATUS:", { orderId, txnStatus });
        order.status = "failed";
        order.paymentStatus = "failed";
        order.gatewayResponse = data;
        await order.save();

        return NextResponse.json({
          success: false,
          message: "Payment failed (" + (data.message || txnStatus) + ")",
        });
      }

      /* =====================================================
         STRICT PRICE CHECK
      ===================================================== */
      const paidAmount = Number(data?.amount || data?.data?.amount);
      console.log("PRICE CHECK:", { orderId, expected: order.price, paid: paidAmount });

      if (!paidAmount || Math.abs(paidAmount - Number(order.price)) > 1) {
        console.error("FRAUD ALERT: PRICE MISMATCH", { orderId, expected: order.price, paid: paidAmount });
        order.status = "fraud";
        order.paymentStatus = "failed";
        order.topupStatus = "failed";
        order.gatewayResponse = data;
        await order.save();

        return NextResponse.json({
          success: false,
          message: "Payment amount mismatch detected",
        });
      }

      order.paymentStatus = "success";
      order.gatewayResponse = data;
      // Also save invoiceId if it was first seen here
      if (!order.gatewayOrderId) order.gatewayOrderId = invoiceId;
      await order.save();
      console.log("PAYMENT VERIFIED SUCCESS:", orderId);
    }

    /* =====================================================
       TOPUP (IDEMPOTENT)
    ===================================================== */
    if (order.topupStatus === "success") {
      return NextResponse.json({
        success: true,
        message: "Topup already completed",
        topupResponse: order.externalResponse,
      });
    }

    // 🕊️ MANUAL TOP-UP BYPASS
    if (isManual) {
      console.log("MANUAL TOPUP DETECTED, BYPASSING AUTO-TOPUP:", orderId);
      // Order stays in PENDING status for admin to process
      // paymentStatus is already 'success' from previous check
      return NextResponse.json({
        success: true,
        message: "Payment received! Your manual top-up will be processed shortly.",
        isManual: true,
      });
    }

    const productId = `${order.gameSlug}_${order.itemSlug}`;
    console.log("REQUESTING AUTO-TOPUP:", { 
      orderId, 
      playerId: order.playerId, 
      zoneId: order.zoneId, 
      productId 
    });

    const gameResp = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api-service/order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_SECRET_KEY!,
        },
        body: JSON.stringify({
          playerId: String(order.playerId),
          zoneId: String(order.zoneId),
          productId: productId,
          currency: "USD",
        }),
      }
    );

    const gameData = await gameResp.json();
    console.log("TOPUP API RESPONSE:", gameData);
    order.externalResponse = gameData;

    const topupSuccess =
      gameResp.ok &&
      (gameData?.success === true ||
        gameData?.status === true ||
        gameData?.result?.status === "SUCCESS");

    if (topupSuccess) {
      console.log("TOPUP SUCCESS:", orderId);
      order.status = "success";
      order.topupStatus = "success";
      await order.save();
    } else {
      console.error("TOPUP FAILED:", { orderId, gameData });
      order.status = "failed";
      order.topupStatus = "failed";
      await order.save();
    }

    return NextResponse.json({
      success: order.status === "success",
      message:
        order.status === "success"
          ? "Topup successful"
          : "Topup failed",
      topupResponse: gameData,
    });
  } catch (error: any) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
