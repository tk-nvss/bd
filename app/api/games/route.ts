import { NextResponse } from "next/server";

/* ================= IMAGES ================= */
const MLBB_MAIN_IMAGE = "/game-assets/mlbb-bd.png";
const MLBB_SMALL_IMAGE = "/game-assets/mlbb-small.png";
const MLBB_SG_MY_IMAGE = "/game-assets/mlbb-sg.png";
const MLBB_GLOBAL_IMAGE = "/game-assets/mlbb-globbal.png";
const MLBB_INDO = "/game-assets/mlbb-indo.png";
const MLBB_BUNDLE = "/game-assets/mlbb-bd.png";

/* ================= OTT SECTION ================= */
const OTTS = [
  {
    name: "YouTube Premium",
    slug: "youtube-premium",
    image: "/ott/youtube.webp",
    category: "OTT",
    available: true,
  },
  {
    name: "Netflix",
    slug: "netflix",
    image: "/ott/netflix.webp",
    category: "OTT",
    available: true,
  },
];
/* ================= MEMBERSHIP SECTION ================= */
const MEMBERSHIPS = [
  {
    name: "Silver Membership",
    slug: "silver-membership",
    image: "/membership/silver-m.png",
    type: "silver",
    category: "Membership",
    available: true,
  },
  // {
  //   name: "Reseller Membership",
  //   slug: "reseller-membership",
  //   image: "/membership/reseller-m.png",
  //   type: "reseller",
  //   category: "Membership",
  //   available: true,
  // },
];


/* ================= API ================= */
export async function GET() {
  try {
    const response = await fetch("https://game-off-ten.vercel.app/api/v1/game", {
      method: "GET",
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
      cache: "no-store",
    });

    const data = await response.json();

    /* ================= NORMALIZE GAME ================= */
    const normalizeGame = (game: any) => {
      let updatedGame = { ...game };

      // Rename MLBB SMALL/PHP → MLBB SMALL
      // if (updatedGame.gameName === "MLBB SMALL/PHP") {
      //   updatedGame.gameName = "MLBB SMALL";
      // }

      // Fix wrong publisher spelling
      if (updatedGame.gameFrom === "Moneyton") {
        updatedGame.gameFrom = "Moonton";
      }

      // categorization logic
      const isMLBB =
        updatedGame.gameName?.toLowerCase().includes("mobile legends") ||
        updatedGame.gameFrom?.toLowerCase().includes("moonton") ||
        updatedGame.gameSlug?.toLowerCase().includes("mlbb");

      updatedGame.storeCategory = isMLBB ? "MLBB" : "OTHERS";

      // Replace Mobile Legends main image
      if (updatedGame.gameSlug === "mobile-legends988" || updatedGame.gameSlug === "india-mlbb") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_MAIN_IMAGE,
        };
      }

      // Replace SG/MY MLBB image
      if (updatedGame.gameSlug === "sgmy-mlbb893") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_SG_MY_IMAGE,
        };
      }
      if (updatedGame.gameSlug === "mlbbglobal202") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_GLOBAL_IMAGE,
        };
      }
      if (updatedGame.gameSlug === "mlbb-indo42") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_INDO,
        };
      }

      // Replace MLBB SMALL image
      if (updatedGame.gameSlug === "mlbb-smallphp980") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_SMALL_IMAGE,
        };
      }

      if (updatedGame.gameSlug === "weeklymonthly-bundle931") {
        updatedGame.gameImageId = {
          ...updatedGame.gameImageId,
          image: MLBB_BUNDLE,
        };
      }
      return updatedGame;
    };

    /* ================= ALLOWED SLUGS ================= */
    const ALLOWED_SLUGS = [
      "mobile-legends988",
      "mlbb-double332",
      "sgmy-mlbb893",
      "magic-chess-gogo-india924",
      "mlbb-indo42",
      "mlbbtr112",
      "mlbbglobal202",
      // "mlbb-russia953",
      // "pubg-mobile138",
      // "genshin-impact742",
      // "honor-of-kings57",
      "wuthering-of-waves464",
      "where-winds-meet280",
      "mlbb-smallphp980",
      "weeklymonthly-bundle931"
    ];

    const filteredGames = [
      ...(data?.data?.games || [])
        .filter((game: any) => ALLOWED_SLUGS.includes(game.gameSlug))
        .map(normalizeGame),
    ];

    /* ================= FILTER CATEGORY GAMES ================= */
    const filteredCategories =
      data?.data?.category?.map((cat: any) => ({
        ...cat,
        gameId:
          cat.gameId
            ?.filter((game: any) => ALLOWED_SLUGS.includes(game.gameSlug))
            ?.map(normalizeGame) || [],
      })) || [];

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      data: {
        games: filteredGames,
        category: filteredCategories,
        totalGames: filteredGames.length,

        // 🔥 EXTRA CATEGORIES
        otts: {
          title: "Streaming Subscriptions",
          items: OTTS.filter((o) => o.available),
          total: OTTS.filter((o) => o.available).length,
        },
        memberships: {
          title: "Premium Memberships",
          items: MEMBERSHIPS.filter((m) => m.available),
          total: MEMBERSHIPS.filter((m) => m.available).length,
        },
      },
    });
  } catch (error) {
    console.error("GAME API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch game list",
      },
      { status: 500 }
    );
  }
}
