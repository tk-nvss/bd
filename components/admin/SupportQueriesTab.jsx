"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
  Inbox
} from "lucide-react";

export default function SupportQueriesTab() {
  const [queries, setQueries] = useState([]);
  const [activeQuery, setActiveQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    v1d: 0,
    v7d: 0,
    v30d: 0,
    open: 0,
    progress: 0,
    resolved: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, [page, limit, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  /* ================= FETCH QUERIES ================= */
  const fetchQueries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/support-queries?page=${page}&limit=${limit}&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setQueries(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch support queries failed", err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/support-queries/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch stats failed", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchQueries();
    fetchStats();
  };

  /* ================= UPDATE QUERY STATUS ================= */
  const updateQueryStatus = async (id, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/support-queries/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update status");
        return;
      }

      fetchQueries();
    } finally {
      setUpdating(false);
    }
  };

  const statusMeta = {
    open: {
      label: "Open",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <AlertCircle size={12} />
    },
    in_progress: {
      label: "In Progress",
      class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <RefreshCcw size={12} className="animate-spin-slow" />
    },
    resolved: {
      label: "Resolved",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />
    },
    closed: {
      label: "Closed",
      class: "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]",
      icon: <X size={12} />
    },
  };

  const getStatus = (status) => status || "open";

  return (
    <div className="space-y-6 pb-6 px-4 md:px-0 max-w-full overflow-x-hidden">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Support Queries</h2>
          <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">
            Manage your customer support messages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2">
            <span className="text-[9px] font-bold text-[var(--muted)] uppercase">
              {pagination.total} Total
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] outline-none active:scale-95 transition-all"
          >
            <RefreshCcw size={14} className={loading || statsLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VOLUME GROUP */}
        <StatGroup
          title="QUERIES VOLUME"
          icon={<MessageSquare size={14} />}
          color="blue"
        >
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="1D" value={stats.v1d} />
            <StatBox label="7D" value={stats.v7d} />
            <StatBox label="30D" value={stats.v30d} />
          </div>
        </StatGroup>

        {/* STATUS GROUP */}
        <StatGroup
          title="QUERY STATUS"
          icon={<AlertCircle size={14} />}
          color="emerald"
        >
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="OPEN" value={stats.open} />
            <StatBox label="ACTIVE" value={stats.progress} />
            <StatBox label="DONE" value={stats.resolved} />
          </div>
        </StatGroup>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search queries..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none placeholder:text-[var(--muted)]/40"
          />
        </div>
        <button className="h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] flex items-center justify-center gap-2 hover:bg-[var(--foreground)]/[0.05] transition-all sm:w-max group">
          <Filter size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-bold uppercase text-[var(--muted)] group-hover:text-[var(--foreground)]">Filter</span>
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center space-y-3"
            >
              <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
              <p className="text-xs font-bold text-[var(--muted)]/40 uppercase tracking-widest">Loading...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {queries.map((q, idx) => {
                const status = getStatus(q.status);
                const meta = statusMeta[status];

                return (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setActiveQuery(q)}
                    className="group relative rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.01] hover:bg-[var(--foreground)]/[0.03] transition-all cursor-pointer p-3.5 flex items-center gap-4"
                  >
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                      style={{ backgroundColor: meta.label === 'Open' ? '#f59e0b' : meta.label === 'Resolved' ? '#10b981' : '#3b82f6' }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[7px] font-bold uppercase tracking-wider ${meta.class}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                        <span className="text-[9px] font-medium text-[var(--muted)]/40 tabular-nums">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-[13px] font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] leading-tight">
                        {q.email || "Unknown User"}
                      </h4>

                      <p className="text-[10px] text-[var(--muted)]/60 truncate mt-0.5">
                        {q.message}
                      </p>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 shrink-0">
                      <ChevronRight size={14} />
                    </div>
                  </motion.div>
                );
              })}

              {!queries.length && (
                <div className="py-16 text-center border border-dashed border-[var(--border)] rounded-2xl">
                  <Inbox className="mx-auto text-[var(--muted)]/20 mb-2" size={32} />
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">No queries found</p>
                </div>
              )}

              {/* ================= PAGINATION ================= */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase">
                    Page {pagination.page} / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-20 transition-all"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-20 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {activeQuery && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuery(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--foreground)]">Query Details</h3>
                <button
                  onClick={() => setActiveQuery(null)}
                  className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--foreground)] hover:bg-red-500/20 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailBlock label="Email" value={activeQuery.email || "N/A"} icon={<Mail size={12} />} />
                  <DetailBlock label="Phone" value={activeQuery.phone || "N/A"} icon={<Phone size={12} />} />
                  <DetailBlock label="Type" value={activeQuery.type} emphasize icon={<MessageSquare size={12} />} />
                  <DetailBlock label="Date" value={new Date(activeQuery.createdAt).toLocaleString()} icon={<Clock size={12} />} />
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase">Message</p>
                  <p className="text-sm font-medium leading-relaxed text-[var(--foreground)]">
                    {activeQuery.message}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase ml-1">Status</p>
                  <CustomDropdown
                    value={getStatus(activeQuery.status)}
                    onChange={(newStatus) => {
                      updateQueryStatus(activeQuery._id, newStatus);
                      setActiveQuery(null);
                    }}
                    disabled={updating}
                    options={[
                      { value: "open", label: "Open" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "resolved", label: "Resolved" },
                      { value: "closed", label: "Closed" },
                    ]}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function CustomDropdown({ value, onChange, options, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full h-11 px-4 
          rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          text-xs font-bold uppercase transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.08] active:scale-[0.98]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : "text-[var(--foreground)]"}
        `}
      >
        <span className={value === "resolved" ? "text-emerald-500" : value === "in_progress" ? "text-blue-500" : value === "open" ? "text-amber-500" : "text-[var(--foreground)]/40"}>
          {selectedOption?.label}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-300 text-[var(--muted)] ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-[1110] w-full rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase rounded-lg transition-all
                  ${option.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBlock({ label, value, emphasize, icon }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase flex items-center gap-1.5">
        <span className="text-[var(--accent)]">{icon}</span> {label}
      </p>
      <p className={`text-sm font-bold ${emphasize ? "text-[var(--accent)] capitalize italic" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}

function StatGroup({ title, icon, color, children }) {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="p-4 rounded-3xl bg-[var(--card)] border border-[var(--border)] relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${colors[color] || colors.blue}`}>
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="py-2.5 px-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex flex-col items-center justify-center hover:border-[var(--accent)]/30 hover:bg-[var(--foreground)]/[0.05] transition-all">
      <span className="text-[8px] font-bold text-[var(--muted)]/40 uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">{value}</span>
    </div>
  );
}
