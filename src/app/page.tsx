"use client";

import { motion } from "framer-motion";
import { Mic, Search, Upload, Stethoscope, Package, Bell, MessageSquare, Menu, Home, Calendar, MapPin, Receipt, Pill } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";

function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const cart = localStorage.getItem("nexus_cart");
    if (cart) {
      try { setCount(JSON.parse(cart).length); } catch { setCount(0); }
    }
  }, []);
  if (count === 0) return null;
  return (
    <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[var(--color-nexus-blue)] text-[8px] flex items-center justify-center text-[var(--color-nexus-navy)] font-bold">{count}</span>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string, patient_id: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("nexus_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-hidden">

      {/* Top Header */}
      <header className="px-6 py-8 flex justify-between items-center z-10 relative">
        <Link href={user ? "/profile" : "/auth/login"} className="flex-1">
          <div className="flex items-center gap-4 group cursor-pointer w-fit">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-nexus-surface)] shadow-[0_0_15px_rgba(255,107,158,0.2)] group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-gradient-to-tr from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] flex items-center justify-center text-white font-bold text-lg">
                {user ? (user.name || "U").substring(0, 2).toUpperCase() : "JS"}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                {user ? "Welcome back" : "Sign In"}
              </p>
              <h1 className="text-xl font-bold tracking-tight line-clamp-1">
                {user ? (user.name || "User") : "Guest User"}
              </h1>
            </div>
          </div>
        </Link>
        {user && (
          <button
            onClick={() => {
              localStorage.removeItem("nexus_user");
              window.location.reload();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0 ml-4"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        )}
        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/5 relative">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[var(--color-nexus-pink)] neon-glow"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="px-6 space-y-8 z-10 relative pb-28">

        {/* Search Bar - Replicating the "pill" style heavily rounded */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative flex items-center bg-[var(--color-nexus-card)] border border-white/10 rounded-full px-5 py-4 shadow-lg">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Ask AI or search medicines..."
              className="bg-transparent border-none outline-none flex-1 text-[var(--foreground)] placeholder:text-gray-500 font-medium"
            />
            <button className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Grid (The core requested feature cards) */}
        <section>
          <div className="grid grid-cols-2 gap-4">

            {/* Find Medicine */}
            <Link href="/medicines" className="col-span-1 block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full rounded-[2rem] bg-gradient-to-b from-[#1E1E35] to-[var(--color-nexus-card)] border border-white/5 p-5 flex flex-col items-center justify-center gap-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-nexus-blue)]/10 rounded-full blur-lg -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
                <div className="w-14 h-14 rounded-full bg-[var(--color-nexus-surface)] flex items-center justify-center">
                  <Pill className="w-7 h-7 text-[var(--color-nexus-blue)]" />
                </div>
                <span className="font-semibold text-sm tracking-wide">Find Medicine</span>
              </motion.div>
            </Link>

            {/* Upload Prescription */}
            <Link href="/upload" className="col-span-1 block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full rounded-[2rem] bg-gradient-to-b from-[#1E1E35] to-[var(--color-nexus-card)] border border-white/5 p-5 flex flex-col items-center justify-center gap-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-[var(--color-nexus-pink)]/10 rounded-full blur-lg -ml-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
                <div className="w-14 h-14 rounded-full bg-[var(--color-nexus-surface)] flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[var(--color-nexus-pink)]" />
                </div>
                <span className="font-semibold text-sm tracking-wide">Upload RX</span>
              </motion.div>
            </Link>

            {/* Consult AI Assistant */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="col-span-2 rounded-[2rem] box-border p-[1px] bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] shadow-lg group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] rounded-[2rem] blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Link href="/chat">
                <div className="relative rounded-[calc(2rem-1px)] bg-[var(--color-nexus-navy)] p-5 flex items-center justify-between overflow-hidden h-full">
                  <div className="flex items-center gap-4 z-10">
                    <div className="w-14 h-14 rounded-full pill-gradient flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Consult AI</h3>
                      <p className="text-sm text-gray-400">Ask your virtual pharmacist</p>
                    </div>
                  </div>
                  {/* Decorative wave background inside card */}
                  <div className="absolute right-[-20%] bottom-[-50%] w-48 h-48 bg-[var(--color-nexus-blue)] opacity-10 rounded-full blur-xl"></div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Proactive Refill Alerts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight">Proactive Alerts</h2>
            <span className="text-sm text-[var(--color-nexus-blue)] font-medium cursor-pointer">View All</span>
          </div>

          <div className="card-glass rounded-3xl p-5 border border-white/10 relative overflow-hidden">
            {/* Accent border strip on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 pill-gradient"></div>

            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-nexus-surface)] flex items-center justify-center border border-white/5">
                  <span className="text-2xl">💊</span>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">Metformin 500mg</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Supply runs out in <strong className="text-[var(--color-nexus-pink)]">3 days</strong></p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link href="/chat" className="flex-1 flex">
                <button className="w-full py-3 rounded-xl pill-gradient text-white font-bold text-sm shadow-lg hover:shadow-[0_0_20px_rgba(69,196,249,0.4)] transition-shadow">
                  Refill Now
                </button>
              </Link>
              <button
                onClick={() => alert("Reminder set for tomorrow!")}
                className="flex-1 py-3 rounded-xl bg-[var(--color-nexus-surface)] border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors"
              >
                Remind Later
              </button>
            </div>
          </div>
        </section>

        {/* Recent Orders - Just a quick list section */}
        <section>
          <h2 className="text-lg font-bold tracking-tight mb-4">Recent Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {['Diabetes', 'Cardiac', 'Vitamins', 'First Aid'].map((cat, i) => (
              <div key={Math.random()} className="min-w-[120px] shrink-0 p-4 rounded-2xl bg-[var(--color-nexus-card)] border border-white/5 text-center shadow-lg">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-nexus-surface)] flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-sm font-medium">{cat}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Floating Bottom Navigation (resembling the light UI reference closely in shape, but dark mode) */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <div className="card-glass mx-auto max-w-sm rounded-[2rem] p-2 flex justify-between items-center shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Subtle bottom glow behind nav */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[var(--color-nexus-blue)]/20 blur-lg"></div>

          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-[var(--color-nexus-pink)]">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/calendar" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-white transition-colors">
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Calendar</span>
          </Link>

          <div className="flex-1 flex justify-center -mt-8 relative z-10">
            <Link href="/medicines" className="w-14 h-14 rounded-full pill-gradient p-1 shadow-[0_4px_20px_rgba(255,107,158,0.4)] block">
              <div className="w-full h-full rounded-full bg-[var(--color-nexus-navy)] flex items-center justify-center border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                <Search className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>

          <Link href="/map" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-white transition-colors">
            <MapPin className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Map</span>
          </Link>
          <Link href="/cart" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-white transition-colors relative">
            <Receipt className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Cart</span>
            <CartBadge />
          </Link>
        </div>
      </nav>

    </div>
  );
}
