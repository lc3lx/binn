"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Headphones,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Users2,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { sendAiChatMessage } from "@/api/services/user/support/support.api";

// Simple safe markdown formatter for bold, bullets, and line breaks
function FormattedAiText({ content }) {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-xs leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Parse bold **text**
        const parts = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }
          parts.push(
            <strong key={`${idx}-${match.index}`} className="font-bold text-cyan-300">
              {match[1]}
            </strong>
          );
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("* ");

        return (
          <div
            key={idx}
            className={`${isBullet ? "flex items-start gap-1.5 ltr:pl-2 rtl:pr-2" : ""}`}
          >
            {isBullet ? (
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            ) : null}
            <span>{parts.length > 0 ? parts : line}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SupportButton({ className = "" }) {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: isArabic
        ? `👋 مرحباً بك في المساعد الذكي لـ **ETG RIDE**!\n\nأنا هنا لخدمتك على مدار الساعة، وتقديم شرح شامل لباقات الاستثمار اليومية **(5% يومياً)**، وتوضيح شروط السحب الفوري (خلال 48 ساعة وبحد أدنى $2.50 فقط)، وإثبات أمان ومصداقية أسطولنا الذكي.\n\nكيف يمكنني مساعدتك الآن؟`
        : `👋 Welcome to **ETG RIDE** AI Support!\n\nI am your 24/7 dedicated fleet advisor. Ask me anything about our **5% daily profit tiers**, **$2.50 minimum withdrawal** (within 48h), or our physical IoT micro-mobility fleet.\n\nHow can I help you today?`,
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  // Suggested quick prompts
  const quickPrompts = isArabic
    ? [
        {
          label: "🛡️ هل المنصة آمنة ومضمونة؟",
          text: "هل منصة ETG RIDE آمنة ومضمونة؟ وكيف تضمنون أموالي وما هو إثبات المصداقية؟",
          icon: ShieldCheck,
        },
        {
          label: "⚡ باقات الأرباح اليومية 5%",
          text: "ما هي باقات الاستثمار المتاحة ونسبة الأرباح اليومية لكل باقة؟",
          icon: TrendingUp,
        },
        {
          label: "💳 شروط والحد الأدنى للسحب",
          text: "ما هو الحد الأدنى للسحب وكم تستغرق معالجة السحب؟ وما سياسة عطلة نهاية الأسبوع؟",
          icon: Wallet,
        },
        {
          label: "🎁 مكافأة 100$ الكبرى للفريق",
          text: "كيف أحصل على مكافأة الـ 100 دولار كاش وعمولات الإحالة؟",
          icon: Users2,
        },
      ]
    : [
        {
          label: "🛡️ Is the platform safe & legit?",
          text: "Is ETG RIDE safe, legit, and backed by real assets? How do you protect investors?",
          icon: ShieldCheck,
        },
        {
          label: "⚡ 5% Daily Profit Tiers",
          text: "What are the investment tiers and daily profit amounts for each tier?",
          icon: TrendingUp,
        },
        {
          label: "💳 Minimum Withdrawal & Rules",
          text: "What is the minimum withdrawal amount and processing time? What is the weekend policy?",
          icon: Wallet,
        },
        {
          label: "🎁 $100 Cash Bonus for Teams",
          text: "Explain the $100 cash referral bonus and team commission structure.",
          icon: Users2,
        },
      ];

  const handleSendMessage = async (userText) => {
    const textToSend = typeof userText === "string" ? userText : inputMessage;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const trimmed = textToSend.trim();
    setInputMessage("");

    // Append user message immediately
    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Build conversation history (excluding initial greeting)
      const history = nextMessages.slice(1, -1);
      const res = await sendAiChatMessage({
        message: trimmed,
        history,
        locale,
      });

      const replyContent =
        res?.reply ||
        (isArabic
          ? "شكراً لتواصلك مع ETG RIDE. يمكنك سحب أرباحك يومياً بحد أدنى 2.50$ خلال 48 ساعة كحد أقصى."
          : "Thank you for contacting ETG RIDE. Withdrawals start at $2.50 USDT and are processed within 48h.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyContent,
          model: res?.model,
          provider: res?.provider,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isArabic
            ? "⚠️ عذراً، حدث خطأ مؤقت في الاتصال. يمكنك إعادة المحاولة أو الاطلاع على شروط المنصة وسحب أرباحك خلال 48 ساعة بحد أدنى 2.50$."
            : "⚠️ Temporary connection glitch. Please retry or contact support.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: isArabic
          ? `👋 تم بدء محادثة جديدة! أنا مستشارك الذكي لـ **ETG RIDE**. تفضل بطرح أي سؤال حول الباقات، السحب، أو الأمان وسأجيبك فوراً.`
          : `👋 New conversation started! I am your **ETG RIDE** AI fleet advisor. Feel free to ask anything!`,
      },
    ]);
  };

  return (
    <>
      {/* 1. Floating Launcher Button */}
      <div className={`${className || "fixed bottom-6 z-40 ltr:right-6 rtl:left-6"}`}>
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative group"
        >
          {/* Subtle pulse wave */}
          <span className="absolute -inset-1 rounded-full bg-cyan-500/30 blur-sm animate-pulse" />

          {/* Online badge */}
          <span className="absolute -top-1 -right-1 z-10 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#060a12]" />
          </span>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="ETG RIDE AI Support Chat"
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all border border-cyan-300/40"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-black stroke-[2.5]" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="h-7 w-7 text-black stroke-[2.2]" />
                <Sparkles className="absolute -top-1 -right-1.5 h-3.5 w-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              </div>
            )}
          </button>

          {/* Quick Hover Tooltip */}
          {!isOpen && (
            <div className="hidden sm:block absolute bottom-full mb-2 ltr:right-0 rtl:left-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="whitespace-nowrap rounded-lg bg-[#0b1322] border border-cyan-500/30 px-3 py-1.5 text-[11px] font-semibold text-cyan-200 shadow-xl shadow-black/80">
                {isArabic ? "💬 المساعد الذكي | رد فوري 24/7" : "💬 AI Concierge | Instant 24/7"}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* 2. Floating AI Support Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            dir={isArabic ? "rtl" : "ltr"}
            className="fixed bottom-22 z-50 ltr:right-4 rtl:left-4 sm:ltr:right-6 sm:rtl:left-6 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] h-[580px] max-h-[82vh] flex flex-col rounded-3xl bg-[#070e1b]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl shadow-black/90 overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-[#09152a] via-[#0d1e3a] to-[#09152a] p-4 border-b border-cyan-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/30">
                    <Bot className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#09152a]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {isArabic ? "مساعد ETG RIDE الذكي" : "ETG RIDE AI Concierge"}
                    </h3>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">
                      AI 24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-300/70 flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isArabic ? "متصل الآن • رد فوري مدعوم بالذكاء الاصطناعي" : "Online • Instant AI responses"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title={isArabic ? "بدء محادثة جديدة" : "Reset chat"}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Ticket Switch Banner */}
            <div className="shrink-0 bg-cyan-950/40 border-b border-cyan-500/15 px-3 py-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-300">
                {isArabic ? "هل تحتاج لموظف بشري؟" : "Need a human agent?"}
              </span>
              <Link
                href={`/${locale}/support`}
                className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                {isArabic ? "فتح تذكرة دعم" : "Open ticket"}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isUser ? (
                      <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-black font-bold mt-0.5">
                        <Bot className="h-4 w-4 stroke-[2.2]" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 shrink-0 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs font-semibold mt-0.5">
                        {isArabic ? "أنت" : "You"}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                        isUser
                          ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-medium rounded-tr-none text-xs"
                          : "bg-[#0b1526] border border-cyan-500/20 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <FormattedAiText content={msg.content} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-black font-bold">
                    <Bot className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-[#0b1526] border border-cyan-500/20 px-4 py-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="text-[11px] text-cyan-300/80 mr-1 ml-1 font-medium">
                      {isArabic ? "جاري صياغة الرد الذكي..." : "Crafting response..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pills (Show when only 1 or 2 messages) */}
            {messages.length <= 3 && !isLoading && (
              <div className="shrink-0 px-3 pb-2 pt-1 border-t border-cyan-500/10 bg-[#070e1b]/80">
                <p className="text-[10px] text-slate-400 font-semibold mb-1.5">
                  {isArabic ? "أسئلة شائعة وسريعة:" : "Quick Suggested Questions:"}
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {quickPrompts.map((q, qIdx) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => handleSendMessage(q.text)}
                        className="rounded-full bg-[#0d1c33] hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 text-[11px] text-cyan-200 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Icon className="h-3 w-3 text-cyan-400" />
                        <span>{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="shrink-0 p-3 bg-[#081120] border-t border-cyan-500/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isArabic
                      ? "اسأل أي سؤال عن الباقات، السحب، أو الأمان..."
                      : "Ask about tiers, withdrawals, security..."
                  }
                  className="w-full h-11 rounded-xl bg-[#0f1d33] border border-cyan-500/25 ltr:pr-12 rtl:pl-12 ltr:pl-3.5 rtl:pr-3.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute ltr:right-1.5 rtl:left-1.5 h-8 w-8 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-black flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-4 w-4 stroke-[2.2]" />
                </button>
              </form>
              <div className="mt-1.5 text-center text-[10px] text-slate-400">
                {isArabic
                  ? "ردود ذكية 24/7 • سحب أرباح يومية خلال 48 ساعة كحد أقصى"
                  : "Smart 24/7 Fleet AI • Daily withdrawals processed within 48h"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
