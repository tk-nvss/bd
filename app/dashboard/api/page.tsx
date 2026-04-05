"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiLock, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import AuthGuard from "../../../components/AuthGuard";
import ApiTab from "../../../components/Dashboard/ApiTab";

export default function ApiPage() {
    const [userType, setUserType] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUserType(data.user.userType);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isAuthorized = userType === "member" || userType === "owner" || userType === "admin";

    return (
        <AuthGuard>
            <section className="min-h-screen relative px-4 sm:px-6 py-10 sm:py-16 bg-[var(--background)] text-[var(--foreground)] overflow-hidden flex flex-col items-center">
                {/* Background Ambient Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-full max-w-5xl relative z-10">
                    {isAuthorized ? (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <ApiTab />
                        </motion.div>
                    ) : (
                        <div className="min-h-[70vh] flex items-center justify-center w-full">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                className="relative group w-full max-w-md"
                            >
                                {/* Card Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="relative bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] p-10 rounded-[2.5rem] text-center shadow-2xl overflow-hidden">
                                    {/* Top Accent Bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-8 relative inline-block"
                                    >
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-600/5 flex items-center justify-center text-red-500 relative z-10">
                                            <FiLock className="text-4xl" />
                                        </div>
                                        {/* Pulsing ring around icon */}
                                        <div className="absolute inset-0 rounded-3xl bg-red-500/20 animate-ping -z-10 opacity-20" />
                                    </motion.div>

                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-black mb-4 tracking-tight"
                                    >
                                        Access <span className="text-red-500">Restricted</span>
                                    </motion.h2>

                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-[var(--muted)] mb-10 text-sm leading-relaxed"
                                    >
                                        The Developer API is a premium feature exclusive to <span className="text-[var(--foreground)] font-bold">Members</span>, <span className="text-[var(--foreground)] font-bold">Owners</span>, and <span className="text-[var(--foreground)] font-bold">Admins</span>.
                                    </motion.p>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <button
                                            onClick={() => window.location.href = "/dashboard"}
                                            className="group/btn w-full px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                        >
                                            <FiArrowLeft className="group-hover/btn:-translate-x-1 transition-transform" />
                                            Back to Dashboard
                                        </button>

                                        <p className="mt-6 text-[10px] text-[var(--muted)] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                            <FiAlertCircle className="text-red-500" />
                                            Need help? Contact support
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </section>
        </AuthGuard>
    );
}
