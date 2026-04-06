"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { RiShieldKeyholeFill, RiLockPasswordLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import logo from "@/public/logo.png";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("userId", data.user.userId);
      localStorage.setItem("userType", data.user.userType);

      setSuccess("Welcome back! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 900);
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLogin(tokenResponse.access_token),
    onError: () => setError("Authorization Failed"),
  });

  return (
    <section className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center overflow-hidden px-4 py-12">
      {/* ================= PREMIUM BACKGROUND ELEMENTS ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        
        {/* Dynamic Glowing Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-40 w-[50rem] h-[50rem] rounded-full bg-white/5 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-1/4 -right-40 w-[60rem] h-[60rem] rounded-full bg-[var(--accent)]/5 blur-[160px]"
        />
      </div>

      {/* ================= COMPACT LOGIN CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="
          relative z-10 w-full max-w-[380px]
          rounded-[2.5rem]
          bg-[var(--card)] backdrop-blur-[40px]
          border border-white/10
          shadow-[0_40px_100px_rgba(0,0,0,0.4)]
          overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.02] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="p-8 md:p-10 flex flex-col items-center text-center">

          {/* Logo Heading Placement */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 relative flex items-center justify-center w-20 h-20 bg-[var(--card)] border border-[var(--border)] shadow-inner group overflow-hidden rounded-2xl"
          >
            <div className="relative w-12 h-12">
              <Image 
                src={logo} 
                alt="Logo" 
                fill 
                className="object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
            </div>
            <div className="absolute -inset-4 bg-white/10 blur-xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
          </motion.div>

          {/* Texts */}
          <div className="space-y-2 mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black tracking-tight text-[var(--foreground)]"
            >
              Sign In
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[var(--foreground)] opacity-60 text-xs font-semibold leading-relaxed px-2"
            >
              The most secure way to handle your gaming top-ups and rewards.
            </motion.p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-6">
            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] uppercase tracking-widest px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
                >
                  <RiLockPasswordLine className="text-lg" /> 
                  <span className="font-bold flex-1 text-center">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-300 text-[10px] uppercase tracking-widest px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
                >
                  <RiShieldKeyholeFill className="text-lg" /> 
                  <span className="font-bold flex-1 text-center">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Google Button - Compact */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group w-full"
            >
              <div className="absolute -inset-1 bg-[var(--accent)]/5 rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-all duration-700" />
              
              <button 
                onClick={() => login()}
                className="
                  relative flex items-center justify-center gap-4 w-full h-[56px] 
                  bg-[var(--card)] hover:bg-[var(--card)]/80
                  border border-[var(--border)] hover:border-[var(--accent)]/50
                  rounded-2xl transition-all duration-300
                  active:scale-[0.98]
                "
              >
                <div className="bg-white p-2 rounded-lg shadow-lg">
                  <FcGoogle className="text-xl" />
                </div>
                <span className="text-[var(--foreground)] text-sm font-bold tracking-wide">Continue with Google</span>
              </button>
            </motion.div>

            {/* Loading Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-2"
              >
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-white/40 rounded-full animate-spin" />
                </div>
              </motion.div>
            )}

            {/* Footer Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-[var(--border)] opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-[8px] tracking-[0.4em] uppercase font-black text-[var(--foreground)] opacity-20">
                <span className="px-4 bg-transparent backdrop-blur-none">SECURED & CLOUD-LINKED</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Laser Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      </motion.div>

      {/* Background Decorative Branding - Subtle */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 select-none opacity-[0.01] pointer-events-none">
        <h2 className="text-[12vw] font-black tracking-tighter whitespace-nowrap text-[var(--foreground)]">TK OFFICIAL</h2>
      </div>
    </section>
  );
}
