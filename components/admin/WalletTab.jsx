"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiMinus, FiClock, FiUser, FiActivity, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function WalletTab() {
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustType, setAdjustType] = useState("add");
    const [adjustDescription, setAdjustDescription] = useState("");
    const [adjusting, setAdjusting] = useState(false);
    const [totalWalletCredit, setTotalWalletCredit] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [subTab, setSubTab] = useState("manage"); // manage or history
    const limit = 10;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/users/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setTotalWalletCredit(data.stats.totalWalletCredit || 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                page: page.toString(),
                limit: limit.toString(),
                sortBy: "wallet",
                order: "desc"
            });
            const res = await fetch(`/api/admin/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/admin/wallet/transactions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdjustWallet = async () => {
        if (!selectedUser || !adjustAmount || isNaN(adjustAmount)) {
            alert("Please enter a valid amount and select a user");
            return;
        }

        setAdjusting(true);
        try {
            const res = await fetch("/api/admin/wallet/adjust", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: selectedUser.userId,
                    amount: parseFloat(adjustAmount),
                    type: adjustType,
                    description: adjustDescription,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert("Wallet adjusted successfully!");
                setAdjustAmount("");
                setAdjustDescription("");
                setSelectedUser(null);
                fetchUsers();
                fetchTransactions();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to adjust wallet");
        } finally {
            setAdjusting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* TOTAL SYSTEM BALANCE STAT */}
            <div className="p-3 sm:p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm flex items-center justify-between group hover:border-[var(--accent)] transition-all">
                <div className="space-y-0.5">
                    <p className="text-[8px] sm:text-[9px] font-bold text-[var(--muted)]/60 uppercase tracking-[0.1em] leading-tight">Total System Liability</p>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--accent)] tabular-nums leading-none">₹{totalWalletCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform">
                    <FiActivity size={18} />
                </div>
            </div>

            <div className="flex p-0.5 sm:p-1 bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-sm mx-auto shadow-sm">
                {["manage", "history"].map(t => (
                    <button
                        key={t}
                        onClick={() => setSubTab(t)}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${subTab === t ? 'bg-[var(--accent)] text-black shadow-lg' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {subTab === "manage" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">

                    {/* LEFT: USER WALLET MANAGEMENT */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <FiUser className="text-[var(--accent)]" />
                                User Wallets
                            </h3>
                            <div className="relative w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search user..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none"
                                />
                                <FiSearch className="absolute left-3 top-3 sm:top-2.5 text-[var(--muted)]" />
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)]/50">
                            {loading ? (
                                <div className="p-10 text-center animate-pulse text-[var(--muted)]">Loading users...</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] z-10 text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                                        <tr>
                                            <th className="px-3 py-2.5">User</th>
                                            <th className="px-3 py-2.5 text-right whitespace-nowrap">Balance</th>
                                            <th className="px-3 py-2.5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {users.map(user => (
                                            <tr key={user._id} className="hover:bg-[var(--accent)]/5 transition-colors group">
                                                <td className="px-3 py-2.5 min-w-0">
                                                    <p className="font-bold text-[var(--foreground)] text-[12px] truncate max-w-[120px] leading-tight">{user.name || "N/A"}</p>
                                                    <p className="text-[10px] text-[var(--muted)]/60 truncate max-w-[120px] leading-tight mt-0.5">{user.email || user.phone}</p>
                                                </td>
                                                <td className="px-3 py-2.5 text-right">
                                                    <span className="font-black text-[var(--accent)] text-[13px] tabular-nums">₹{user.wallet?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="px-2.5 py-1 bg-[var(--accent)] text-white text-[9px] font-bold uppercase rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan="3" className="p-10 text-center text-[var(--muted)]">No users found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-20 transition-all"
                                >
                                    <FiChevronLeft />
                                </button>
                                <span className="text-xs font-bold text-[var(--muted)]">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-20 transition-all"
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: ADJUSTMENT FORM OR RECENT ACTIVITY */}
                    <div className="space-y-6">
                        {selectedUser ? (
                            <div className="p-4 sm:p-6 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 space-y-4 sm:space-y-5 animate-in slide-in-from-right duration-300">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base sm:text-lg font-bold">Adjust Wallet</h3>
                                    <button onClick={() => setSelectedUser(null)} className="text-[10px] sm:text-xs text-[var(--muted)] hover:text-red-500">Cancel</button>
                                </div>

                                <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold">
                                        {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p className="font-bold">{selectedUser.name}</p>
                                        <p className="text-xs text-[var(--muted)]">Current: ₹{selectedUser.wallet?.toFixed(2) || "0.00"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-2 p-1 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                        <button
                                            onClick={() => setAdjustType("add")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${adjustType === 'add' ? 'bg-green-500 text-white shadow-md' : 'text-[var(--muted)]'}`}
                                        >
                                            <FiPlus /> Add Credits
                                        </button>
                                        <button
                                            onClick={() => setAdjustType("remove")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${adjustType === 'remove' ? 'bg-red-500 text-white shadow-md' : 'text-[var(--muted)]'}`}
                                        >
                                            <FiMinus /> Remove Credits
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-[var(--muted)] uppercase">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={adjustAmount}
                                            onChange={(e) => setAdjustAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-[var(--muted)] uppercase">Description (Optional)</label>
                                        <input
                                            type="text"
                                            value={adjustDescription}
                                            onChange={(e) => setAdjustDescription(e.target.value)}
                                            placeholder="e.g. Refund for Order #123"
                                            className="w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleAdjustWallet}
                                        disabled={adjusting}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${adjustType === 'add' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50`}
                                    >
                                        {adjusting ? "Processing..." : `Confirm ${adjustType.toUpperCase()}`}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center p-10 border-2 border-dashed border-[var(--border)] rounded-2xl text-[var(--muted)]">
                                <FiActivity className="text-4xl mb-4 opacity-20" />
                                <p>Select a user to manage their wallet balance</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* RECENT WALLET TRANSACTIONS */
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FiClock className="text-orange-500" />
                        Global Wallet Activity
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Transaction</th>
                                    <th className="px-6 py-4 font-semibold">User ID</th>
                                    <th className="px-6 py-4 font-semibold">Activity</th>
                                    <th className="px-6 py-4 font-semibold text-right">Balance After</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {transactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-[var(--background)]/30">
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-[10px] font-bold text-[var(--foreground)]">{tx.transactionId}</p>
                                            <p className="text-[10px] text-[var(--muted)]/60 truncate max-w-[180px] mt-0.5">{tx.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-[var(--muted)]">{tx.userId}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`font-black text-[13px] tabular-nums ${tx.type === 'deposit' || tx.type === 'admin_add' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {tx.type === 'deposit' || tx.type === 'admin_add' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                                </span>
                                                <span className={`w-fit px-1.5 py-0.5 rounded text-[8px] uppercase font-black tracking-widest ${tx.type === 'deposit' || tx.type === 'admin_add' || tx.type === 'refund' ? 'bg-green-500/10 text-green-500' :
                                                    tx.type === 'payment' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[11px] font-bold text-[var(--foreground)]">₹{tx.balanceAfter?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tx.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                                tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-medium text-[var(--foreground)]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[9px] text-[var(--muted)]/60 mt-0.5">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-wrap items-center justify-center gap-1.5 min-w-[120px]">
                                                {/* GATEWAY VERIFY (PENDING DEPOSITS ONLY) */}
                                                {tx.status === "pending" && tx.type === "deposit" && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm("Check gateway for this payment?")) return;
                                                            try {
                                                                const res = await fetch("/api/admin/wallet/verify", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                        Authorization: `Bearer ${token}`
                                                                    },
                                                                    body: JSON.stringify({ orderId: tx.transactionId })
                                                                });
                                                                const data = await res.json();
                                                                alert(data.message);
                                                                fetchTransactions();
                                                                fetchUsers();
                                                            } catch (err) {
                                                                alert("Verification failed");
                                                            }
                                                        }}
                                                        className="px-2 py-1 bg-[var(--accent)] text-black text-[9px] font-bold rounded hover:brightness-110"
                                                        title="Gateway Verify"
                                                    >
                                                        Verify
                                                    </button>
                                                )}

                                                {/* MANUAL SUCCESS (ANY NON-SUCCESS) */}
                                                {tx.status !== "success" && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm("Manually mark this as SUCCESS? (Overwrites gateway check and credits user)")) return;
                                                            try {
                                                                const res = await fetch("/api/admin/wallet/mark-success", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                        Authorization: `Bearer ${token}`
                                                                    },
                                                                    body: JSON.stringify({ orderId: tx.transactionId })
                                                                });
                                                                const data = await res.json();
                                                                alert(data.message);
                                                                fetchTransactions();
                                                                fetchUsers();
                                                            } catch (err) {
                                                                alert("Failed to mark success");
                                                            }
                                                        }}
                                                        className="px-2 py-1 bg-green-600 text-white text-[9px] font-bold rounded hover:bg-green-500"
                                                        title="Manual Success"
                                                    >
                                                        M-Success
                                                    </button>
                                                )}

                                                {/* MARK FAILED (ALWAYS SHOW) */}
                                                <button
                                                    onClick={async () => {
                                                        const msg = tx.status === "success"
                                                            ? "CAUTION: This transaction is already SUCCESS. Marking as failed will DEDUCT the amount from the user's wallet to revert it. Continue?"
                                                            : "Mark this transaction as failed?";
                                                        if (!confirm(msg)) return;
                                                        try {
                                                            const res = await fetch("/api/admin/wallet/mark-failed", {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                    Authorization: `Bearer ${token}`
                                                                },
                                                                body: JSON.stringify({ orderId: tx.transactionId })
                                                            });
                                                            const data = await res.json();
                                                            alert(data.message);
                                                            fetchTransactions();
                                                            fetchUsers();
                                                        } catch (err) {
                                                            alert("Failed to update transaction");
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-red-600 text-white text-[9px] font-bold rounded hover:bg-red-500"
                                                    title="Mark Failed"
                                                >
                                                    Fail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr><td colSpan="9" className="p-10 text-center text-[var(--muted)]">No transactions found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
