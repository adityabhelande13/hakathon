"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Mic, MicOff, Send, Stethoscope, ShoppingCart, Globe, Volume2
} from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
    role: "user" | "ai";
    text: string;
    card_data?: {
        type: string;
        product_name?: string;
        price?: number;
        product_id?: string;
        quantity?: number;
        total?: number;
        items?: Array<{ product_name: string; price: number; qty: number }>;
        message?: string;
        status?: string;
        rejected_items?: Array<{ product_name: string; reason: string }>;
    } | null;
}

const LANGUAGES = [
    { code: "en", label: "English", speechCode: "en-IN", flag: "🇬🇧" },
    { code: "hi", label: "हिन्दी", speechCode: "hi-IN", flag: "🇮🇳" },
    { code: "mr", label: "मराठी", speechCode: "mr-IN", flag: "🇮🇳" },
];

const GREETINGS: Record<string, string> = {
    en: "Hello! 👋 I'm your autonomous AI Pharmacist. You can type or use your voice to order medicines. I support English, Hindi, and Marathi!",
    hi: "नमस्ते! 👋 मैं आपका AI फार्मासिस्ट हूँ। आप टाइप करके या आवाज़ से दवाइयाँ ऑर्डर कर सकते हैं। मैं अंग्रेज़ी, हिन्दी और मराठी समझता हूँ!",
    mr: "नमस्कार! 👋 मी तुमचा AI फार्मासिस्ट आहे. तुम्ही टाइप करून किंवा आवाजाने औषधे ऑर्डर करू शकता. मी इंग्रजी, हिन्दी आणि मराठी समजतो!",
};

