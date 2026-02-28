"use client";

import { motion, useMotionValue } from "framer-motion";
import { ArrowLeft, Check, ShoppingBag, Info, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    category?: string;
}

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [purchased, setPurchased] = useState(false);
    const dragX = useMotionValue(0);
    const purchaseThreshold = 200;
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem("nexus_cart");
        if (saved) {
            setCartItems(JSON.parse(saved));
        }
    }, []);

    const removeItem = (productId: string) => {
        const updated = cartItems.filter(item => item.product_id !== productId);
        setCartItems(updated);
        localStorage.setItem("nexus_cart", JSON.stringify(updated));
    };

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleDragEnd = () => {
        if (dragX.get() > purchaseThreshold && cartItems.length > 0) {
            setPurchased(true);
            setTimeout(() => {
                router.push('/checkout');
            }, 800);
        } else {
            dragX.set(0);
        }
    };

    // Empty Cart State
    if (cartItems.length === 0) {
        return (
            <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-hidden flex flex-col">
                <header className="px-6 py-6 flex justify-between items-center z-10 relative">
                    <Link href="/">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    </Link>
                    <h1 className="font-bold text-lg">My Cart</h1>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-full bg-[var(--color-nexus-surface)] flex items-center justify-center mb-6 border border-white/10"
                    >
                        <ShoppingCart className="w-12 h-12 text-gray-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-400 max-w-xs mb-8">
                        Browse our medicines and add items to your cart to get started.
                    </p>
                    <Link href="/medicines">
                        <button className="px-8 py-4 rounded-full pill-gradient text-white font-bold shadow-lg hover:scale-105 transition-transform">
                            Browse Medicines
                        </button>
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-hidden flex flex-col pb-24">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center z-10 relative">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <h1 className="font-bold text-lg">My Cart ({cartItems.length})</h1>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 relative">
                    <ShoppingBag className="w-5 h-5" />
                </div>
            </header>

            {/* Cart Items */}
            <main className="flex-1 px-6 space-y-4 z-10 relative mt-2">
                {cartItems.map((item) => (
                    <motion.div
                        key={item.product_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-glass rounded-2xl p-4 border border-white/10 flex items-center gap-4"
                    >
                        <div className="w-14 h-14 rounded-xl bg-[var(--color-nexus-surface)] flex items-center justify-center border border-white/5 shrink-0">
                            <ShoppingBag className="w-6 h-6 text-[var(--color-nexus-blue)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{item.product_name}</h3>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="font-bold text-[var(--color-nexus-blue)]">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => removeItem(item.product_id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors shrink-0"
                        >
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    </motion.div>
                ))}

                {/* Order Summary */}
                <div className="card-glass rounded-2xl p-5 border border-white/10 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Subtotal</span>
                        <span className="text-white font-medium">₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Delivery</span>
                        <span className="text-green-400 font-medium text-sm">FREE</span>
                    </div>
                    <div className="border-t border-white/10 my-3"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Total</span>
                        <span className="text-xl font-bold bg-clip-text text-transparent pill-gradient">₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </main>

            {/* Slide to Buy Footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-[var(--color-nexus-navy)] via-[var(--color-nexus-navy)] to-transparent pt-12">
                {purchased ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full h-16 rounded-full pill-gradient flex items-center justify-center shadow-[0_0_30px_rgba(69,196,249,0.5)] border border-white/20"
                    >
                        <Check className="w-6 h-6 text-white mr-2" />
                        <span className="font-bold text-lg text-white">Proceeding...</span>
                    </motion.div>
                ) : (
                    <div className="relative w-full h-16 rounded-full bg-[var(--color-nexus-surface)] border border-white/10 overflow-hidden shadow-2xl group flex items-center">
                        <div className="absolute inset-0 flex items-center justify-center opacity-50 z-0">
                            <span className="text-sm font-bold tracking-widest uppercase text-gray-400 pl-12">Slide to Buy • ₹{total.toFixed(2)}</span>
                        </div>
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 280 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            style={{ x: dragX }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute left-1 top-1 bottom-1 w-[4.5rem] rounded-full pill-gradient shadow-[0_0_15px_rgba(255,107,158,0.5)] flex items-center justify-center z-20 cursor-grab active:cursor-grabbing border border-white/20"
                        >
                            <div className="w-5 h-1 bg-white/50 rounded-full mb-1"></div>
                            <div className="w-5 h-1 bg-white/50 rounded-full mt-1"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </footer>
        </div>
    );
}
