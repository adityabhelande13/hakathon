"use client";

import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { apiUrl } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        allergies: "",
        preferred_store: "",
    });
    const [patientId, setPatientId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const savedUser = localStorage.getItem("nexus_user");
                if (!savedUser) {
                    window.location.href = "/auth/login";
                    return;
                }
                const pId = JSON.parse(savedUser).patient_id;
                setPatientId(pId);

                const res = await fetch(apiUrl(`/api/patients/${pId}`));
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        gender: data.gender || "",
                        allergies: data.allergies ? data.allergies.join(", ") : "",
                        preferred_store: data.preferred_store || "",
                    });
                }
            } catch (err) {
                console.error(err);
                setMessage({ type: "error", text: "Failed to load profile data." });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updatePayload = {
                name: formData.name,
                phone: formData.phone,
                gender: formData.gender,
                allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()).filter(a => a) : [],
                preferred_store: formData.preferred_store,
            };

            const res = await fetch(apiUrl(`/api/patients/${patientId}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });

            if (res.ok) {
                const data = await res.json();

                // Update local storage name if it changed
                const savedUser = localStorage.getItem("nexus_user");
                if (savedUser) {
                    const userObj = JSON.parse(savedUser);
                    userObj.name = data.name;
                    localStorage.setItem("nexus_user", JSON.stringify(userObj));
                }

                setMessage({ type: "success", text: "Profile updated successfully!" });
            } else {
                setMessage({ type: "error", text: "Failed to update profile." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Unable to connect to the server." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-nexus-navy flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-y-auto pb-20">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-20%] w-[60vw] h-[60vw] bg-[var(--color-nexus-blue)]/10 rounded-full blur-2xl pointer-events-none"></div>

            <header className="px-6 py-6 flex items-center gap-4 relative z-10">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            </header>

            <main className="px-6 relative z-10 max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-glass rounded-3xl p-6 border border-white/10 shadow-2xl relative"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[var(--color-nexus-surface)] shadow-[0_0_20px_rgba(69,196,249,0.3)]">
                            <div className="w-full h-full bg-gradient-to-tr from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] flex items-center justify-center text-white font-bold text-3xl">
                                {formData.name ? formData.name.substring(0, 2).toUpperCase() : "JS"}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                            {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Full Name</label>
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
                                    className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-blue)] focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1 opacity-60">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    disabled
                                    value={formData.email}
                                    className="bg-[var(--color-nexus-surface)] border border-white/5 text-gray-400 text-sm rounded-2xl block w-full pl-12 p-3.5 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Phone className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-blue)] focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-blue)] focus:border-transparent block w-full p-3.5 transition-all appearance-none"
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Allergies</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-start pt-4 pl-4 pointer-events-none">
                                    <AlertCircle className="w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-nexus-pink)] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    placeholder="e.g. Peanuts, Penicillin (comma separated)"
                                    className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-pink)] focus:border-transparent block w-full pl-12 p-3.5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Preferred Medical Store</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <MapPin className="w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-nexus-blue)] transition-colors" />
                                </div>
                                <select
                                    name="preferred_store"
                                    value={formData.preferred_store}
                                    onChange={handleChange}
                                    className="bg-[var(--color-nexus-surface)] border border-white/10 text-[var(--foreground)] text-sm rounded-2xl focus:ring-2 focus:ring-[var(--color-nexus-blue)] focus:border-transparent block w-full pl-12 p-3.5 transition-all appearance-none"
                                >
                                    <option value="" disabled>Select a pharmacy...</option>
                                    <option value="Netmeds">Netmeds</option>
                                    <option value="Apollo Pharmacy">Apollo Pharmacy</option>
                                    <option value="MedPlus">MedPlus</option>
                                    <option value="Pharmeasy">Pharmeasy</option>
                                    <option value="Local Pharmacy">Local Pharmacy (Nearest)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 mt-8 flex items-center justify-center gap-2 rounded-2xl font-bold text-lg transition-all active:scale-95 ${saving
                                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                : "pill-gradient text-white shadow-lg hover:shadow-[0_0_20px_rgba(69,196,249,0.4)] hover:scale-[1.02]"
                                }`}
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
