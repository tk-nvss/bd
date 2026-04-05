import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import PricingConfig from "@/models/PricingConfig";

/* ================= IMAGES ================= */
const MLBB_MAIN_IMAGE = "/game-assets/india-mlbb.jpg";
const MLBB_SMALL_IMAGE = "/game-assets/mlbb-small.jpg";
const MLBB_SG_MY_IMAGE = "/game-assets/allregion.jpg";

/* ================= MEMBERSHIP CONFIG ================= */
const MEMBERSHIPS = {
  "silver-membership": {
    gameName: "Silver Membership",
    gameFrom: "Your Platform",
    gameImageId: {
      image: "/membership/silver-m.png",
    },
    gameDescription: "Unlock premium pricing and basic benefits.",
    inputFieldOne: "User Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "silver-1m",
        sellingPrice: 99,
        dummyPrice: 99,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/membership/silver-m.png",
        },
      },
      {
        itemName: "3 Month",
        itemSlug: "silver-3m",
        sellingPrice: 299,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 3,
        itemImageId: {
          image: "/membership/silver-m.png",
        },
      },
    ],
  },

  "reseller-membership": {
    gameName: "Reseller Membership",
    gameFrom: "Your Platform",
    gameImageId: {
      image: "/membership/reseller-m.png",
    },
    gameDescription: "Get reseller pricing, bulk access & dashboard.",
    inputFieldOne: "User Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "reseller-1m",
        sellingPrice: 99,
        dummyPrice: 99,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/membership/reseller-m.png",
        },
      },
      {
        itemName: "3 Month",
        itemSlug: "reseller-3m",
        sellingPrice: 299,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 3,
        itemImageId: {
          image: "/membership/reseller-m.png",
        },
      },
    ],
  },
};

/* ================= OTT CONFIG ================= */
const OTTS = {
  "youtube-premium": {
    gameName: "YouTube Premium",
    gameFrom: "Google",
    gameImageId: {
      image: "/ott/youtube.webp",
    },
    gameDescription: "Ad-free YouTube, background play, YouTube Music.",
    inputFieldOne: "Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "yt-1m",
        sellingPrice: 30,
        dummyPrice: 30,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/youtube.webp",
        },
      },
    ],
  },

  netflix: {
    gameName: "Netflix",
    gameFrom: "Netflix Inc.",
    gameImageId: {
      image: "/ott/netflix.webp",
    },
    gameDescription: "Movies & series streaming subscription.",
    inputFieldOne: "Account Email",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "nf-1m",
        sellingPrice: 99,
        dummyPrice: 99,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/netflix.webp",
        },
      },
    ],
  },
};


/* ================= MANUAL GAMES CONFIG ================= */
// Prices keyed by role tier
const MANUAL_GAME_PRICES = {
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

const MANUAL_GAMES = {
  "bgmi-manual": {
    gameName: "BGMI",
    gameFrom: "Krafton",
    gameImageId: {
      image: "/game-assets/bgmi-logo.webp",
    },
    gameDescription: "Battlegrounds Mobile India Manual Top-up. Safe and Fast.",
    inputFieldOne: "Character ID",
    inputFieldTwo: "Ign (Optional)",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "60 UC",
        itemSlug: "bgmi-60",
        sellingPrice: 70,
        dummyPrice: 70,
        itemAvailablity: true,
        index: 1,
        itemImageId: { image: "/game-assets/bgmi-logo.webp" },
      },
      {
        itemName: "325 UC",
        itemSlug: "bgmi-325",
        sellingPrice: 353,
        dummyPrice: 353,
        itemAvailablity: true,
        index: 2,
        itemImageId: { image: "/game-assets/bgmi-logo.webp" },
      },
      {
        itemName: "660 UC",
        itemSlug: "bgmi-660",
        sellingPrice: 697,
        dummyPrice: 697,
        itemAvailablity: true,
        index: 3,
        itemImageId: { image: "/game-assets/bgmi-logo.webp" },
      },
      {
        itemName: "1800 UC",
        itemSlug: "bgmi-1800",
        sellingPrice: 1767,
        dummyPrice: 1767,
        itemAvailablity: true,
        index: 4,
        itemImageId: { image: "/game-assets/bgmi-logo.webp" },
      },
      {
        itemName: "3850 UC",
        itemSlug: "bgmi-3850",
        sellingPrice: 3584,
        dummyPrice: 3584,
        itemAvailablity: true,
        index: 5,
        itemImageId: { image: "/game-assets/bgmi-logo.webp" },
      },
      {
        itemName: "8100 UC",
        itemSlug: "bgmi-8100",
        sellingPrice: 7100,
        dummyPrice: 7100,
        itemAvailablity: true,
        index: 6,
        itemImageId: { image: "/game-assets/bgmi-logo.webp" },
      },
    ],
  },
};

