import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import PricingConfig from "@/models/PricingConfig";
import crypto from "crypto";

/* =====================================================
   TYPES
===================================================== */

type MembershipConfig = {
  items: Record<string, number>;
};

type OTTConfig = Record<string, number>;

/* =====================================================
   STATIC PRICING (SERVER TRUSTED)
===================================================== */

const MEMBERSHIPS: Record<string, MembershipConfig> = {
  "silver-membership": {
    items: {
      "silver-1m": 99,
      "silver-3m": 299,
    },
  },
  "reseller-membership": {
    items: {
      "reseller-1m": 99,
      "reseller-3m": 299,
    },
  },
};

const OTTS: Record<string, OTTConfig> = {
  "youtube-premium": {
    "yt-1m": 30,
    "yt-3m": 90,
  },
  netflix: {
    "nf-1m": 99,
    "nf-3m": 249,
  },
  instagram: {
    "ig-1k": 249,
    "ig-5k": 1099,
  },
};

// Role-based manual game pricing
// member → cheapest  |  admin/user → slightly higher
const MANUAL_GAMES: Record<string, Record<string, Record<string, number>>> = {
  "bgmi-manual": {
    member: {
      "bgmi-60": 70,
      "bgmi-325": 353,
      "bgmi-660": 697,
      "bgmi-1800": 1767,
      "bgmi-3850": 3584,
      "bgmi-8100": 7100,
    },
    admin: {
      "bgmi-60": 71,
      "bgmi-325": 365,
      "bgmi-660": 710,
      "bgmi-1800": 1810,
      "bgmi-3850": 3600,
      "bgmi-8100": 7200,
    },
    user: {
      "bgmi-60": 73,
      "bgmi-325": 365,
      "bgmi-660": 720,
      "bgmi-1800": 1800,
      "bgmi-3850": 3650,
      "bgmi-8100": 7200,
    },
  },
};

/* =====================================================
   PRICE RESOLVER
===================================================== */

async function resolvePrice(
  gameSlug: string,
  itemSlug: string,
  userType: string
): Promise<number> {
  // MEMBERSHIPS
  if (MEMBERSHIPS[gameSlug]) {
    const price = MEMBERSHIPS[gameSlug].items[itemSlug];
    if (!price) throw new Error("Invalid membership item");
    return price;
  }

  // OTTS
  if (OTTS[gameSlug]) {
    const price = OTTS[gameSlug][itemSlug];
    if (!price) throw new Error("Invalid OTT item");
    return price;
  }

  // MANUAL GAMES (role-based pricing)
  if (MANUAL_GAMES[gameSlug]) {
    // owner gets member price; fallback to 'user' tier if role not found
    const tier =
      userType === "owner" || userType === "member"
        ? "member"
        : userType === "admin"
          ? "admin"
          : "user";
    const tierPrices = MANUAL_GAMES[gameSlug][tier] ?? MANUAL_GAMES[gameSlug]["user"];
    const price = tierPrices?.[itemSlug];
    if (!price) throw new Error("Invalid manual game item");
    return price;
  }

  // GAMES
  const resp = await fetch(
    `https://game-off-ten.vercel.app/api/v1/game/${gameSlug}`,
    {
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
    }
  );

  const data = await resp.json();
  if (!data?.data?.itemId) throw new Error("Game not found");

  const baseItem = data.data.itemId.find(
    (i: any) => i.itemSlug === itemSlug
  );

  if (!baseItem) throw new Error("Invalid game item");

  let price = Number(baseItem.sellingPrice);

  if (userType !== "owner") {
    await connectDB();
    const pricingConfig = await PricingConfig.findOne({ userType }).lean();

    if (pricingConfig) {
      const fixed = pricingConfig.overrides?.find(
        (o: any) =>
          o.gameSlug === gameSlug && o.itemSlug === itemSlug
      );

      if (fixed?.fixedPrice != null) {
        price = Number(fixed.fixedPrice);
      } else if (pricingConfig.slabs?.length) {
        const slab = pricingConfig.slabs.find(
          (s: any) => price >= s.min && price < s.max
        );
        if (slab) price = price * (1 + slab.percent / 100);
      }
    }
  }

  return Math.ceil(price);
}

/* =====================================================
   CREATE ORDER API
===================================================== */

