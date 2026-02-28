"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate network delay for payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-nexus-navy flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(74,222,128,0.3)]"
                >
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-gray-400 mb-8 max-w-sm">
                    Your order for <strong className="text-white">Dolo 650mg</strong> has been confirmed by the AI Pharmacist.
                </p>
                <Link href="/">
                    <button className="px-8 py-4 rounded-full pill-gradient text-white font-bold shadow-lg hover:scale-105 transition-transform">
                        Back to Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-y-auto pb-24">

            {/* Header */}
            <header className="px-6 py-6 flex items-center gap-4 z-10 relative bg-[var(--color-nexus-navy)]/80 backdrop-blur-md sticky top-0 border-b border-white/5">
                <Link href="/cart">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <h1 className="font-bold text-xl">Checkout</h1>
            </header>

            <main className="px-6 py-6 space-y-6">

                {/* Order Summary Strip */}
                <div className="card-glass rounded-2xl p-4 border border-white/10 flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Order Total</p>
                        <h2 className="text-2xl font-bold text-white">₹30.00</h2>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20">
                            <ShieldCheck className="w-3 h-3" /> Secure
                        </span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div>
                    <h3 className="text-lg font-bold mb-4">Payment Method</h3>

                    <div className="space-y-3">
                        {/* UPI Option */}
                        <label className={`block relative p-5 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'bg-[var(--color-nexus-surface)] border-[var(--color-nexus-blue)] shadow-[0_0_15px_rgba(69,196,249,0.15)]' : 'bg-[var(--color-nexus-card)] border-white/5 hover:bg-white/5'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">UPI</h4>
                                        <p className="text-xs text-gray-400">Google Pay, PhonePe, Paytm</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-[var(--color-nexus-blue)]' : 'border-gray-500'}`}>
                                    {paymentMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-[var(--color-nexus-blue)]"></div>}
                                </div>
                            </div>
                            <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        </label>

                        {/* Credit/Debit Card Option */}
                        <label className={`block relative p-5 rounded-2xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-[var(--color-nexus-surface)] border-[var(--color-nexus-pink)] shadow-[0_0_15px_rgba(255,107,158,0.15)]' : 'bg-[var(--color-nexus-card)] border-white/5 hover:bg-white/5'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-nexus-navy)] border border-white/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Credit / Debit Card</h4>
                                        <p className="text-xs text-gray-400">Visa, Mastercard, RuPay</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[var(--color-nexus-pink)]' : 'border-gray-500'}`}>
                                    {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-[var(--color-nexus-pink)]"></div>}
                                </div>
                            </div>
                            <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />

                            {/* Expandable Card Details */}
                            {paymentMethod === 'card' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                    <input type="text" placeholder="Card Number" className="w-full bg-[var(--color-nexus-navy)] border border-white/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[var(--color-nexus-pink)]" />
                                    <div className="flex gap-3">
                                        <input type="text" placeholder="MM/YY" className="w-1/2 bg-[var(--color-nexus-navy)] border border-white/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[var(--color-nexus-pink)]" />
                                        <input type="text" placeholder="CVV" className="w-1/2 bg-[var(--color-nexus-navy)] border border-white/10 p-3 rounded-xl text-sm focus:outline-none focus:border-[var(--color-nexus-pink)]" />
                                    </div>
                                </motion.div>
                            )}
                        </label>

                    </div>
                </div>

            </main>

            {/* Footer CTA */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-[var(--color-nexus-navy)] via-[var(--color-nexus-navy)] to-transparent pt-12">
                <form onSubmit={handlePayment}>
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl transition-all ${isProcessing ? 'bg-gray-700 cursor-not-allowed' : 'pill-gradient hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </div>
                        ) : (
                            <span className="flex items-center gap-2">
                                Pay ₹30.00 Securely <ChevronRight className="w-5 h-5" />
                            </span>
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
}
