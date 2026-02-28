"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Sparkles, AlertCircle, Shield, User } from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { useState } from "react";

export default function LoginPage() {
    const [loginMode, setLoginMode] = useState<"user" | "admin">("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (loginMode === "admin") {
            // Admin login
            try {
                const res = await fetch(apiUrl("/api/admin/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: email, password }),
                });
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    localStorage.setItem("nexus_admin", JSON.stringify({
                        username: email,
                        token: data.token || "admin_session",
                    }));
                    window.location.href = "/admin";
                }
            } catch {
                setError("Unable to connect to the server. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            // User login
            try {
                const res = await fetch(apiUrl("/api/auth/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();

                if (data.error) {
                    setError(data.error);
                } else {
                    localStorage.setItem("nexus_user", JSON.stringify({
                        patient_id: data.patient_id,
                        name: data.name,
                        email: email,
                        token: data.token,
                    }));
                    window.location.href = "/";
                }
            } catch {
                setError("Unable to connect to the server. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-hidden flex flex-col justify-center px-6">

            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--color-nexus-blue)]/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--color-nexus-pink)]/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header (Back button) */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative z-10 w-full max-w-md mx-auto"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl pill-gradient flex items-center justify-center shadow-[0_0_30px_rgba(255,107,158,0.4)] relative">
                        {loginMode === "admin" ? (
                            <Shield className="w-8 h-8 text-white" />
                        ) : (
                            <Sparkles className="w-8 h-8 text-white" />
                        )}
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-2xl"></div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
                    {loginMode === "admin" ? "Admin Login" : "Welcome Back"}
                </h1>
                <p className="text-gray-400 text-center text-sm mb-6">
                    {loginMode === "admin"
                        ? "Sign in to access the Pharmacist Dashboard"
                        : "Sign in to sync your AI Pharmacist history"
                    }
                </p>

                {/* Login Mode Toggle */}
                <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-[var(--color-nexus-surface)] border border-white/5">
                    <button
                        onClick={() => { setLoginMode("user"); setError(""); }}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${loginMode === "user"
                            ? "pill-gradient text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <User className="w-4 h-4" />
                        User
                    </button>
                    <button
                        onClick={() => { setLoginMode("admin"); setError(""); }}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${loginMode === "admin"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Admin
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email / Username Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-nexus-blue)] transition-colors" />
                        </div>
                        <input
                            type={loginMode === "admin" ? "text" : "email"}
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-blue)] focus:border-transparent block w-full pl-12 p-4 transition-all"
                            placeholder={loginMode === "admin" ? "Admin username" : "Email address"}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-nexus-pink)] transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-pink)] focus:border-transparent block w-full pl-12 p-4 transition-all"
                            placeholder="Password"
                        />
                    </div>

                    {loginMode === "user" && (
                        <div className="flex justify-end text-xs">
                            <a href="#" className="text-[var(--color-nexus-blue)] font-medium hover:underline">Forgot password?</a>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 ${loading
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : loginMode === "admin"
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
                                : "pill-gradient text-white shadow-[0_0_20px_rgba(69,196,249,0.3)] hover:scale-[1.02]"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Signing In...
                            </span>
                        ) : (
                            loginMode === "admin" ? "Sign In as Admin" : "Sign In"
                        )}
                    </button>
                </form>

                {/* Demo credentials hint */}
                <div className="mt-4 p-3 rounded-xl bg-[var(--color-nexus-surface)] border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                        {loginMode === "admin" ? "Admin Credentials" : "Demo Account"}
                    </p>
                    <p className="text-xs text-gray-400">
                        {loginMode === "admin"
                            ? "admin • nexus2026"
                            : "rahul@example.com • any password"
                        }
                    </p>
                </div>

                {loginMode === "user" && (
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Don&apos;t have an account? <Link href="/auth/register" className="text-white font-bold hover:underline">Sign up</Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
}
