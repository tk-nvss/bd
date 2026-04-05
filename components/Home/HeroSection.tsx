"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const GamesPage = dynamic(() => import("@/app/games/page"), { ssr: true });
const GameBannerCarousel = dynamic(() => import("./GameBannerCarousel"), { ssr: true });
const HomeServices = dynamic(() => import("./HomeServices"), { ssr: false });
const TrustHighlights = dynamic(() => import("./TrustHighlights"), { ssr: false });
const AboutMewoji = dynamic(() => import("./AboutMewoji"), { ssr: false });
const MLBBPurchaseGuide = dynamic(() => import("../HelpImage/MLBBPurchaseGuide"), { ssr: false });
const TopNoticeBanner = dynamic(() => import("./TopNoticeBanner"), { ssr: true });
const ScrollingNoticeBand = dynamic(() => import("./ScrollingNoticeBand"), { ssr: true });
const StorySlider = dynamic(() => import("./StorySlider"), { ssr: false });
const HomeQuickActions = dynamic(() => import("./HomeQuickActions"), { ssr: true });

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  const isLive = pathname.startsWith("/anime-live");
  //   const checkBalance = async () => {
  //   const res = await fetch("/api/game/balance");
  //   const data = await res.json();
  //   console.log("FINAL BALANCE:", data);
  // };

  // checkBalance();


  return (
    <>
      <TopNoticeBanner />

      <GameBannerCarousel />
      {/* <ScrollingNoticeBand /> */}

      {/* <StorySlider /> */}
      <HomeQuickActions />

      <GamesPage />
      {/* <ScrollingNoticeBand /> */}


      <HomeServices />
      <TrustHighlights />
      <AboutMewoji />


    </>

  );
}
