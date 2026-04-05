"use client";

import { motion } from "framer-motion";
import { FaWhatsapp, FaArrowRight } from "react-icons/fa";
import { HiCode } from "react-icons/hi";

export default function HomeServices() {
  return (
    <section className="py-2 md:py-4 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden group bg-[var(--card)]/40 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] p-4 md:p-6 transition-all duration-500 hover:border-accent/40 shadow-xl hover:shadow-accent/5"
        >
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-[0.03] blur-[40px] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent opacity-[0.02] blur-[40px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Content Side */}
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <HiCode className="text-2xl md:text-3xl text-accent" />
              </div>

              <div>
                <h2 className="text-sm md:text-base font-black tracking-tight text-[var(--foreground)] leading-tight uppercase italic">
                  BUILD YOUR <span className="text-accent underline decoration-accent/30 underline-offset-4">WEBSITE</span>
                </h2>
                <p className="text-[var(--muted)] text-[10px] md:text-xs font-semibold mt-1 max-w-[220px] md:max-w-xs leading-relaxed">
                  Custom software and premium web solutions tailored for your business.
                </p>
              </div>
            </div>

            {/* Contact Text Side */}
            <a
              href="https://wa.me/919178521537"
              target="_blank"
              rel="noopener noreferrer"
              className="group/contact flex flex-col items-center md:items-end gap-1.5"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl transition-all duration-300 group-hover/contact:bg-accent/20">
                <FaWhatsapp className="text-accent text-lg" />
                <span className="text-xs md:text-sm font-black tracking-tight text-[var(--foreground)]">+91 91785 21537</span>
              </div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-60 group-hover/contact:opacity-100 transition-opacity">WhatsApp Us</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

