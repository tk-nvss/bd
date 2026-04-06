"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiSearch, FiZap, FiBox, FiActivity, FiGrid, FiTv, FiTrendingUp } from "react-icons/fi";
import dynamic from "next/dynamic";
import logo from "@/public/logo.png";
const GamesFilterModal = dynamic(() => import("@/components/Games/GamesFilterModal"), { ssr: false });

export default function GamesPage() {
  const [category, setCategory] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [otts, setOtts] = useState<any>(null);
  const [memberships, setMemberships] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState<"az" | "za">("az");
  const [hideOOS, setHideOOS] = useState(false);

  /* ================= CONFIG ================= */
  const SPECIAL_MLBB_GAME = "MLBB SMALL";

  const outOfStockGames = [
    "Genshin Impact",
    "Honor Of Kings",
    "TEST 1",
    "Wuthering of Waves",
    "Where Winds Meet"
  ];

  const isOutOfStock = (name: string) =>
    outOfStockGames.includes(name);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        const fetchedOtts = data?.data?.otts || null;
        setOtts(fetchedOtts);
        const fetchedMemberships = data?.data?.memberships || null;
        setMemberships(fetchedMemberships);

        setCategory(data?.data?.category || []);
        setGames(
          (data?.data?.games || []).map((g: any) =>
            g.gameName === "PUBG Mobile"
              ? { ...g, gameName: "PUBG Mobile" }
              : g
          )
        );
      });
  }, []);

  /* ================= ACTIVE FILTER COUNT ================= */
  const activeFilterCount =
    (sort !== "az" ? 1 : 0) +
    (hideOOS ? 1 : 0) +
    (searchQuery ? 1 : 0);

  /* ================= FILTER + SORT + SEARCH ================= */
  const processGames = (list: any[]) => {
    let filtered = [...list];

    if (hideOOS) {
      filtered = filtered.filter(
        (g) => !isOutOfStock(g.gameName)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.gameName.toLowerCase().includes(q) ||
          g.gameFrom?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) =>
      sort === "az"
        ? a.gameName.localeCompare(b.gameName)
        : b.gameName.localeCompare(a.gameName)
    );

    return filtered;
  };

  /* ================= PIN MLBB GAME ================= */
  const injectSpecialGame = (cat: any) => {
    if (
      !cat.categoryTitle
        ?.toLowerCase()
        .includes("mobile legends")
    ) {
      return cat.gameId;
    }

    const specialGame = games.find(
      (g) => g.gameName === SPECIAL_MLBB_GAME
    );

    if (!specialGame) return cat.gameId;

    const withoutDuplicate = cat.gameId.filter(
      (g: any) => g.gameName !== SPECIAL_MLBB_GAME
    );

    return [specialGame, ...withoutDuplicate];
  };

  /* ================= GAME CARD ================= */
  const GameCard = ({ game }: any) => {
    const disabled = isOutOfStock(game.gameName);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={!disabled ? { y: -4, transition: { duration: 0.2, ease: "easeOut" } } : {}}
        className="will-change-transform"
      >
        <Link
          href={disabled ? "#" : `/games/${game.gameSlug}`}
          className={`group relative flex flex-col items-center p-1 rounded-xl
          bg-white/5 backdrop-blur-md 
          border border-white/10 transition-[border-color,box-shadow,transform] duration-300 overflow-hidden
          ${disabled
              ? "opacity-50 grayscale cursor-not-allowed"
              : "hover:border-red-600/60 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]"
            }`}
        >
          {/* IMAGE WRAPPER */}
          <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-black/40 shadow-inner">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              className={`object-cover transition-transform duration-300 ease-out
              ${disabled ? "blur-[2px]" : "group-hover:scale-110"}`}
            />

            {/* HIGH-TECH OVERLAY LAYER */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            {/* TAG */}
            {!disabled && game.tagId && (
              <div className="absolute top-2 left-2 z-20">
                <span
                  className="text-[8px] md:text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-xl inline-flex items-center gap-1"
                  style={{
                    background: game.tagId.tagBackground,
                    color: game.tagId.tagColor,
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  {game.tagId.tagName}
                </span>
              </div>
            )}

            {/* STOCK INDICATOR */}
            {disabled && (
              <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-red-600/90 text-white rounded-lg shadow-2xl border border-red-400/30">
                  OOS
                </span>
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="w-full mt-2 px-1 space-y-0.5 pb-1">
            <h3 className="text-[10px] md:text-[11px] font-black text-[var(--foreground)] line-clamp-2 text-center 
                         min-h-[2.2em] px-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">
              {game.gameName}
            </h3>
            {game.gameFrom && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)]/50 to-transparent" />
                <p className="text-[8px] md:text-[9px] text-[var(--muted)] truncate font-bold uppercase tracking-[0.1em] shrink-0">
                  {game.gameFrom}
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border)]/50 to-transparent" />
              </div>
            )}
          </div>

        </Link>
      </motion.div>
    );
  };

  const SectionHeader = ({ title, count, icon: Icon }: any) => (
    <div className="flex items-center gap-4 mb-8 px-1">
      {/* LEFT LINE */}
      <div className="flex-1 h-[1px] bg-gradient-to-l from-white/10 via-white/5 to-transparent mr-4 opacity-40" />

      <div className="flex flex-col items-center">
        <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,0,0,0.3)]">
          <span className="text-[var(--foreground)]">SELECT</span>
          <span className="text-red-600">GAME</span>
        </h2>

        {count !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.3em]">
              {count} Units Detected
            </p>
          </div>
        )}
      </div>

      {/* RIGHT LINE */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--border)] via-[var(--border)]/20 to-transparent ml-6 opacity-40" />
    </div>
  );

  return (
    <section className="min-h-screen bg-transparent relative overflow-hidden">
      {/* GLOBAL GRID OVERLAY */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none -z-10" />


      {/* AMBIENT EFFECTS REMOVED TO SHOW BODY BACKGROUND */}

      {/* ================= FILTER BAR ================= */}
      <div className="sticky top-0 md:top-[48px] z-40 bg-white/0 backdrop-blur-3xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 md:gap-4">

          {/* SEARCH */}
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH GAMES..."
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-[var(--border)]
                       bg-[var(--card)]/40 backdrop-blur-xl text-[11px] font-bold tracking-wider outline-none transition-all
                       focus:border-[var(--accent)]/50 uppercase
                       placeholder:text-[var(--muted)] text-[var(--foreground)] shadow-sm"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-all z-20"
                >
                  <FiX size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilter(true)}
              className="relative flex items-center justify-center gap-3 h-10 px-4 rounded-xl 
                       bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] text-[var(--foreground)] font-bold text-[11px] uppercase tracking-widest
                       hover:bg-[var(--accent)]/10 transition-all active:scale-95 shadow-sm"
            >
              <FiFilter size={20} />
              <span className="hidden sm:inline text-xs">Module Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] flex items-center justify-center text-[9px] rounded-full bg-red-600 text-white font-black border-2 border-white/20 shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ================= CATEGORY SWITCHER (COMPACT) ================= */}
        <div className="max-w-7xl mx-auto px-4 pb-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { id: "ALL", label: "ALL", icon: FiGrid },
              { id: "MLBB", label: "MLBB", icon: FiZap },
              { id: "OTHERS", label: "OTHERS", icon: FiBox },
              { id: "STREAM", label: "STREAM", icon: FiTv },
              { id: "MEMBERS", label: "MEMBERS", icon: FiTrendingUp },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border font-black text-[9px] uppercase tracking-[0.1em] transition-all duration-300
                            ${isActive 
                              ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
                              : "bg-[var(--card)]/10 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]"
                            }`}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        
        {/* GAMES SECTION (SHOW FOR ALL, MLBB, OTHERS) */}
        {(activeCategory === "ALL" || activeCategory === "MLBB" || activeCategory === "OTHERS") && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader
              title={activeCategory === "MLBB" ? "MLBB GAMES" : activeCategory === "OTHERS" ? "OTHER GAMES" : "SELECT GAME"}
              count={
                processGames(games).filter(g => {
                  if (activeCategory === "MLBB") return g.storeCategory === "MLBB";
                  if (activeCategory === "OTHERS") return g.storeCategory === "OTHERS";
                  return true;
                }).length
              }
              icon={FiBox}
            />
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3 lg:gap-4">
              {processGames(games)
                .filter(g => {
                  if (activeCategory === "MLBB") return g.storeCategory === "MLBB";
                  if (activeCategory === "OTHERS") return g.storeCategory === "OTHERS";
                  return true;
                })
                .map((game: any) => (
                  <GameCard key={game.gameId} game={game} />
                ))}
            </div>
          </motion.div>
        )}

        {/* OTT SECTION (SHOW FOR ALL, STREAM) */}
        {otts?.items?.length > 0 && (activeCategory === "ALL" || activeCategory === "STREAM") && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader title={otts.title} icon={FiTv} />
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3 lg:gap-4">
              {otts.items.map((ott: any) => (
                <motion.div
                  key={ott.slug}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/games/ott/${ott.slug}`}
                    className="group relative flex flex-col p-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-[border-color,box-shadow,transform] duration-300 overflow-hidden"
                  >
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg">
                      <Image src={ott.image} alt={ott.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[10px] md:text-[12px] font-black text-[var(--foreground)] italic truncate uppercase tracking-tight">
                          {ott.name}
                        </p>
                        <p className="text-[7px] md:text-[8px] text-red-500 font-black uppercase tracking-[0.2em] mt-0.5">
                          {ott.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MEMBERSHIP SECTION (SHOW FOR ALL, MEMBERS) */}
        {memberships?.items?.length > 0 && (activeCategory === "ALL" || activeCategory === "MEMBERS") && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader title={memberships.title} icon={FiTrendingUp} />
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3 lg:gap-4">
              {memberships.items.map((plan: any) => (
                <motion.div
                  key={plan.slug}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/games/membership/${plan.slug}`}
                    className="group relative flex flex-col p-1.5 rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-transparent backdrop-blur-md border border-[var(--accent)]/30 transition-[border-color,box-shadow,transform] duration-300"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-black/60 shadow-2xl">
                      <Image src={plan.image} alt={plan.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="mt-5 pb-3 text-center">
                      <p className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tighter italic">
                        {plan.name}
                      </p>
                      <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[var(--accent)] text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
                        {plan.duration}
                      </div>
                    </div>
                    {/* PREMIUM INDICATOR */}
                    <div className="absolute top-4 right-4 p-2 bg-white text-black rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <FiZap size={14} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ================= FILTER MODAL ================= */}
      <AnimatePresence>
        {showFilter && (
          <GamesFilterModal
            open={showFilter}
            onClose={() => setShowFilter(false)}
            sort={sort}
            setSort={setSort}
            hideOOS={hideOOS}
            setHideOOS={setHideOOS}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
