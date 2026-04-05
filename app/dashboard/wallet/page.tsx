"use client";

import { useState, useEffect } from "react";
import AuthGuard from "../../../components/AuthGuard";
import WalletTab from "../../../components/Dashboard/WalletTab";

export default function WalletPage() {
    const [walletBalance, setWalletBalance] = useState(0);
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
                    setWalletBalance(data.user.wallet || 0);
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
            <section className="min-h-screen relative px-4 sm:px-6 py-10 sm:py-16 bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-[var(--accent)]/5 blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto relative">
                    {isAuthorized ? (
                        <WalletTab
                            walletBalance={walletBalance}
                            setWalletBalance={setWalletBalance}
                        />
                    ) : (
                        <div className="bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] text-center shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                            <p className="text-[var(--muted)] mb-6">
                                The wallet feature is only available for <strong>Members</strong>, <strong>Owners</strong>, and <strong>Admins</strong>.
                            </p>
                            <button
                                onClick={() => window.location.href = "/"}
                                className="px-6 py-3 bg-[var(--accent)] text-black font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </AuthGuard>
    );
}
