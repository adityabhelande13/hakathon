"use client";

import { motion } from "framer-motion";
import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { Lock, User, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const adminData = localStorage.getItem("nexus_admin");
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                if (parsed.authenticated && parsed.token) {
                    setIsAuthenticated(true);
                }
            } catch { }
        }
        setChecking(false);
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-nexus-navy flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLoginGate onSuccess={() => setIsAuthenticated(true)} />;
    }

    return <AdminDashboard onLogout={() => { localStorage.removeItem("nexus_admin"); setIsAuthenticated(false); }} />;
}


// ── Admin Login Gate ──────────────────────────────────

function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(apiUrl("/api/admin/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (data.authenticated) {
                localStorage.setItem("nexus_admin", JSON.stringify(data));
                onSuccess();
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch {
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-hidden">
            <div className="absolute inset-0 bg-nexus-navy overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
            <div className="absolute top-6 left-6 z-20">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative z-10 w-full max-w-md mx-auto"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] relative">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Admin Access</h1>
                <p className="text-gray-400 text-center text-sm mb-8">Pharmacy Management Console</p>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <User className="w-5 h-5 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setError(""); }}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-transparent block w-full pl-12 p-4 transition-all"
                            placeholder="Admin Username"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-transparent block w-full pl-12 p-4 transition-all"
                            placeholder="Admin Password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 ${loading
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Authenticating...
                            </span>
                        ) : (
                            "Sign In as Admin"
                        )}
                    </button>
                </form>

                <div className="mt-4 p-3 rounded-xl bg-[var(--color-nexus-surface)] border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Demo Credentials</p>
                    <p className="text-xs text-gray-400">admin / nexus2026</p>
                </div>
            </motion.div>
        </div>
    );
}


// ── Admin Dashboard (the existing one, now behind auth) ──

import { AnimatePresence } from "framer-motion";
import {
    Package, Clock, CheckCircle2, Truck, AlertTriangle,
    RefreshCw, Bell, ChevronDown, ChevronUp, Search, LogOut
} from "lucide-react";
import { useCallback } from "react";

interface Order {
    order_id: string;
    patient_id: string;
    patient_name: string;
    product_id: string;
    product_name: string;
    quantity: number;
    total_price: number;
    purchase_date: string;
    dosage_frequency: string;
    status: string;
}

interface Stats {
    count: number;
    pending: number;
    delivered: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    confirmed: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Bell, label: "New Order" },
    processing: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Clock, label: "Processing" },
    shipped: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Truck, label: "Shipped" },
    delivered: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: CheckCircle2, label: "Delivered" },
    cancelled: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle, label: "Cancelled" },
};

