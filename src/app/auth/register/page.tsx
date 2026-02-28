"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Phone, Stethoscope, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { useState } from "react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(apiUrl("/api/auth/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                // Save user info to localStorage
                localStorage.setItem("nexus_user", JSON.stringify({
                    patient_id: data.patient_id,
                    name: data.name,
                    email: formData.email,
                }));
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            }
        } catch {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-nexus-navy flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(74,222,128,0.3)]">
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2 text-white">Account Created!</h1>
                <p className="text-gray-400 mb-4">Welcome to Nexus Pharmacy. Redirecting...</p>
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-y-auto flex flex-col justify-center px-6 py-12">

            {/* Background Orbs */}
            <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-[var(--color-nexus-pink)]/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header (Back button) */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/auth/login">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            {/* Register Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative z-10 w-full max-w-md mx-auto mt-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--color-nexus-pink)] to-[#FFA4C4] flex items-center justify-center shadow-[0_0_30px_rgba(255,107,158,0.4)] relative">
                        <Stethoscope className="w-8 h-8 text-black" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Create Account</h1>
                <p className="text-gray-400 text-center text-sm mb-8">Join the Nexus Pharmacy Ecosystem</p>

                {/* Error Message */}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">

                    {/* Name Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <User className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-white focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                            placeholder="Full Name"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-white focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                            placeholder="Email Address"
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Phone className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-white focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                            placeholder="Phone Number (+91)"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-white focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                            placeholder="Create Password (min 6 chars)"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg transition-transform active:scale-95 ${loading
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                                Creating Account...
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account? <Link href="/auth/login" className="text-[var(--color-nexus-pink)] font-bold hover:underline">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
