"use client";

import { useState, useEffect } from "react";
import { FiSettings, FiAlertTriangle, FiCheckCircle, FiPower } from "react-icons/fi";
import { motion } from "framer-motion";

export default function SettingsTab() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.success) {
                setMaintenanceMode(data.settings.maintenanceMode);
            }
        } catch (err) {
            console.error("Fetch settings error:", err);
            setError("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ maintenanceMode: !maintenanceMode }),
            });

            const data = await res.json();
            if (data.success) {
                setMaintenanceMode(data.settings.maintenanceMode);
                setSuccess(`Maintenance mode ${data.settings.maintenanceMode ? "ENABLED" : "DISABLED"} successfully`);

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(data.message || "Failed to update settings");
            }
        } catch (err) {
            console.error("Update settings error:", err);
            setError("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--accent)]/10 rounded-xl">
                    <FiSettings className="text-lg text-[var(--accent)]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)]">System Settings</h2>
                    <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">Manage global site configurations</p>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-3"
                >
                    <FiAlertTriangle className="flex-shrink-0" />
                    {error}
                </motion.div>
            )}
            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm flex items-center gap-3"
                >
                    <FiCheckCircle className="flex-shrink-0" />
                    {success}
                </motion.div>
            )}

            {/* Maintenance Mode Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-6 border-b border-[var(--border)] bg-gray-50/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${maintenanceMode ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                <FiPower className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--foreground)]">Maintenance Mode</h3>
                                <p className="text-xs text-[var(--muted)]">When enabled, users will see the maintenance screen</p>
                            </div>
                        </div>

                        <button
                            onClick={handleToggle}
                            disabled={saving}
                            className={`
                                relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
                                ${maintenanceMode ? 'bg-orange-500' : 'bg-[var(--foreground)]/10'}
                                ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            aria-label="Toggle Maintenance Mode"
                        >
                            <span className="sr-only">Toggle Maintenance Mode</span>
                            <span
                                className={`
                                    ${maintenanceMode ? 'translate-x-[20px]' : 'translate-x-0'}
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                                `}
                            />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 bg-[var(--background)]/50">
                    <div className="flex items-start gap-4">
                        <FiAlertTriangle className="text-orange-500 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-[var(--muted)]">Important Information:</p>
                            <ul className="text-[11px] text-[var(--muted)] list-disc list-inside space-y-1">
                                <li>Enabling maintenance mode will affect all non-owners immediately.</li>
                                <li>Owners and Admins can still access the panel and bypass the overlay.</li>
                                <li>The login page remains accessible for session restoration.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <p className="text-center text-[10px] uppercase tracking-widest text-[var(--muted)] opacity-50">
                System Config • {process.env.NEXT_PUBLIC_BRAND_NAME || "Bdcoins"} Control Center
            </p>
        </div>
    );
}
