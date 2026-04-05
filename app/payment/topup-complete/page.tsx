"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Home } from "lucide-react";
import Link from "next/link";

function TopupCompleteContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const orderId = localStorage.getItem("pending_topup_order");
    const invoiceId = searchParams.get("invoiceId");

    if (!orderId) {
      setStatus("failed");
      setMessage("Order not found");
      return;
    }

    async function verify() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/order/verify-topup-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId, invoiceId }),
        });

        const data = await res.json();

        if (data?.success) {
          setStatus("success");
          setMessage("Payment successful!");
          localStorage.removeItem("pending_topup_order");
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment failed or still pending");
        }
      } catch (err) {
        console.error("Topup verification error:", err);
        setStatus("failed");
        setMessage("Unable to verify payment");
      }
    }

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[var(--card)]/80 backdrop-blur-xl rounded-3xl border border-[var(--border)] shadow-2xl p-10 text-center overflow-hidden relative">
          {/* Animated Background Shimmer for Success/Failure */}
          <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : status === 'failed' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]'
            }`} />

          {/* STATUS ICON */}
          <div className="flex justify-center mb-8">
            <AnimatePresence mode="wait">
              {status === "checking" && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Loader2 className="w-16 h-16 animate-spin text-[var(--accent)]" />
                </motion.div>
              )}
              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 p-4 rounded-full"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </motion.div>
              )}
              {status === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 p-4 rounded-full"
                >
                  <XCircle className="w-16 h-16 text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MESSAGE */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-black tracking-tight mb-4 text-[var(--foreground)]"
          >
            {message}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-[var(--muted)] leading-relaxed px-4"
          >
            {status === "checking" &&
              "Please wait while we confirm your top-up payment. This usually takes a few seconds."}

            {status === "success" &&
              "Your order has been confirmed and will be delivered automatically. Thank you for choosing us!"}

            {status === "failed" &&
              "If money was deducted, diamonds will be credited in 10-15 min or you will get a refund."}
          </motion.p>

          {/* ACTION */}
          <div className="mt-10 space-y-3">
            <Link href="/" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-2xl bg-[var(--accent)] py-4 font-black text-[var(--background)] hover:brightness-110 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
              >
                <Home size={18} className="group-hover:scale-110 transition-transform" />
                Return Home
              </motion.button>
            </Link>

            {status === "failed" && (
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Try Verifying Again
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
export default function TopupComplete() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" />
      </div>
    }>
      <TopupCompleteContent />
    </Suspense>
  );
}
