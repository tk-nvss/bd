"use client";

import { FiX } from "react-icons/fi";

export default function GamesFilterModal({
  open,
  onClose,
  sort,
  setSort,
  hideOOS,
  setHideOOS,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[var(--background)] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-[var(--border)] shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 blur-3xl pointer-events-none" />
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase text-[var(--foreground)]">
            Filter & Sort
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* SORT */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-3">Sort By</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSort("az")}
              className={`flex-1 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${
                sort === "az"
                  ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                  : "bg-[var(--card)]/40 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]"
              }`}
            >
              A – Z
            </button>
            <button
              onClick={() => setSort("za")}
              className={`flex-1 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${
                sort === "za"
                  ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                  : "bg-[var(--card)]/40 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]"
              }`}
            >
              Z – A
            </button>
          </div>
        </div>

        {/* HIDE OOS */}
        <label className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[var(--foreground)] mb-8 cursor-pointer group">
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${hideOOS ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--card)]/40 border-[var(--border)] group-hover:border-[var(--muted)]'}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={hideOOS}
              onChange={(e) => setHideOOS(e.target.checked)}
            />
            {hideOOS && <FiX className="text-black" size={14} />}
          </div>
          Hide Out-of-Stock
        </label>

        {/* APPLY */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-[var(--accent)] text-black font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-transform"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