const STATUS_FLOW = ["confirmed", "processing", "shipped", "delivered"];

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({ count: 0, pending: 0, delivered: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [newOrderAlert, setNewOrderAlert] = useState(false);
    const [lastCount, setLastCount] = useState(0);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(apiUrl("/api/admin/orders"));
            const data = await res.json();
            setOrders(data.orders);
            setStats({ count: data.count, pending: data.pending, delivered: data.delivered });
            if (lastCount > 0 && data.count > lastCount) {
                setNewOrderAlert(true);
                setTimeout(() => setNewOrderAlert(false), 3000);
            }
            setLastCount(data.count);
            setLoading(false);
        } catch {
            setLoading(false);
        }
    }, [lastCount]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await fetch(apiUrl(`/api/admin/orders/${orderId}/status`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchOrders();
        } catch { }
    };

    const getNextStatus = (current: string): string | null => {
        const idx = STATUS_FLOW.indexOf(current);
        if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
        return null;
    };

    const filteredOrders = orders.filter((o) => {
        if (filter !== "all" && o.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return o.order_id.toLowerCase().includes(q) || o.product_name.toLowerCase().includes(q) || o.patient_name.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-nexus-navy text-foreground pb-8">
            <AnimatePresence>
                {newOrderAlert && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-black py-3 px-6 text-center font-bold text-sm shadow-lg"
                    >
                        🔔 New order received! Check your order queue.
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="px-6 py-6 flex items-center gap-4 sticky top-0 z-20 bg-[var(--color-nexus-navy)]/90 backdrop-blur-md border-b border-white/5">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <div className="flex-1">
                    <h1 className="font-bold text-xl">Pharmacy Admin</h1>
                    <p className="text-xs text-gray-400">Order Management Dashboard</p>
                </div>
                <button onClick={fetchOrders} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={onLogout} className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors" title="Logout">
                    <LogOut className="w-4 h-4 text-red-400" />
                </button>
            </header>

            <div className="px-6 pt-4 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[var(--color-nexus-card)] border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.count}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Total Orders</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                        <p className="text-[10px] text-amber-400/60 font-bold uppercase mt-1">Pending</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.delivered}</p>
                        <p className="text-[10px] text-green-400/60 font-bold uppercase mt-1">Delivered</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders, products, patients..." className="w-full bg-[var(--color-nexus-card)] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-[var(--color-nexus-blue)]" />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {["all", "confirmed", "processing", "shipped", "delivered"].map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all capitalize ${filter === f ? "pill-gradient text-white shadow-[0_0_10px_rgba(69,196,249,0.3)]" : "bg-[var(--color-nexus-card)] border border-white/10 text-gray-400 hover:text-white"}`}>
                            {f === "all" ? "All Orders" : STATUS_CONFIG[f]?.label || f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 rounded-2xl bg-[var(--color-nexus-card)] animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order, i) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
                            const StatusIcon = config.icon;
                            const nextStatus = getNextStatus(order.status);
                            const isExpanded = expandedOrder === order.order_id;

                            return (
                                <motion.div key={order.order_id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`rounded-2xl border transition-all ${config.bg}`}>
                                    <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                                            <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-sm text-white truncate">{order.product_name}</h3>
                                                {order.status === "confirmed" && (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[8px] font-black uppercase animate-pulse">NEW</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{order.patient_name} • Qty: {order.quantity} • ₹{order.total_price}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[10px] font-bold uppercase ${config.color}`}>{config.label}</span>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div><span className="text-gray-500">Order ID:</span> <span className="text-white font-mono">{order.order_id}</span></div>
                                                        <div><span className="text-gray-500">Patient ID:</span> <span className="text-white font-mono">{order.patient_id}</span></div>
                                                        <div><span className="text-gray-500">Date:</span> <span className="text-white">{order.purchase_date}</span></div>
                                                        <div><span className="text-gray-500">Dosage:</span> <span className="text-white">{order.dosage_frequency.replace("_", " ")}</span></div>
                                                    </div>
                                                    <div className="flex items-center gap-1 pt-2">
                                                        {STATUS_FLOW.map((s, idx) => {
                                                            const currentIdx = STATUS_FLOW.indexOf(order.status);
                                                            return <div key={s} className="flex-1"><div className={`h-1.5 w-full rounded-full ${idx <= currentIdx ? "pill-gradient" : "bg-[var(--color-nexus-surface)]"}`}></div></div>;
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between text-[8px] uppercase text-gray-500 font-bold">
                                                        {STATUS_FLOW.map((s) => <span key={s}>{s}</span>)}
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        {nextStatus && (
                                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.order_id, nextStatus); }} className="flex-1 py-2.5 rounded-xl pill-gradient text-white font-bold text-xs shadow-[0_0_15px_rgba(69,196,249,0.3)] hover:scale-[1.02] transition-transform capitalize">
                                                                Mark as {STATUS_CONFIG[nextStatus]?.label || nextStatus}
                                                            </button>
                                                        )}
                                                        {order.status !== "cancelled" && order.status !== "delivered" && (
                                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(order.order_id, "cancelled"); }} className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors">
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
