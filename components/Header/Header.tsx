"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
const ThemeToggle = dynamic(() => import("../ThemeToggle/ThemeToggle"), { ssr: true });
import { FiPlus, FiChevronDown, FiUser, FiLayout, FiSettings, FiLifeBuoy, FiLogOut, FiBarChart2, FiHome, FiGrid, FiLayers, FiGlobe } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Dynamic header styles based on scroll
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 0.9]);
  const headerBlur = useTransform(scrollY, [0, 50], [0, 16]);
  const headerBorder = useTransform(scrollY, [0, 50], ["rgba(0,0,0,0)", "var(--border)"]);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= RESET AVATAR ERROR ================= */
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= ANIMATION VARIANTS ================= */
  const headerVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { duration: 0.4, ease: "circOut" } as any
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`fixed top-0 left-0 w-full z-[80] transition-colors duration-500`}
      style={{
        backgroundColor: scrolled ? "rgba(0, 0, 0, 0.45)" : "transparent",
        backdropFilter: scrolled ? "blur(32px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      {/* Tactical Glow Line (only when scrolled) */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent z-10"
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">

        {/* LOGO SECTION */}
        <div className="flex items-center gap-4">
          <Link href="/" className="relative group flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-8 h-8 flex items-center justify-center transition-all duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            >
              <Image 
                src={logo} 
                alt="Logo" 
                fill 
                className="object-contain filter group-hover:brightness-125 transition-all"
              />
            </motion.div>
            <div className="absolute -inset-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { name: "Games", href: "/games", icon: FiGrid },
              { name: "Services", href: "/services", icon: FiLayers },
              { name: "Regions", href: "/regions", icon: FiGlobe }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
              >
                <item.icon className="text-lg opacity-70 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all" />
                <span>{item.name}</span>
                <motion.span
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--accent)] rounded-full origin-left opacity-0 group-hover:opacity-100"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
          {user && (
            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2 py-1.5 rounded-full hover:bg-[var(--accent)]/20 transition-all group shrink-0 shadow-sm"
            >
              <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <FiPlus className="text-[var(--accent)] text-[8px]" />
              </div>
              <span className="text-xs font-bold text-[var(--accent)]">₹{user.wallet?.toFixed(2) || "0.00"}</span>
            </Link>
          )}

          <ThemeToggle />

          <div className="h-6 w-[1px] bg-[var(--border)] mx-1 hidden sm:block" />

          {/* USER PROFILE / LOGIN */}
          <div className="relative">
            <motion.button
              onClick={() => {
                if (!loading) {
                  if (user) {
                    setUserMenuOpen(!userMenuOpen);
                  } else {
                    window.location.href = "/login";
                  }
                }
              }}
              className={`
                flex items-center gap-1.5 p-0.5 pr-2 rounded-full transition-all duration-300
                ${userMenuOpen ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--card)]/50'}
              `}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden shadow-sm">
                {!loading && user?.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="object-cover w-full h-full"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <FiUser className="text-white text-sm" />
                )}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Account</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold truncate max-w-[80px]">
                    {user ? user.username : 'Guest'}
                  </span>
                  <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }}>
                    <FiChevronDown className="text-xs text-[var(--muted)]" />
                  </motion.div>
                </div>
              </div>
            </motion.button>

            {/* USER DROPDOWN MENU */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuVariants}
                  className="absolute right-0 top-[calc(100%+10px)] w-64 bg-black/95 border border-[var(--border)] rounded-[1.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl z-50 px-2 py-3"
                >
                  {!user ? (
                    <div className="p-5 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-tr from-[var(--accent)]/20 to-[var(--card)] rounded-full flex items-center justify-center mb-4 ring-1 ring-[var(--accent)]/20">
                        <FiUser className="text-2xl text-[var(--accent)]" />
                      </div>

                      <h3 className="text-[var(--foreground)] font-bold text-lg mb-1">Welcome!</h3>
                      <p className="text-xs text-[var(--muted)] mb-5 max-w-[80%] leading-relaxed">
                        Sign in to access your wallet, orders, and exclusive offers.
                      </p>

                      <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full">
                        <motion.button
                          className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-xl text-sm shadow-lg shadow-[var(--accent)]/25 flex items-center justify-center gap-2 group relative overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">Sign In Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </motion.button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* User Info Header */}
                      <div className="px-3 py-3 border-b border-[var(--border)]/30 mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative group/avatar">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-indigo-500 p-[1px] shadow-lg">
                              <div className="w-full h-full rounded-[15px] bg-black flex items-center justify-center overflow-hidden">
                                {user?.avatar && !avatarError ? (
                                  <img
                                    src={user.avatar}
                                    alt=""
                                    className="object-cover w-full h-full group-hover/avatar:scale-110 transition-transform duration-500"
                                    onError={() => setAvatarError(true)}
                                  />
                                ) : (
                                  <FiUser className="text-white text-xl" />
                                )}
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-base font-black tracking-tight text-[var(--foreground)] truncate leading-tight">
                              {user.name || user.username || "User"}
                            </span>
                            <span className="text-[10px] font-bold text-[var(--muted)] truncate opacity-70">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all border border-transparent hover:border-red-500/10 group shrink-0"
                          title="Log Out"
                        >
                          <FiLogOut className="text-lg group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* Menu Links */}
                      <div className="space-y-1.5">
                        {[
                          { label: "Dashboard", icon: FiLayout, href: "/dashboard" },
                          { label: "Orders", icon: FiLayers, href: "/dashboard/order" },
                          { label: "Wallet", icon: FiPlus, href: "/dashboard/wallet" },
                          { label: "Support", icon: FiLifeBuoy, href: "/dashboard/query" },
                          { label: "Leaderboard", icon: FiBarChart2, href: "/leaderboard" },
                        ].map((link) => (
                          <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                            <motion.div
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--accent)] transition-all group"
                              whileHover={{ x: 4 }}
                            >
                              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[var(--accent)]/10 transition-all">
                                <link.icon className="text-base group-hover:scale-110 transition-transform" />
                              </div>
                              <span className="text-sm font-bold tracking-tight uppercase">{link.label}</span>
                            </motion.div>
                          </Link>
                        ))}

                        {user.userType === "owner" && (
                          <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)}>
                            <motion.div
                              className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl hover:bg-orange-500/10 text-orange-400 transition-all font-bold group"
                              whileHover={{ x: 6 }}
                            >
                              <div className="p-2 rounded-xl bg-orange-500/5 group-hover:bg-orange-500/10 transition-all">
                                <FiSettings className="text-base group-hover:rotate-45 transition-transform" />
                              </div>
                              <span className="text-sm uppercase tracking-tight">Admin Panel</span>
                            </motion.div>
                          </Link>
                        )}
                      </div>


                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.header>
  );
}
