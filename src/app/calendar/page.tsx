"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Check, Clock, Pill } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SCHEDULE = [
    { time: "08:00 AM", medicine: "Metformin 500mg", dosage: "1 Tablet", status: "taken", category: "Diabetes" },
    { time: "08:00 AM", medicine: "Amlodipine 5mg", dosage: "1 Tablet", status: "taken", category: "Cardiac" },
    { time: "01:00 PM", medicine: "Metformin 500mg", dosage: "1 Tablet", status: "upcoming", category: "Diabetes" },
    { time: "06:00 PM", medicine: "Omeprazole 20mg", dosage: "1 Capsule", status: "upcoming", category: "Gastro" },
    { time: "09:00 PM", medicine: "Atorvastatin 10mg", dosage: "1 Tablet", status: "upcoming", category: "Cardiac" },
];

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function CalendarPage() {
    const [selectedDay, setSelectedDay] = useState(4); // Friday (today)

    return (
        <div className="min-h-screen bg-nexus-navy text-foreground pb-24">
            <header className="px-6 py-6 flex items-center gap-4 sticky top-0 z-20 bg-[var(--color-nexus-navy)]/90 backdrop-blur-md border-b border-white/5">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <div>
                    <h1 className="font-bold text-xl">Dose Calendar</h1>
                    <p className="text-xs text-gray-400">February 2026</p>
                </div>
            </header>

            <div className="px-6 py-4 space-y-6">
                {/* Week Day Selector */}
                <div className="flex justify-between gap-2">
                    {WEEK_DAYS.map((day, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedDay(i)}
                            className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all ${selectedDay === i
                                ? "pill-gradient shadow-[0_0_20px_rgba(69,196,249,0.3)] text-white"
                                : "bg-[var(--color-nexus-card)] border border-white/5 text-gray-400 hover:text-white"
                                }`}
                        >
                            <span className="text-[10px] font-medium uppercase">{day}</span>
                            <span className="text-lg font-bold mt-1">{24 + i}</span>
                        </button>
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">
                            {SCHEDULE.filter((s) => s.status === "taken").length}
                        </p>
                        <p className="text-[10px] text-green-400/60 font-bold uppercase mt-1">Taken</p>
                    </div>
                    <div className="flex-1 bg-[var(--color-nexus-blue)]/10 border border-[var(--color-nexus-blue)]/20 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-bold text-[var(--color-nexus-blue)]">
                            {SCHEDULE.filter((s) => s.status === "upcoming").length}
                        </p>
                        <p className="text-[10px] text-[var(--color-nexus-blue)]/60 font-bold uppercase mt-1">Remaining</p>
                    </div>
                    <div className="flex-1 bg-[var(--color-nexus-pink)]/10 border border-[var(--color-nexus-pink)]/20 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-bold text-[var(--color-nexus-pink)]">{SCHEDULE.length}</p>
                        <p className="text-[10px] text-[var(--color-nexus-pink)]/60 font-bold uppercase mt-1">Total</p>
                    </div>
                </div>

                {/* Schedule List */}
                <div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Today's Schedule</h2>
                    <div className="space-y-3">
                        {SCHEDULE.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.status === "taken"
                                    ? "bg-green-500/5 border-green-500/20"
                                    : "bg-[var(--color-nexus-card)] border-white/5"
                                    }`}
                            >
                                {/* Status Indicator */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.status === "taken"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-[var(--color-nexus-surface)] text-gray-400"
                                        }`}
                                >
                                    {item.status === "taken" ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-sm ${item.status === "taken" ? "text-green-400 line-through opacity-60" : "text-white"}`}>
                                        {item.medicine}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.dosage} • {item.category}</p>
                                </div>

                                {/* Time */}
                                <span className={`text-xs font-bold shrink-0 ${item.status === "taken" ? "text-green-400/50" : "text-[var(--color-nexus-blue)]"}`}>
                                    {item.time}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
