"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";

import logo from "@/public/logo.png";
import Loader from "@/components/Loader/Loader";

const MLBBPurchaseGuide = dynamic(() => import("../../../components/HelpImage/MLBBPurchaseGuide"), { ssr: false });
const ItemGrid = dynamic(() => import("@/components/GameDetail/ItemGrid"), { ssr: true });
const BuyPanel = dynamic(() => import("@/components/GameDetail/BuyPanel"), { ssr: true });
const ItemGridBgmi = dynamic(() => import("@/components/GameDetail/ItemGridBgmi"), { ssr: true });
const BuyPanelBgmi = dynamic(() => import("@/components/GameDetail/BuyPanelBgmi"), { ssr: true });

export default function GameDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const buyPanelRef = useRef(null);

  const [game, setGame] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  /* ================= FETCH ALL GAMES ================= */
  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        setAllGames(data?.data?.games || []);
      });
  }, []);

  /* ================= FETCH CURRENT GAME ================= */
  const isBGMI =
    game?.gameName?.toLowerCase() === "pubg mobile" || game?.gameName?.toLowerCase() === "bgmi";

  /* ================= FETCH GAME ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = [...(data?.data?.itemId || [])].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );

        setGame({
          ...data.data,
          allItems: items,
        });

        setActiveItem(items[0] || null);
      });
  }, [slug]);

  /* ================= LOADING ================= */
  if (!game || !activeItem) {
    return <Loader />;
  }

  /* ================= BUY HANDLER ================= */
  const goBuy = (item) => {
    if (redirecting) return;
    setRedirecting(true);

    const query = new URLSearchParams({
      name: item.itemName,
      price: item.sellingPrice?.toString() || "",
      dummy: item.dummyPrice?.toString() || "",
      image: item.itemImageId?.image || "",
    });

    // router.push(
    //   `/games/${slug}/buy/${item.itemSlug}?${query.toString()}`
    // );

    const isBGMI =
      game?.gameName?.toLowerCase() === "pubg mobile" || game?.gameName?.toLowerCase() === "bgmi";

    const basePath = isBGMI
      ? `/games/pubg/${slug}/buy`
      : `/games/${slug}/buy`;

    router.push(
      `${basePath}/${item.itemSlug}?${query.toString()}`
    );
  };

  return (
    <section className="min-h-screen bg-transparent text-[var(--foreground)] px-4 py-6">

      {/* ================= PREMIUM GAME SWITCHER HUD ================= */}
      <div className="max-w-6xl mx-auto mb-6 relative group">
        {/* Decorative Grid Accents */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between px-2 opacity-20 pointer-events-none">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-red-600 shadow-[0_0_8px_red]" />
            <div className="w-4 h-1 bg-white/10" />
          </div>
          <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">SEC-NAV // 001</span>
        </div>
 
        <div className="relative rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-1 overflow-hidden shadow-2xl">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-0 bg-[length:100%_4px] pointer-events-none opacity-20" />
 
          {/* Scroll Fade Gradients */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />
 
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar relative z-10 scroll-smooth">
            <div className="flex-shrink-0 w-4" /> {/* Spacer for gradient */}
            {allGames.map((g) => {
              const isActive = g.gameSlug === slug;
              return (
                <button
                  key={g.gameSlug}
                  onClick={() => router.push(`/games/${g.gameSlug}`)}
                  className={`
                    relative flex-shrink-0 flex flex-col items-center gap-1 group/btn
                    p-1 min-w-[64px] rounded-lg transition-all duration-300
                    ${isActive
                      ? "bg-red-600/10 scale-105"
                      : "hover:bg-white/5"}
                  `}
                >
                  {/* Image Container with Tactical Border */}
                  <div className={`
                    relative w-10 h-10 rounded-lg overflow-hidden border transition-all duration-500
                    ${isActive
                      ? "border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                      : "border-white/10 grayscale group-hover/btn:grayscale-0 group-hover/btn:border-red-600/50"}
                  `}>
                    <Image
                      src={g.gameImageId?.image || logo}
                      alt={g.gameName}
                      fill
                      className="object-cover"
                    />
                    {/* Active Scan Effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-x-0 h-px bg-white/50 z-20"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>
 
                  {/* Label */}
                  <div className="flex flex-col items-center">
                    <span className={`
                      text-[8px] font-black uppercase tracking-tight transition-colors duration-300
                      ${isActive ? "text-red-500" : "text-[var(--muted)] group-hover/btn:text-white"}
                    `}>
                      {g.gameName === "PUBG Mobile" ? "BGMI" : g.gameName}
                    </span>
                  </div>
                </button>
              );
            })}
            <div className="flex-shrink-0 w-4" /> {/* Spacer for gradient */}
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-4">
        <div className="w-14 h-14 relative rounded-lg overflow-hidden">
          <Image
            src={game?.gameImageId?.image || logo}
            alt={game?.gameName || "Game"}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold">
            {/* {game?.gameName} */}
            {isBGMI ? "BGMI" : game?.gameName}
          </h1>
          <p className="text-xs text-[var(--muted)]">
            {game?.gameFrom}
          </p>
        </div>
      </div>

      {/* ================= ITEM GRID ================= */}
      {isBGMI ? (
        <ItemGridBgmi
          items={game.allItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          buyPanelRef={buyPanelRef}
        />
      ) : (
        <ItemGrid
          items={game.allItems}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          buyPanelRef={buyPanelRef}
        />

      )}

      {/* ================= BUY PANEL ================= */}
      {isBGMI ? (
        <BuyPanelBgmi
          activeItem={activeItem}
          onBuy={goBuy}
          redirecting={redirecting}
          buyPanelRef={buyPanelRef}
        />
      ) : (
        <BuyPanel
          activeItem={activeItem}
          onBuy={goBuy}
          redirecting={redirecting}
          buyPanelRef={buyPanelRef}
        />
      )}


    </section>
  );
}
