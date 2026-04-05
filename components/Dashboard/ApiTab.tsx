"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiPlus, FiCheckCircle, FiArrowRight, FiCopy } from "react-icons/fi";

export default function ApiTab() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDocs, setShowDocs] = useState(false);
    const [usageHistory, setUsageHistory] = useState<any[]>([]);

    const fetchApiKey = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/user/api-key", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setApiKey(data.apiKey);
                setIsAuthorized(data.isAuthorized);
                if (data.isAuthorized) fetchUsageHistory();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsageHistory = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/user/api-key/usage", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsageHistory(data.orders);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchApiKey();
    }, []);

    const handleGenerate = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setGenerating(true);
        try {
            const res = await fetch("/api/user/api-key", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setApiKey(data.apiKey);
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate API key");
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) return null; // Handled by parent

    return (
        <div className="space-y-10 pb-20">
            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 relative"
            >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent)] to-transparent rounded-full shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" />
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--foreground)] uppercase italic">
                    Developer <span className="text-[var(--accent)] not-italic bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-white/40">Portal</span>
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xl font-medium tracking-wide">
                    Build custom integrations using our high-performance v1 API.
                </p>
            </motion.div>

            {/* MAIN CARD */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
            >
                {/* Background Shadow/Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)]/10 to-transparent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />

                <div className="relative p-6 sm:p-8 rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden">
                    {/* Animated Decorative Element */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--accent)]/5 blur-[120px] rounded-full animate-pulse" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-white/20 p-[1px] shadow-lg">
                                    <div className="w-full h-full rounded-2xl bg-[var(--background)]/40 backdrop-blur-md flex items-center justify-center text-[var(--accent)]">
                                        <FiZap className="text-2xl animate-bounce-slow" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tighter uppercase italic">Credentials</h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Authorized Access Only</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-[var(--muted)] leading-relaxed font-medium">
                                    Your personal API key allows you to authenticate requests. Keep it secret and never expose it in client-side code.
                                </p>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <div className="px-4 py-2 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">v1 API Active</span>
                                    </div>
                                    <div className="px-4 py-2 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Last sync: Just now</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto self-stretch flex flex-col justify-center">
                            {!apiKey ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="w-full md:w-[280px] px-8 py-6 rounded-[2rem] bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center gap-3"
                                >
                                    {generating ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FiPlus strokeWidth={3} />
                                            Generate Key
                                        </>
                                    )}
                                </motion.button>
                            ) : (
                                <div className="space-y-6 w-full md:w-[320px]">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted)] px-2">X-API-KEY</label>
                                        <div className="group/key relative">
                                            <div className="absolute inset-0 bg-[var(--accent)]/20 blur-xl opacity-0 group-hover/key:opacity-100 transition duration-500" />
                                            <div className="relative bg-[var(--foreground)]/5 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 font-mono text-xs text-[var(--accent)] shadow-inner overflow-hidden flex items-center justify-between gap-4">
                                                <span className="truncate max-w-[150px]">{apiKey}</span>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="p-2.5 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
                                                >
                                                    {copied ? <FiCheckCircle /> : <FiCopy />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="w-full text-[10px] font-black text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-[0.2em]"
                                    >
                                        {generating ? "Regenerating..." : "Regenerate"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* API Usage History Overlay */}
                    {usageHistory.length > 0 && (
                        <div className="mt-20 space-y-6 border-t border-[var(--border)] pt-10">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[var(--accent)] rounded-full" />
                                    Live Stream
                                </h4>
                                <button
                                    onClick={fetchUsageHistory}
                                    className="text-[10px] font-black text-[var(--accent)] uppercase tracking-wider hover:underline"
                                >
                                    Sync
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {usageHistory.slice(0, 6).map((order) => (
                                    <div
                                        key={order._id}
                                        className="group/item relative bg-[var(--foreground)]/[0.02] border border-[var(--border)] p-5 rounded-[1.5rem] hover:bg-[var(--foreground)]/[0.05] hover:border-[var(--accent)]/30 transition-all duration-500"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] text-[10px] font-black uppercase">
                                                {order.itemName.split(' ')[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-[var(--foreground)] truncate truncate uppercase italic">{order.itemName}</p>
                                                <p className="text-[9px] text-[var(--muted)] font-bold tracking-wider">ID: {order.playerId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-[var(--accent)]">₹{order.price}</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${order.status === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {order.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-[var(--card)] backdrop-blur-md rounded-[2.5rem] p-10 border border-[var(--border)] shadow-xl">
                    <div className="flex flex-col">
                        <h4 className="text-lg font-black uppercase italic tracking-tight">API Documentation</h4>
                        <p className="text-xs text-[var(--muted)] font-medium">Read our comprehensive integration guide</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open("/API_V1_DOCS.md", "_blank")}
                            className="px-6 py-4 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all flex items-center gap-3"
                        >
                            Open Docs <FiArrowRight className="rotate-45" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDocs(!showDocs)}
                            className="px-6 py-4 rounded-2xl bg-[var(--accent)] text-[var(--background)] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl"
                        >
                            {showDocs ? "Hide Guide" : "View Full Guide"} <FiZap fill="currentColor" />
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence>
                    {showDocs && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-6"
                        >
                            <div className="p-10 rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <FiZap className="text-[200px]" />
                                </div>

                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* DOCS COLUMN 1 */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-black uppercase italic text-[var(--foreground)] flex items-center gap-3">
                                                <div className="w-2 h-6 bg-green-500 rounded-full" />
                                                Order Creation
                                            </h4>
                                            <div className="bg-[var(--background)]/60 rounded-[1.5rem] p-6 font-mono text-xs leading-relaxed border border-[var(--border)] shadow-inner">
                                                <p className="text-blue-400 mb-2">// Request Structure</p>
                                                <p className="text-[var(--accent)]">POST https://meowjiofficial.com/api/v1/order/create</p>
                                                <p className="text-[var(--muted)] mt-2">{"Headers: {"}</p>
                                                <p className="pl-6 text-[var(--foreground)] text-[10px]">"X-API-KEY": "TK_MW_...",</p>
                                                <p className="pl-6 text-[var(--foreground)] text-[10px]">"Content-Type": "application/json"</p>
                                                <p className="text-[var(--muted)]">{"}"}</p>
                                                <br />
                                                <p className="text-[var(--foreground)]">{"{"}</p>
                                                <p className="pl-6">"gameSlug": "bgmi-manual",</p>
                                                <p className="pl-6">"itemSlug": "bgmi-60",</p>
                                                <p className="pl-6">"playerId": "5123456789"</p>
                                                <p className="text-[var(--foreground)]">{"}"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DOCS COLUMN 2 */}
                                    <div className="space-y-8">
                                        <div className="space-y-4 text-xs">
                                            <h4 className="text-lg font-black uppercase italic text-[var(--foreground)] flex items-center gap-3">
                                                <div className="w-2 h-6 bg-[var(--accent)] rounded-full" />
                                                Supported Catalog
                                            </h4>
                                            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)]/60">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-[var(--border)] bg-[var(--foreground)]/[0.02]">
                                                            <th className="p-4 font-black uppercase tracking-widest text-[var(--muted)] text-[8px]">Game</th>
                                                            <th className="p-4 font-black uppercase tracking-widest text-[var(--muted)] text-[8px]">Available Item Slugs</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="p-4 font-black text-[var(--accent)] uppercase italic">BGMI</td>
                                                            <td className="p-4 text-[var(--muted)] leading-loose">
                                                                <span className="px-2 py-1 bg-[var(--foreground)]/5 rounded mx-1">bgmi-60</span>
                                                                <span className="px-2 py-1 bg-[var(--foreground)]/5 rounded mx-1">bgmi-325</span>
                                                                <span className="px-2 py-1 bg-[var(--foreground)]/5 rounded mx-1">bgmi-660</span>
                                                                <span className="px-2 py-1 bg-[var(--foreground)]/5 rounded mx-1">bgmi-1800</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
