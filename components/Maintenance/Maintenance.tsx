"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiAlertTriangle, FiCpu, FiLogOut, FiServer } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function Maintenance() {
    const [show, setShow] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [dbMaintenanceEnabled, setDbMaintenanceEnabled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkMaintenanceStatus = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                const data = await res.json();
                if (data.success) {
                    setDbMaintenanceEnabled(data.settings.maintenanceMode);
                }
            } catch (err) {
                console.error("Failed to fetch maintenance status", err);
            }
        };
        checkMaintenanceStatus();
    }, []);

    useEffect(() => {
        // Only owners and the login page are exempt from maintenance
        const isOwner = localStorage.getItem("userType") === "owner";
        const isLoginRoute = pathname === "/login";
        const isOwnerRoute = pathname?.startsWith("/owner-panal");

        if (isOwner || isLoginRoute || isOwnerRoute) {
            setShow(false);
            return;
        }

        // Everyone else (including Admins) sees the overlay if maintenance is enabled
        if (dbMaintenanceEnabled) {
            const timer = setTimeout(() => setShow(true), 800);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [pathname, dbMaintenanceEnabled]);

    const handleLoggingOff = () => {
        setIsLoggingOut(true);

        const keysToRemove = ["token", "userName", "email", "userId", "phone", "pending_topup_order", "avatar"];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem("mlbb_verified_players");

        setTimeout(() => {
            window.location.href = "/";
        }, 2500);
    };

    // Generate random particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
    }));

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg">
                    {/* Dark Minimalist Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm bg-gray-900/40 rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-2xl"
                    >
                        {/* Orange Accent Bar */}
                        <div className="h-1 w-full bg-orange-500" />

                        <div className="p-10 text-center">
                            {/* Icon Container */}
                            <div className="mx-auto w-20 h-20 mb-6 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                <FiServer className="text-4xl text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-black text-white mb-2">
                                Fixing <span className="text-orange-500">The Site</span>
                            </h1>

                            {/* Status */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 mb-6 border border-orange-500/20">
                                <FiAlertTriangle className="text-xs" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Offline Now</span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                We are making the site better for you.
                                <br />
                                <span className="text-white font-bold">Coming back soon!</span>
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                {isLoggingOut ? (
                                    <div className="flex items-center justify-center gap-3 py-3">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"
                                        />
                                        <span className="text-sm font-bold text-white">Working...</span>
                                    </div>
                                ) : (
                                    <>
                                        <motion.button
                                            onClick={() => window.location.href = "/login"}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all"
                                        >
                                            Log In
                                        </motion.button>

                                        <button
                                            onClick={handleLoggingOff}
                                            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <p className="mt-10 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-700">
                                {process.env.NEXT_PUBLIC_BRAND_NAME || "BDCOINS"} • 2026
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
