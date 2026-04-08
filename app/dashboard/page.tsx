"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import { motion } from "framer-motion";
import { FiPackage, FiCreditCard, FiSettings, FiMessageCircle, FiZap, FiUser, FiArrowRight, FiActivity } from "react-icons/fi";
import { CONFIG } from "@/lib/config";

export default function Dashboard() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= LOAD USER ================= */
  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        setUserDetails({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          userType: data.user.userType || "user",
        });

        setWalletBalance(data.user.wallet || 0);
      });
  }, [token]);

  const dashboardCards = [
    {
      key: "orders",
      label: "My Orders",
      icon: <FiPackage />,
      route: "/dashboard/order",
      description: "Track your orders",
      accent: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    // {
    //   key: "wallet",
    //   label: "My Wallet",
    //   icon: <FiCreditCard />,
    //   route: "/dashboard/wallet",
    //   description: `Wallet: ${CONFIG.CURRENCY_SYMBOL}${walletBalance.toFixed(2)}`,
    //   accent: "text-emerald-500",
    //   bg: "bg-emerald-500/10",
    // },
    // {
    //   key: "api",
    //   label: "Developer",
    //   icon: <FiZap />,
    //   route: "/dashboard/api",
    //   description: "API & Documentation",
    //   accent: "text-amber-500",
    //   bg: "bg-amber-500/10",
    // },
    {
      key: "account",
      label: "Settings",
      icon: <FiSettings />,
      route: "/dashboard/account",
      description: "Account & Profile",
      accent: "text-slate-500",
      bg: "bg-slate-500/10",
    },
    {
      key: "query",
      label: "Support",
      icon: <FiMessageCircle />,
      route: "/dashboard/query",
      description: "Help & Contact",
      accent: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <AuthGuard>
      <section className="min-h-screen relative px-4 py-8 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        {/* Glow Decoration */}
        <div className="absolute top-0 left-1/4 w-[40%] h-[40%] bg-[var(--accent)]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">

          {/* COMPACT TOP SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[8px] font-black uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)]/20">
                <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                Welcome Back
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase italic break-words">
                HELLO, <span className="text-[var(--accent)] opacity-80">{userDetails.name.split(' ')[0] || "USER"}</span>
              </h1>
              <p className="text-[10px] text-[var(--muted)] font-medium leading-tight">Manage your game items from here.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative group w-full md:w-auto md:min-w-[240px]"
            >
              <div className="absolute -inset-0.5 bg-[var(--accent)] opacity-10 blur group-hover:opacity-20 transition rounded-xl"></div>
              <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                    <FiCreditCard size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest leading-none mb-1">My Balance</p>
                    <p className="text-lg font-black tracking-tighter">{CONFIG.CURRENCY_SYMBOL}{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard/wallet')}
                  className="w-7 h-7 rounded-lg bg-[var(--accent)] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-[var(--accent)]/20"
                >
                  <FiArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* COMPACT ACTION GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {dashboardCards.map((card, idx) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx + 0.2 }}
                onClick={() => router.push(card.route)}
                className="group cursor-pointer"
              >
                <div className="h-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-[var(--background)] relative overflow-hidden flex flex-col items-start shadow-sm hover:shadow-md">
                  <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.accent} border border-[var(--border)] flex items-center justify-center text-base mb-3 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="text-sm font-black tracking-tight uppercase italic mb-0.5 text-[var(--foreground)]">{card.label}</h3>
                  <p className="text-[9px] text-[var(--muted)] font-medium leading-tight">{card.description}</p>

                  {/* Subtle Corner Glow */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-[var(--accent)]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}


          </div>


        </div>
      </section>
    </AuthGuard>
  );
}