/* ================= ROLE → PRICING (FIXED) ================= */
const resolvePricingRole = (role) => {
  if (["user", "member", "admin"].includes(role)) return role;
  return null; // owner → base price
};

/* ================= API ================= */
export async function GET(req, { params }) {
  const { slug } = await params;

  try {
    /* ===== STATIC PRODUCTS ===== */
    if (OTTS[slug]) {
      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...OTTS[slug] },
      });
    }

    if (MEMBERSHIPS[slug]) {
      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...MEMBERSHIPS[slug] },
      });
    }

    if (MANUAL_GAMES[slug]) {
      // Read JWT so we can apply role-based pricing
      let manualUserType = "user";
      const manualAuth = req.headers.get("authorization");
      if (manualAuth?.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(
            manualAuth.split(" ")[1],
            process.env.JWT_SECRET
          );
          if (decoded?.userType) manualUserType = decoded.userType;
        } catch { }
      }

      // Resolve tier: owner & member get cheapest, admin/user get higher
      const manualTier =
        manualUserType === "owner" || manualUserType === "member"
          ? "member"
          : manualUserType === "admin"
            ? "admin"
            : "user";

      const tierPrices = MANUAL_GAME_PRICES[slug]?.[manualTier]
        ?? MANUAL_GAME_PRICES[slug]?.["user"];

      const gameData = {
        ...MANUAL_GAMES[slug],
        itemId: MANUAL_GAMES[slug].itemId.map((item) => ({
          ...item,
          sellingPrice: tierPrices?.[item.itemSlug] ?? item.sellingPrice,
        })),
      };

      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...gameData },
      });
    }

    /* ===== OPTIONAL AUTH ===== */
    let userType = "user";
    const auth = req.headers.get("authorization");

    if (auth?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          auth.split(" ")[1],
          process.env.JWT_SECRET
        );
        if (decoded?.userType) userType = decoded.userType;
      } catch { }
    }

    const pricingRole = resolvePricingRole(userType);

    /* ===== FETCH BASE GAME ===== */
    const response = await fetch(
      `https://game-off-ten.vercel.app/api/v1/game/${slug}`,
      {
        headers: { "x-api-key": process.env.API_SECRET_KEY },
      }
    );

    const data = await response.json();
    if (!data?.data?.itemId) return NextResponse.json(data);

    /* ===== FETCH PRICING ===== */
    await connectDB();

    let pricingConfig = null;
    if (pricingRole) {
      pricingConfig = await PricingConfig.findOne({
        userType: pricingRole,
      }).lean();
    }

    /* ===== APPLY PRICING ===== */
    /* ===== APPLY IMAGE OVERRIDES ===== */
    const gameSlug = data.data.gameSlug;
    if (gameSlug === "mobile-legends988" || gameSlug === "india-mlbb") {
      data.data.gameImageId = { ...data.data.gameImageId, image: MLBB_MAIN_IMAGE };
    }
    if (gameSlug === "sgmy-mlbb893") {
      data.data.gameImageId = { ...data.data.gameImageId, image: MLBB_SG_MY_IMAGE };
    }
    if (data.data.gameName === "MLBB SMALL/PHP" || data.data.gameName === "MLBB SMALL") {
      data.data.gameImageId = { ...data.data.gameImageId, image: MLBB_SMALL_IMAGE };
    }

    data.data.itemId = data.data.itemId
      .filter((item) => {
        if (data.data.gameName === "MLBB SMALL/PHP") {
          const price = Number(item.sellingPrice);
          if (item.itemName === "Weekly Pass") return false;
          if (price > 170) return false;
        }
        return true;
      })
      .map((item) => {
        const basePrice = Number(item.sellingPrice);
        let finalPrice = basePrice;

        const override = pricingConfig?.overrides?.find(
          (o) =>
            o.gameSlug === gameSlug &&
            o.itemSlug === item.itemSlug
        );

        if (override?.fixedPrice != null) {
          finalPrice = override.fixedPrice;
        } else {
          const slab = pricingConfig?.slabs?.find(
            (s) => basePrice >= s.min && basePrice < s.max
          );
          if (slab) {
            finalPrice = basePrice * (1 + slab.percent / 100);
          }
        }

        return {
          ...item,
          sellingPrice: Math.ceil(finalPrice),
        };
      });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Game Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
