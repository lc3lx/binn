"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Bot,
  Headphones,
  Loader2,
  Send,
  UserRound,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Users2,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useCreateSupportTicketMutation,
  useMySupportTicketsQuery,
  useSendSupportMessageMutation,
} from "@/api/services/user/support/support.query";
import { sendAiChatMessage } from "@/api/services/user/support/support.api";

// Simple safe markdown formatter for AI responses
function FormattedAiText({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

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
            className={`${isBullet ? "flex items-start gap-2 ltr:pl-2 rtl:pr-2" : ""}`}
          >
            {isBullet ? (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            ) : null}
            <span>{parts.length > 0 ? parts : line}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SupportPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const router = useRouter();
  const { user } = useAuth();
  const isUserRole = String(user?.role || "").toLowerCase() === "user";

  const [activeTab, setActiveTab] = useState("ai"); // "ai" | "tickets"

  // AI Chat state
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState(() => [
    {
      role: "assistant",
      content: isArabic
        ? `👋 مرحباً بك في مركز دعم **ETG RIDE** الذكي!\n\nأنا مساعدك التقني والمالي المتاح على مدار الساعة للإجابة على كامل تفاصيل المنصة: باقات الاستثمار اليومية **(عائد 5% يومياً)**، شروط والحد الأدنى للسحب ($2.50 خلال 48 ساعة كحد أقصى)، مكافأة 100$ للفريق، وإثبات أمان ومصداقية أسطول السكوترات الكهربائية.\n\nكيف يمكنني مساعدتك الآن؟`
        : `👋 Welcome to the **ETG RIDE** Smart Support Center!\n\nI am your 24/7 dedicated fleet advisor. Ask me anything about our **5% daily profit tiers**, **$2.50 minimum withdrawal** (within 48h), our $100 team bonus, or platform legitimacy.\n\nHow can I help you today?`,
    },
  ]);

  const aiListRef = useRef(null);
  const scrollToAiBottom = () => {
    aiListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "ai") {
      scrollToAiBottom();
    }
  }, [activeTab, aiMessages]);

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

  const handleSendAi = async (overrideText) => {
    const textToSend = typeof overrideText === "string" ? overrideText : aiInput;
    if (!textToSend || !textToSend.trim() || isAiLoading) return;

    const trimmed = textToSend.trim();
    setAiInput("");

    const next = [...aiMessages, { role: "user", content: trimmed }];
    setAiMessages(next);
    setIsAiLoading(true);

    try {
      const history = next.slice(1, -1);
      const res = await sendAiChatMessage({
        message: trimmed,
        history,
        locale,
      });

      const replyContent =
        res?.reply ||
        (isArabic
          ? "شكراً لتواصلك. يمكنك سحب أرباحك يومياً بحد أدنى 2.50$ خلال 48 ساعة كحد أقصى."
          : "Thank you for contacting ETG RIDE. Withdrawals start at $2.50 USDT and are processed within 48h.");

      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyContent,
          model: res?.model,
          provider: res?.provider,
        },
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isArabic
            ? "⚠️ حدث خطأ مؤقت في الاتصال. يمكنك إعادة المحاولة وسأجيبك فوراً."
            : "⚠️ Temporary connection glitch. Please retry.",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleResetAiChat = () => {
    setAiMessages([
      {
        role: "assistant",
        content: isArabic
          ? `👋 تم بدء جلسة جديدة! أنا مستشارك الذكي لـ **ETG RIDE**. تفضل بطرح أي سؤال وسأجيبك فوراً.`
          : `👋 New session started! I am your **ETG RIDE** fleet advisor. How can I assist you?`,
      },
    ]);
  };

  // Human ticket state
  const text = isArabic
    ? {
        title: "مركز الدعم والمساعدة",
        subtitle: "دعم ذكي فوري 24/7 وفريق خدمة عملاء مخصص.",
        back: "رجوع",
        tabAi: "المساعد الذكي الفوري (AI 24/7)",
        tabTickets: "تذاكر الدعم البشري",
        tickets: "تذاكري",
        newTicket: "إنشاء تذكرة",
        addNewTicket: "+ تذكرة جديدة",
        addDialogTitle: "إضافة تذكرة دعم جديدة",
        addDialogDescription: "أدخل الموضوع والرسالة لفتح تذكرة لفريق الدعم.",
        forcedDialogHint: "يرجى إنشاء تذكرة لبدء المحادثة مع موظف الدعم.",
        createTicketAction: "إنشاء التذكرة",
        close: "إغلاق",
        subject: "الموضوع",
        subjectPlaceholder: "مثال: استفسار حول معالجة السحب",
        messagePlaceholder: "اكتب رسالتك هنا...",
        send: "إرسال",
        creating: "جاري الإنشاء...",
        sending: "جاري الإرسال...",
        loading: "جاري تحميل التذاكر...",
        noTickets: "لا توجد تذاكر حالياً",
        createSuccess: "تم إنشاء التذكرة بنجاح",
        sendSuccess: "تم إرسال الرسالة",
        createError: "فشل إنشاء التذكرة",
        sendError: "فشل إرسال الرسالة",
        requiredFields: "يرجى إدخال الموضوع والرسالة أولاً",
        roleError: "يلزم تسجيل الدخول بحساب مستخدم لفتح تذاكر الدعم البشري",
        loginHint: "إذا لم تكن مسجلاً، يمكنك استخدام المساعد الذكي في التبويب الأول مجاناً وفوراً دون تسجيل دخول!",
        status: {
          open: "مفتوحة",
          waiting: "قيد الانتظار",
          closed: "مغلقة",
        },
      }
    : {
        title: "Support Center",
        subtitle: "24/7 Smart AI assistance and dedicated customer support team.",
        back: "Back",
        tabAi: "Instant AI Concierge (24/7)",
        tabTickets: "Human Support Tickets",
        tickets: "My Tickets",
        newTicket: "Create Ticket",
        addNewTicket: "+ New Ticket",
        addDialogTitle: "Open New Support Ticket",
        addDialogDescription: "Enter subject and message to reach human support.",
        forcedDialogHint: "Please create a ticket to chat with a support officer.",
        createTicketAction: "Create Ticket",
        close: "Close",
        subject: "Subject",
        subjectPlaceholder: "e.g. Question about withdrawal status",
        messagePlaceholder: "Type your message here...",
        send: "Send",
        creating: "Creating...",
        sending: "Sending...",
        loading: "Loading tickets...",
        noTickets: "No tickets yet",
        createSuccess: "Ticket created successfully",
        sendSuccess: "Message sent successfully",
        createError: "Failed to create ticket",
        sendError: "Failed to send message",
        requiredFields: "Please enter subject and message first",
        roleError: "You must be logged in as a user to open human support tickets",
        loginHint: "If you don't have an account yet, use the Instant AI tab above for free instant answers without login!",
        status: {
          open: "Open",
          waiting: "Waiting",
          closed: "Closed",
        },
      };

  const [ticketMessage, setTicketMessage] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("Withdrawal status inquiry");
  const [newTicketMessage, setNewTicketMessage] = useState("I would like to inquire about my withdrawal.");

  const { data, isLoading } = useMySupportTicketsQuery({ enabled: isUserRole && activeTab === "tickets" });
  const createTicketMutation = useCreateSupportTicketMutation();
  const sendMessageMutation = useSendSupportMessageMutation();

  const tickets = Array.isArray(data?.data) ? data.data : [];
  const resolvedSelectedTicketId = selectedTicketId || tickets[0]?._id || "";
  const selectedTicket = tickets.find((t) => t._id === resolvedSelectedTicketId) || tickets[0] || null;

  const ticketListRef = useRef(null);
  useEffect(() => {
    if (ticketListRef.current) {
      ticketListRef.current.scrollTop = ticketListRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const formatDate = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleString(isArabic ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const statusLabel = (status) => {
    const s = String(status || "").toLowerCase();
    return text.status[s] || status || "-";
  };

  const handleCreateTicket = async () => {
    if (!isUserRole) {
      toast.error(text.roleError);
      return;
    }
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) {
      toast.error(text.requiredFields);
      return;
    }
    try {
      const response = await createTicketMutation.mutateAsync({
        subject: newTicketSubject.trim(),
        message: newTicketMessage.trim(),
      });
      toast.success(text.createSuccess);
      const createdTicketId = response?.data?._id;
      if (createdTicketId) {
        setSelectedTicketId(createdTicketId);
      }
      setNewTicketMessage("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || text.createError);
    }
  };

  const handleSubmitTicketMessage = async () => {
    if (!isUserRole) {
      toast.error(text.roleError);
      return;
    }
    const value = ticketMessage.trim();
    if (!value || !selectedTicket?._id) {
      toast.error(text.requiredFields);
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        ticketId: selectedTicket._id,
        message: value,
      });
      toast.success(text.sendSuccess);
      setTicketMessage("");
    } catch (error) {
      toast.error(error?.response?.data?.message || text.sendError);
    }
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#060a12] p-3 text-white sm:p-6"
    >
      <div className="mx-auto max-w-[1160px]">
        {/* Header Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-black">
                <Bot className="h-5 w-5 stroke-[2.3]" />
              </span>
              {text.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-cyan-200/60">
              {text.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 self-start sm:self-auto items-center gap-2 rounded-xl border border-cyan-500/20 bg-[#09152a] px-4 text-xs sm:text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {text.back}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#091322] border border-cyan-500/20 p-1.5 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "ai"
                ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-black shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="h-4 w-4 stroke-[2.3]" />
            <span>{text.tabAi}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "tickets"
                ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-black shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Headphones className="h-4 w-4 stroke-[2.3]" />
            <span>{text.tabTickets}</span>
          </button>
        </div>

        {/* TAB 1: AI ASSISTANT */}
        {activeTab === "ai" && (
          <div className="rounded-3xl border border-cyan-500/30 bg-[#070e1b]/95 backdrop-blur-xl shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col h-[650px] max-h-[75vh]">
            {/* AI Assistant Header */}
            <div className="shrink-0 bg-gradient-to-r from-[#0a1830] via-[#0e2142] to-[#0a1830] p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/30">
                    <Bot className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0a1830]" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {isArabic ? "مساعد ETG RIDE الذكي المتطور" : "ETG RIDE Advanced Fleet AI"}
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                      OpenRouter Free AI
                    </span>
                  </h2>
                  <p className="text-xs text-cyan-300/70 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    {isArabic ? "جاهز للرد الفوري على مدار 24 ساعة بدون انتظار" : "Available 24/7 for instant answers"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAiChat}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isArabic ? "محادثة جديدة" : "New Chat"}</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
              {aiMessages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isUser ? (
                      <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-black font-bold mt-1 shadow-sm">
                        <Bot className="h-4 w-4 stroke-[2.2]" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 shrink-0 rounded-xl bg-slate-700 flex items-center justify-center text-white text-xs font-bold mt-1 shadow-sm">
                        {isArabic ? "أنت" : "You"}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-lg ${
                        isUser
                          ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-none text-xs sm:text-sm font-medium"
                          : "bg-[#0b162a] border border-cyan-500/25 text-slate-100 rounded-tl-none"
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

              {isAiLoading && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-black font-bold shadow-sm">
                    <Bot className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="rounded-3xl rounded-tl-none bg-[#0b162a] border border-cyan-500/25 px-5 py-3.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="text-xs text-cyan-300 font-medium mr-1.5 ml-1.5">
                      {isArabic ? "جاري التفكير وصياغة الرد الذكي..." : "Generating intelligent response..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={aiListRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="shrink-0 px-4 py-2 bg-[#081223] border-t border-cyan-500/15">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] text-slate-400 shrink-0 font-semibold">
                  {isArabic ? "أسئلة سريعة:" : "Quick Questions:"}
                </span>
                {quickPrompts.map((q, qIdx) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleSendAi(q.text)}
                      className="shrink-0 rounded-full bg-[#0d1d36] hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-xs text-cyan-200 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Icon className="h-3 w-3 text-cyan-400" />
                      <span>{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form */}
            <div className="shrink-0 p-3 sm:p-4 bg-[#09152b] border-t border-cyan-500/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAi();
                }}
                className="relative flex items-center gap-2"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={
                    isArabic
                      ? "اطرح سؤالك حول الباقات، السحب خلال 48 ساعة، أو ضمان الأمان..."
                      : "Ask about 5% daily tiers, 48h withdrawals, or platform security..."
                  }
                  className="w-full h-12 rounded-2xl bg-[#0d1e38] border border-cyan-500/30 ltr:pr-14 rtl:pl-14 ltr:pl-4 rtl:pr-4 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                />

                <button
                  type="submit"
                  disabled={isAiLoading || !aiInput.trim()}
                  className="absolute ltr:right-2 rtl:left-2 h-9 w-9 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-black flex items-center justify-center hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/30"
                >
                  <Send className="h-4 w-4 stroke-[2.3]" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: HUMAN TICKETS */}
        {activeTab === "tickets" && (
          <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#070e1b] shadow-2xl">
            {!isUserRole && (
              <div className="p-6 text-center bg-[#0d1c33]/50 border-b border-cyan-500/20">
                <p className="text-amber-300 font-semibold text-sm mb-2">
                  ⚠️ {text.roleError}
                </p>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  {text.loginHint}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition-colors"
                >
                  <Bot className="h-4 w-4" />
                  <span>التحويل للمساعد الذكي الفوري الآن</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
              {/* Ticket list sidebar */}
              <div className="border-b border-cyan-500/15 bg-[#09152b] lg:border-b-0 lg:border-r lg:border-cyan-500/15">
                <div className="border-b border-cyan-500/15 px-4 py-3 text-sm font-semibold text-white flex items-center justify-between">
                  <span>{text.tickets}</span>
                  {isUserRole && (
                    <button
                      type="button"
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                    >
                      {text.addNewTicket}
                    </button>
                  )}
                </div>

                <div className="max-h-[520px] overflow-y-auto p-3 space-y-2">
                  {isLoading ? (
                    <p className="text-xs text-slate-400 p-2">{text.loading}</p>
                  ) : null}

                  {!isLoading && !tickets.length ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {text.noTickets}
                    </div>
                  ) : null}

                  {tickets.map((ticket) => (
                    <button
                      key={ticket._id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket._id)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-start transition-all ${
                        selectedTicket?._id === ticket._id
                          ? "border-cyan-400/60 bg-cyan-500/15 shadow-sm"
                          : "border-cyan-500/15 bg-[#0b1933] hover:bg-[#0e2144]"
                      }`}
                    >
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {ticket.subject}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{formatDate(ticket.updatedAt)}</span>
                        <span className="text-cyan-400 font-semibold">{statusLabel(ticket.status)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat pane for selected ticket */}
              <div>
                <div className="flex items-center gap-2 border-b border-cyan-500/15 px-4 py-3 bg-[#0a1830]">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-500 text-black font-bold">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {selectedTicket?.subject || text.newTicket}
                  </span>
                </div>

                <div
                  ref={ticketListRef}
                  className="h-[420px] overflow-y-auto bg-[#070e1b] px-4 py-5 sm:px-6 space-y-3"
                >
                  {!selectedTicket?._id ? (
                    <div className="rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-950/20 p-8 text-center text-sm text-slate-400">
                      {text.noTickets}
                    </div>
                  ) : null}

                  {(selectedTicket?.messages || []).map((msg, index) => {
                    const isUser = String(msg.senderRole || "").toLowerCase() === "user";
                    return (
                      <div
                        key={`${msg.createdAt || index}-${index}`}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {isUser ? (
                          <div className="flex items-end gap-2 max-w-[80%]">
                            <div className="rounded-2xl rounded-br-none bg-gradient-to-r from-cyan-600 to-sky-600 px-3.5 py-2.5 text-xs font-medium text-white shadow-md">
                              {msg.message}
                              <div className="mt-1 text-[10px] text-cyan-200 text-end">
                                {formatDate(msg.createdAt)}
                              </div>
                            </div>
                            <div className="grid h-6 w-6 place-items-center rounded-lg bg-cyan-500 text-black shrink-0">
                              <UserRound className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-end gap-2 max-w-[80%]">
                            <div className="grid h-6 w-6 place-items-center rounded-lg bg-slate-700 text-cyan-300 shrink-0">
                              <Headphones className="h-3.5 w-3.5" />
                            </div>
                            <div className="rounded-2xl rounded-bl-none bg-[#0c182e] border border-cyan-500/25 px-3.5 py-2.5 text-xs text-slate-100 shadow-md">
                              {msg.message}
                              <div className="mt-1 text-[10px] text-slate-400">
                                {formatDate(msg.createdAt)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Send reply input */}
                <div className="border-t border-cyan-500/15 bg-[#09152b] p-3 sm:p-4">
                  <div className="relative">
                    <Input
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmitTicketMessage();
                      }}
                      placeholder={text.messagePlaceholder}
                      className="h-11 rounded-xl border border-cyan-500/25 bg-[#0d1e38] pr-12 text-xs text-white placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleSubmitTicketMessage}
                      disabled={sendMessageMutation.isPending || !ticketMessage.trim() || !isUserRole}
                      className="absolute top-1/2 -translate-y-1/2 cursor-pointer text-cyan-400 hover:text-cyan-300 disabled:opacity-40 rtl:left-3 ltr:right-3 transition-colors"
                      aria-label={text.send}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 fill-current" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="border border-cyan-500/30 bg-[#09152b] text-white sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Headphones className="h-5 w-5 text-cyan-400" />
              {text.addDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              {text.addDialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 my-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-200">{text.subject}</label>
              <Input
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder={text.subjectPlaceholder}
                className="bg-[#0b1b36] border-cyan-500/30 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-200">{text.messagePlaceholder}</label>
              <textarea
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder={text.messagePlaceholder}
                className="min-h-28 rounded-xl border border-cyan-500/30 bg-[#0b1b36] p-3 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-full"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setIsCreateDialogOpen(false)}
              className="inline-flex h-10 items-center rounded-xl border border-cyan-500/20 bg-transparent px-4 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              {text.close}
            </button>
            <button
              type="button"
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending || !isUserRole}
              className="inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-5 text-xs font-bold text-black hover:opacity-95 disabled:opacity-40 transition-all shadow-md shadow-cyan-500/20"
            >
              {createTicketMutation.isPending ? text.creating : text.createTicketAction}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