export async function POST(req: Request) {
  try {
    await connectDB();

    /* ---------- AUTH (JWT) ---------- */
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

    const userId = decoded.userId || null;
    const userType = decoded.userType || "user";

    /* ---------- BODY ---------- */
    const body = await req.json();
    console.log("CREATE GATEWAY ORDER REQUEST:", { ...body, userId, userType });

    const {
      gameSlug,
      itemSlug,
      itemName,
      playerId,
      zoneId,
      paymentMethod,
      email,
      phone,
      currency = "INR",
    } = body;

    if (
      !gameSlug ||
      !itemSlug ||
      !playerId ||
      !zoneId ||
      !paymentMethod
    ) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Provide email or phone",
      });
    }

    /* ---------- SERVER PRICE ---------- */
    const price = await resolvePrice(gameSlug, itemSlug, userType);
    console.log("RESOLVED PRICE:", { gameSlug, itemSlug, userType, price });

    /* ---------- ORDER ID ---------- */
    const orderId =
      "BDTK" +
      Date.now().toString(36) +
      crypto.randomBytes(8).toString("hex");

    const expiresAt = new Date(Date.now() + 90 * 1000);

    /* ---------- CREATE ORDER ---------- */
    const isManual = gameSlug?.endsWith("-manual");

    const newOrder = await Order.create({
      orderId,
      userId,
      gameSlug,
      itemSlug,
      itemName,
      playerId,
      zoneId,
      paymentMethod,
      price,
      email: email || null,
      phone: phone || null,
      currency,
      status: "pending",
      paymentStatus: "pending",
      topupStatus: "pending",
      isManual: isManual || false,
      expiresAt,
    });

    console.log("ORDER CREATED IN DB:", { orderId, isManual, price });

    /* ---------- WALLET PAYMENT LOGIC ---------- */
    if (paymentMethod === "wallet") {
      if (userType !== "user" && userType !== "member" && userType !== "owner" && userType !== "admin") {
        return NextResponse.json({
          success: false,
          message: "Wallet payment is only available for admins, members, owners and users.",
        });
      }

      const User = (await import("@/models/User")).default;
      const WalletTransaction = (await import("@/models/WalletTransaction")).default;

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" });
      }

      if ((user.wallet || 0) < price) {
        return NextResponse.json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      const balanceBefore = user.wallet || 0;
      const balanceAfter = balanceBefore - price;

      // Deduct balance
      user.wallet = balanceAfter;
      await user.save();

      // Mark order as success
      newOrder.paymentStatus = "success";
      newOrder.status = "pending";
      await newOrder.save();
      console.log("WALLET PAYMENT SUCCESSFUL:", { orderId, userId, price });

      // Create transaction log
      await WalletTransaction.create({
        transactionId: `WAL-${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}`,
        userId,
        type: "payment",
        amount: price,
        balanceBefore,
        balanceAfter,
        status: "success",
        paymentMethod: "wallet",
        description: `Wallet Order: ${itemName} for ${playerId}`,
        orderId: orderId,
      });

      return NextResponse.json({
        success: true,
        orderId,
        message: "Payment successful via wallet. Processing topup...",
        paidViaWallet: true,
      });
    }

    /* ---------- PAYMENT GATEWAY (ZiniPay V1 API) ---------- */
    const ziniApiKey = process.env.XTRA_USER_TOKEN!;

    const ziniPayload = {
      cus_name: decoded.userName || "Customer",
      cus_email: email,
      amount: String(price),
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URLU}/payment/topup-complete`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URLU}/`,
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URLU}/api/webhook`,
      metadata: {
        orderId: orderId,
        phone: phone || "",
      },
    };

    const resp = await fetch("https://api.zinipay.com/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": ziniApiKey,
      },
      body: JSON.stringify(ziniPayload),
    });

    const data = await resp.json();
    console.log("ZINIPAY CREATE RESPONSE:", data);

    // ✅ Always save the gateway response for debugging/tracing
    newOrder.gatewayResponse = data;
    if (data.invoiceId) {
      newOrder.gatewayOrderId = data.invoiceId;
    }
    await newOrder.save();
    console.log("ORDER UPDATED WITH GATEWAY DATA:", { orderId, success: data.status, invoiceId: data.invoiceId });

    if (!data?.status) {
      return NextResponse.json({
        success: false,
        message: data?.message || "Payment gateway error",
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: data.payment_url,
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
