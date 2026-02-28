"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Phone, Star, Navigation } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PHARMACIES = [
    { name: "Nexus Health Hub — Koramangala", address: "4th Block, 80 Feet Road, Koramangala, Bangalore", distance: "0.8 km", rating: 4.8, hours: "24 Hours", phone: "+91 80 4567 8901", delivery: true },
    { name: "MedPlus — Indiranagar", address: "100 Feet Road, Indiranagar, Bangalore", distance: "1.2 km", rating: 4.5, hours: "8 AM – 11 PM", phone: "+91 80 4567 8902", delivery: true },
    { name: "Apollo Pharmacy — HSR Layout", address: "Sector 2, HSR Layout, Bangalore", distance: "2.1 km", rating: 4.6, hours: "8 AM – 10 PM", phone: "+91 80 4567 8903", delivery: true },
    { name: "Netmeds Store — BTM Layout", address: "1st Stage, BTM Layout, Bangalore", distance: "3.0 km", rating: 4.3, hours: "9 AM – 9 PM", phone: "+91 80 4567 8904", delivery: false },
    { name: "Wellness Forever — Whitefield", address: "ITPL Main Road, Whitefield, Bangalore", distance: "5.4 km", rating: 4.7, hours: "24 Hours", phone: "+91 80 4567 8905", delivery: true },
];

export default function MapPage() {
    const [selected, setSelected] = useState(0);

    return (
        <div className="min-h-screen bg-nexus-navy text-foreground pb-24">
            <header className="px-6 py-6 flex items-center gap-4 sticky top-0 z-20 bg-[var(--color-nexus-navy)]/90 backdrop-blur-md border-b border-white/5">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <div>
                    <h1 className="font-bold text-xl">Nearby Pharmacies</h1>
                    <p className="text-xs text-gray-400">{PHARMACIES.length} stores found</p>
                </div>
            </header>

            {/* Map Placeholder */}
            <div className="mx-6 mt-4 h-48 rounded-3xl bg-[var(--color-nexus-surface)] border border-white/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-nexus-blue)]/10 to-[var(--color-nexus-pink)]/10"></div>
                {/* Grid lines to simulate map */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(8)].map((_, i) => (
                        <div key={`h${i}`} className="absolute w-full h-[1px] bg-white/30" style={{ top: `${(i + 1) * 12.5}%` }}></div>
                    ))}
                    {[...Array(8)].map((_, i) => (
                        <div key={`v${i}`} className="absolute h-full w-[1px] bg-white/30" style={{ left: `${(i + 1) * 12.5}%` }}></div>
                    ))}
                </div>
                {/* Pin markers */}
                {PHARMACIES.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className={`absolute cursor-pointer ${selected === i ? "z-10" : "z-0"
                            }`}
                        style={{
                            top: `${20 + (i * 15) % 60}%`,
                            left: `${15 + (i * 20) % 70}%`,
                        }}
                        onClick={() => setSelected(i)}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${selected === i
                                ? "pill-gradient scale-125 shadow-[0_0_20px_rgba(255,107,158,0.4)]"
                                : "bg-[var(--color-nexus-blue)] scale-100"
                            }`}>
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                    </motion.div>
                ))}
                {/* Current location marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-500 animate-ping opacity-30"></div>
                </div>
            </div>

            {/* Pharmacy Cards */}
            <div className="px-6 mt-6 space-y-3">
                {PHARMACIES.map((pharmacy, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setSelected(i)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${selected === i
                                ? "bg-[var(--color-nexus-surface)] border-[var(--color-nexus-blue)]/40 shadow-[0_0_15px_rgba(69,196,249,0.1)]"
                                : "bg-[var(--color-nexus-card)] border-white/5 hover:border-white/10"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-sm text-white leading-tight flex-1 mr-3">{pharmacy.name}</h3>
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400" /> {pharmacy.rating}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{pharmacy.address}</p>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-[var(--color-nexus-blue)]">
                                <Navigation className="w-3 h-3" /> {pharmacy.distance}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" /> {pharmacy.hours}
                            </span>
                            {pharmacy.delivery && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-bold uppercase">
                                    Delivery
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
