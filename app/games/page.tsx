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
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg shadow-2xl border border-white/20">
                  OOS
                </span>
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="w-full mt-2 px-1 space-y-0.5 pb-1">
            <h3 className="text-[10px] md:text-[11px] font-black text-[var(--foreground)] line-clamp-2 text-center 
                         min-h-[2.2em] px-1 group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">
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
    <div className="flex items-center gap-4 mb-8 px-2 group">
      <div className="flex flex-col items-start translate-y-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 shadow-[0_0_15px_var(--glow)]">
              <Icon size={18} className="text-[var(--accent)]" />
            </div>
          )}
          <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-3 drop-shadow-[0_0_15px_var(--glow)]">
            <span className="text-[var(--foreground)] opacity-90">{title.split(' ')[0]}</span>
            <span className="text-[var(--accent)]">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>

        {count !== undefined && (
          <div className="flex items-center gap-2 mt-3 ml-12">
            <div className="h-1 w-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest opacity-80">
              {count} Games available
            </p>
          </div>
        )}
      </div>

      {/* RIGHT ACCENT LINE */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--border)] via-[var(--border)]/10 to-transparent mt-6" />
    </div>
  );

  return (
    <section className="min-h-screen bg-transparent relative overflow-hidden">
      {/* GLOBAL GRID OVERLAY */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none -z-10" />


      {/* AMBIENT EFFECTS REMOVED TO SHOW BODY BACKGROUND */}

      {/* ================= FILTER BAR (CINEMATIC GLASS) ================= */}
      <div className="sticky top-0 md:top-[48px] z-40">
        <div className="absolute inset-0 bg-[var(--card)]/30 backdrop-blur-3xl border-b border-[var(--border)] shadow-2xl shadow-black/5" />
        
        {/* SEARCH & ACTIONS */}
        <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2 md:gap-4">
          {/* SEARCH */}
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH GAMES..."
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-[var(--border)]
                       bg-black/10 backdrop-blur-md text-[11px] font-bold tracking-wider outline-none transition-all
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
                       bg-black/10 backdrop-blur-md border border-[var(--border)] text-[var(--foreground)] font-bold text-[11px] uppercase tracking-widest
                       hover:bg-[var(--accent)]/10 transition-all active:scale-95 shadow-sm"
            >
              <FiFilter size={20} />
              <span className="hidden sm:inline text-xs">Module Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] flex items-center justify-center text-[9px] rounded-full bg-[var(--accent)] text-white font-black border-2 border-white/20 shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CATEGORY SWITCHER (GLASS STRIP) */}
        <div className="relative max-w-7xl mx-auto px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner">
            {[
              { id: "ALL", label: "All", icon: FiGrid },
              { id: "GAMES", label: "Games Top-Up", icon: FiZap },
              { id: "MLBB", label: "MLBB", icon: FiTrendingUp },
              { id: "GIFTS", label: "Gift Cards", icon: FiBox },
              { id: "OTT", label: "OTT Subscriptions", icon: FiTv },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-black text-[9px] uppercase tracking-[0.1em] transition-all duration-300
                            ${isActive 
                              ? "bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]" 
                              : "bg-transparent border-transparent text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
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
        
        {/* GAMES SECTION (SHOW FOR ALL, GAMES, MLBB, GIFTS) */}
        {(activeCategory === "ALL" || activeCategory === "GAMES" || activeCategory === "MLBB" || activeCategory === "GIFTS") && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader
              title={activeCategory === "GIFTS" ? "GIFT CARDS" : activeCategory === "GAMES" ? "GAMES TOP-UP" : activeCategory === "MLBB" ? "MOBILE LEGENDS" : "SELECT PRODUCT"}
              count={
                processGames(games).filter(g => {
                  if (activeCategory === "ALL") return true; 
                  if (activeCategory === "GAMES") return true; 
                  if (activeCategory === "MLBB") return g.gameName.toLowerCase().includes("mobile legends") || g.gameName.toLowerCase().includes("mlbb");
                  if (activeCategory === "GIFTS") return g.storeCategory === "CARDS"; 
                  return false;
                }).length
              }
              icon={activeCategory === "GIFTS" ? FiBox : activeCategory === "GAMES" ? FiZap : FiGrid}
            />
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3 lg:gap-4">
              {processGames(games)
                .filter(g => {
                  if (activeCategory === "ALL") return true;
                  if (activeCategory === "GAMES") return true;
                  if (activeCategory === "MLBB") return g.gameName.toLowerCase().includes("mobile legends") || g.gameName.toLowerCase().includes("mlbb");
                  if (activeCategory === "GIFTS") return g.storeCategory === "CARDS";
                  return false;
                })
                .map((game: any) => (
                  <GameCard key={game.gameSlug} game={game} />
                ))}
            </div>
          </motion.div>
        )}

        {/* OTT SECTION (SHOW FOR ALL, OTT) */}
        {otts?.items?.length > 0 && (activeCategory === "ALL" || activeCategory === "OTT") && !searchQuery && (
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
                        <p className="text-[7px] md:text-[8px] text-[var(--accent)] font-black uppercase tracking-[0.2em] mt-0.5">
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