export default function Chat() {
    const [isRecording, setIsRecording] = useState(false);
    const [inputText, setInputText] = useState("");
    const [language, setLanguage] = useState("en");
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", text: GREETINGS.en },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [transcript, setTranscript] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Check for Web Speech API support
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setVoiceSupported(true);
        }
    }, []);

    // Update greeting when language changes
    useEffect(() => {
        setMessages([{ role: "ai", text: GREETINGS[language] || GREETINGS.en }]);
    }, [language]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Text-to-Speech for AI responses
    const speakText = useCallback((text: string) => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ""));
        const langConfig = LANGUAGES.find((l) => l.code === language);
        utterance.lang = langConfig?.speechCode || "en-IN";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }, [language]);

    const sendMessage = async (text?: string) => {
        const msgText = (text || inputText).trim();
        if (!msgText) return;

        setMessages((prev) => [...prev, { role: "user", text: msgText }]);
        setInputText("");
        setTranscript("");
        setIsLoading(true);

        try {
            const savedUser = localStorage.getItem("nexus_user");
            const patientId = savedUser ? JSON.parse(savedUser).patient_id : "PAT001";

            const res = await fetch(apiUrl("/api/chat"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id: patientId, message: msgText, language }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: data.reply, card_data: data.card_data },
            ]);
            // Auto-speak the response
            speakText(data.reply);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "I'm having trouble connecting to the pharmacy system. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Voice Recording (Web Speech API) ──
    const startRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        const langConfig = LANGUAGES.find((l) => l.code === language);
        recognition.lang = langConfig?.speechCode || "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            const fullText = finalTranscript || interimTranscript;
            setTranscript(fullText);
            setInputText(fullText);
        };

        recognition.onerror = () => {
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsRecording(false);

        // Auto-send if there's a transcript
        if (inputText.trim()) {
            setTimeout(() => sendMessage(), 300);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="relative min-h-screen bg-nexus-navy text-foreground overflow-hidden flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4 z-10 relative border-b border-white/5 bg-[var(--color-nexus-navy)]">
                <Link href="/">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full pill-gradient flex items-center justify-center shadow-[0_0_15px_rgba(69,196,249,0.3)]">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[var(--color-nexus-navy)] rounded-full"></span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">AI Pharmacist</h1>
                        <p className="text-xs text-[var(--color-nexus-blue)] font-medium">
                            {isRecording ? "🎙️ Listening..." : "Online • Ready to help"}
                        </p>
                    </div>
                </div>

                {/* Language Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-nexus-surface)] border border-white/10 hover:bg-white/5 transition-colors text-sm"
                    >
                        <Globe className="w-4 h-4 text-[var(--color-nexus-blue)]" />
                        <span className="font-medium">{LANGUAGES.find((l) => l.code === language)?.flag}</span>
                    </button>
                    <AnimatePresence>
                        {showLangMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                className="absolute right-0 top-12 w-40 bg-[var(--color-nexus-surface)] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                            >
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowLangMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${language === lang.code ? "text-[var(--color-nexus-blue)] font-bold" : "text-gray-300"
                                            }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Chat History */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 z-10 relative scrollbar-hide">
                <div className="flex justify-center">
                    <span className="text-xs text-gray-500 font-medium bg-[var(--color-nexus-surface)] px-3 py-1 rounded-full border border-white/5">Today</span>
                </div>

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        {msg.role === "ai" ? (
                            <div className="w-8 h-8 rounded-full pill-gradient flex shrink-0 items-center justify-center mt-1">
                                <Stethoscope className="w-4 h-4 text-white" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] flex shrink-0 items-center justify-center mt-1 text-[10px] font-bold text-white">
                                You
                            </div>
                        )}

                        <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                            <div
                                className={`rounded-2xl p-4 ${msg.role === "ai"
                                    ? "card-glass rounded-tl-sm border border-white/10"
                                    : "bg-gradient-to-br from-[var(--color-nexus-blue)]/20 to-[var(--color-nexus-pink)]/20 border border-[var(--color-nexus-blue)]/30 rounded-tr-sm"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">{msg.text}</p>
                            </div>

                            {/* Speak button for AI messages */}
                            {msg.role === "ai" && i > 0 && (
                                <button
                                    onClick={() => speakText(msg.text)}
                                    className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[var(--color-nexus-blue)] transition-colors"
                                >
                                    <Volume2 className="w-3 h-3" /> Listen
                                </button>
                            )}

                            {/* Order Confirmation Card */}
                            {msg.card_data?.type === "order_confirmation" && (
                                <div className="rounded-2xl bg-[var(--color-nexus-surface)] border border-white/10 overflow-hidden shadow-xl mt-3 w-full">
                                    <div className="pill-gradient p-1"></div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white">{msg.card_data.product_name}</h3>
                                                <p className="text-xs text-gray-400 mt-1">{msg.card_data.quantity || 1} unit(s)</p>
                                            </div>
                                            <span className="font-bold text-lg text-[var(--color-nexus-pink)]">
                                                ₹{((msg.card_data.total || msg.card_data.price || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                        <Link href="/cart" className="flex">
                                            <button className="w-full py-2.5 rounded-xl pill-gradient text-white font-bold text-sm shadow-[0_0_15px_rgba(69,196,249,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                                <ShoppingCart className="w-4 h-4" /> Confirm Order
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Safety Alert Card */}
                            {msg.card_data?.type === "safety_alert" && (
                                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 overflow-hidden mt-3 w-full p-4">
                                    <p className="text-sm font-bold text-red-400 mb-2">⚠️ Safety Alert</p>
                                    <p className="text-xs text-gray-300">{msg.card_data.message}</p>
                                    {msg.card_data.rejected_items?.map((item, j) => (
                                        <p key={j} className="text-xs text-red-300 mt-1">• {item.product_name}: {item.reason}</p>
                                    ))}
                                </div>
                            )}

                            {/* Order Status Card */}
                            {msg.card_data?.type === "order_status" && (
                                <div className="rounded-2xl bg-green-500/10 border border-green-500/20 overflow-hidden mt-3 w-full p-4 text-center">
                                    <p className="text-lg font-bold text-green-400">✅ Order Confirmed</p>
                                    <p className="text-xs text-gray-400 mt-1">You&apos;ll receive a notification shortly</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full pill-gradient flex shrink-0 items-center justify-center mt-1">
                            <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <div className="card-glass rounded-2xl rounded-tl-sm p-4 border border-white/10">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Voice Recording Indicator */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-6 pb-2 z-10 relative"
                    >
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <p className="text-xs text-red-400 font-medium flex-1">
                                {transcript ? `"${transcript}"` : `Listening in ${LANGUAGES.find((l) => l.code === language)?.label}...`}
                            </p>
                            <button
                                onClick={stopRecording}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                            >
                                Stop & Send
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <footer className="p-4 z-10 relative bg-[var(--color-nexus-navy)] border-t border-white/5 pb-8">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] rounded-full blur-sm opacity-20 transition-opacity"></div>
                    <div className="relative flex items-center bg-[var(--color-nexus-surface)] border border-white/10 rounded-full px-2 py-2 shadow-lg">
                        {/* Voice Mic Button */}
                        <button
                            onClick={toggleRecording}
                            disabled={!voiceSupported}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg relative ${!voiceSupported
                                ? "bg-gray-600 cursor-not-allowed opacity-50"
                                : isRecording
                                    ? "bg-red-500"
                                    : "bg-gradient-to-r from-[var(--color-nexus-blue)] to-[var(--color-nexus-pink)] hover:scale-105"
                                }`}
                        >
                            {isRecording && (
                                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></span>
                            )}
                            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                language === "hi" ? "AI फार्मासिस्ट को संदेश भेजें..." :
                                    language === "mr" ? "AI फार्मासिस्टला संदेश पाठवा..." :
                                        "Message AI Pharmacist..."
                            }
                            className="bg-transparent border-none outline-none flex-1 text-[var(--foreground)] placeholder:text-gray-500 font-medium px-4 text-sm"
                        />

                        {/* Send Button */}
                        <button
                            onClick={() => sendMessage()}
                            disabled={!inputText.trim() || isLoading}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all mr-1 ${inputText.trim()
                                ? "pill-gradient text-white shadow-[0_0_10px_rgba(69,196,249,0.3)] hover:scale-105"
                                : "bg-[var(--color-nexus-card)] border border-white/5 text-gray-500"
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
