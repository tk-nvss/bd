"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import logo from "@/public/logo.png";
import Loader from "@/components/Loader/Loader";

export default function GameBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/game-banners");
        const json = await res.json();
        if (!active) return;

        setBanners(json?.data || []);
      } catch {
        if (active) setBanners([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => (active = false);
  }, []);

  /* ================= AUTOPLAY ================= */
  useEffect(() => {
    if (banners.length <= 1) return;

    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(id);
  }, [banners.length]);

  /* ================= CONTROLS ================= */
  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  if (loading) return <Loader />;
  if (!banners.length) return null;

  const banner = banners[current];

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-8 select-none">
      <div className="relative overflow-hidden rounded-3xl h-[185px] md:h-[290px] group ">

        {/* IMAGE */}
        <Link href={banner.bannerLink || "/"} className="absolute inset-0">
          <Image
            src={banner.bannerImage || logo}
            alt={banner.bannerTitle || "Game banner"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* CONTENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
          <div className="space-y-4 max-w-lg pointer-events-auto">
            {banner.bannerTitle && (
              <h2 className="text-2xl md:text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">
                {banner.bannerTitle}
              </h2>
            )}
            
            <Link href={banner.bannerLink || "/games/mlbb"}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs md:text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-400/20"
              >
                RECHARGE NOW
              </motion.button>
            </Link>
          </div>
        </div>

        {/* LEFT ARROW */}
        {banners.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2
                       w-10 h-10 md:w-12 md:h-12
                       rounded-full 
                       text-white 
                       transition flex items-center justify-center"
            aria-label="Previous banner"
          >
            ‹
          </button>
        )}

        {/* RIGHT ARROW */}
        {banners.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2
                       w-10 h-10 md:w-12 md:h-12
                       rounded-full 
                       text-white 
                       transition flex items-center justify-center"
            aria-label="Next banner"
          >
            ›
          </button>
        )}
      </div>

      {/* DOTS */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${current === i
                ? "bg-[var(--accent)] w-6"
                : "bg-[var(--muted)]/60 w-2.5 hover:bg-[var(--accent)]/50"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
