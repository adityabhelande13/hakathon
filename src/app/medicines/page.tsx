"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, Pill, ShieldCheck, ShoppingCart, Filter, X } from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";

interface Product {
    product_id: string;
    product_name: string;
    price: number;
    description: string;
    package_size: string;
    stock_quantity: number;
    prescription_required: boolean;
    active_ingredient: string;
    category: string;
    manufacturer: string;
}

const CATEGORIES = ["All", "Pain Relief", "Antibiotic", "Diabetes", "Cardiac", "Allergy", "Gastro", "Respiratory", "Vitamins", "First Aid", "Thyroid"];

export default function MedicinesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(apiUrl("/api/products"))
            .then((r) => r.json())
            .then((data) => {
                setProducts(data);
                setFiltered(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let result = products;
        if (category !== "All") {
            result = result.filter((p) => p.category === category);
        }
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.product_name.toLowerCase().includes(q) ||
                    p.active_ingredient.toLowerCase().includes(q) ||
                    p.manufacturer.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, category, products]);

    return (
        <div className="min-h-screen bg-nexus-navy text-foreground pb-24">
            {/* Header */}
            <header className="px-6 py-6 flex items-center gap-4 sticky top-0 z-20 bg-[var(--color-nexus-navy)]/90 backdrop-blur-md border-b border-white/5">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <h1 className="font-bold text-xl">Find Medicine</h1>
                <span className="ml-auto text-sm text-gray-400">{filtered.length} items</span>
            </header>

            <div className="px-6 py-4 space-y-4">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] rounded-full blur-sm opacity-20"></div>
                    <div className="relative flex items-center bg-[var(--color-nexus-card)] border border-white/10 rounded-full px-5 py-3 shadow-lg">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search medicines, ingredients..."
                            className="bg-transparent border-none outline-none flex-1 text-[var(--foreground)] placeholder:text-gray-500 font-medium text-sm"
                            autoFocus
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${category === cat
                                ? "pill-gradient text-white shadow-[0_0_15px_rgba(69,196,249,0.3)]"
                                : "bg-[var(--color-nexus-card)] border border-white/10 text-gray-400 hover:text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-[var(--color-nexus-card)] animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Pill className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No medicines found</p>
                        <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filtered.map((product, i) => (
                            <motion.div
                                key={product.product_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <div className="rounded-2xl bg-[var(--color-nexus-card)] border border-white/5 p-4 hover:border-[var(--color-nexus-blue)]/30 transition-all hover:shadow-[0_0_15px_rgba(69,196,249,0.1)] group h-full flex flex-col">
                                    {/* Category + Prescription badge */}
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[var(--color-nexus-surface)] text-gray-400">
                                            {product.category}
                                        </span>
                                        {product.prescription_required && (
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/20 text-amber-400">
                                                Rx
                                            </span>
                                        )}
                                    </div>

                                    {/* Product Name */}
                                    <h3 className="font-bold text-sm text-white leading-tight mb-1 group-hover:text-[var(--color-nexus-blue)] transition-colors">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 mb-3">{product.manufacturer} • {product.package_size}</p>

                                    <div className="mt-auto flex items-end justify-between">
                                        <div>
                                            <span className="text-lg font-bold bg-clip-text text-transparent pill-gradient">₹{product.price}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const existing = JSON.parse(localStorage.getItem("nexus_cart") || "[]");
                                                const alreadyInCart = existing.find((item: any) => item.product_id === product.product_id);
                                                if (alreadyInCart) {
                                                    alreadyInCart.quantity += 1;
                                                } else {
                                                    existing.push({
                                                        product_id: product.product_id,
                                                        product_name: product.product_name,
                                                        price: product.price,
                                                        quantity: 1,
                                                        category: product.category,
                                                    });
                                                }
                                                localStorage.setItem("nexus_cart", JSON.stringify(existing));
                                                alert(`${product.product_name} added to cart!`);
                                            }}
                                            className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase pill-gradient text-white shadow-md hover:scale-105 transition-transform flex items-center gap-1"
                                        >
                                            <ShoppingCart className="w-3 h-3" /> Add
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
