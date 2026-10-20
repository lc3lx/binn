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
import { ArrowLeft, Headphones, Loader2, Send, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useCreateSupportTicketMutation,
  useMySupportTicketsQuery,
  useSendSupportMessageMutation,
} from "@/api/services/user/support/support.query";

export default function SupportPage() {
  const { locale } = useTranslations();
  const isArabic = locale === "ar";
  const router = useRouter();
  const { user } = useAuth();
  const isUserRole = String(user?.role || "").toLowerCase() === "user";

  const text = isArabic
    ? {
        title: "مركز الدعم",
        subtitle: "مساعدة 24/7 من فريق المنصة.",
        back: "رجوع",
        tickets: "تذاكري",
        newTicket: "إنشاء تذكرة",
        addNewTicket: "+ بطاقة جديدة",
        addDialogTitle: "إضافة بطاقة جديدة",
        addDialogDescription: "أدخل الموضوع والرسالة لإنشاء تذكرة دعم جديدة.",
        forcedDialogHint:
          "يجب إنشاء تذكرة أولاً لبدء المحادثة مع فريق الدعم.",
        createTicketAction: "إنشاء البطاقة",
        close: "إغلاق",
        subject: "الموضوع",
        subjectPlaceholder: "مثال: لم يصلني السحب",
        messagePlaceholder: "اكتب رسالتك...",
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
        roleError: "يلزم تسجيل الدخول بحساب مستخدم لفتح تذاكر الدعم",
        status: {
          open: "مفتوحة",
          waiting: "قيد الانتظار",
          closed: "مغلقة",
        },
      }
    : {
        title: "Support Center",
        subtitle: "Get 24/7 assistance from our platform team.",
        back: "Back",
        tickets: "My Tickets",
        newTicket: "Create Ticket",
        addNewTicket: "Add New Ticket",
        addDialogTitle: "Add New Ticket",
        addDialogDescription:
          "Enter subject and message to create a new support ticket.",
        forcedDialogHint:
          "You need to create your first ticket to start chatting with support.",
        createTicketAction: "Create Ticket",
        close: "Close",
        subject: "Subject",
        subjectPlaceholder: "e.g. Withdrawal not received",
        messagePlaceholder: "Type a message...",
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
        roleError: "You must be logged in as a user to use support tickets",
        status: {
          open: "Open",
          waiting: "Waiting",
          closed: "Closed",
        },
      };

  const [message, setMessage] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState(
    "Withdrawal not received",
  );
  const [newTicketMessage, setNewTicketMessage] = useState(
    "I submitted withdrawal 3 days ago.",
  );

  const { data, isLoading } = useMySupportTicketsQuery();
  const createTicketMutation = useCreateSupportTicketMutation();
  const sendMessageMutation = useSendSupportMessageMutation();

  const tickets = Array.isArray(data?.data) ? data.data : [];

  const resolvedSelectedTicketId = selectedTicketId || tickets[0]?._id || "";
  const isDialogForcedOpen = !isLoading && tickets.length === 0;

  const selectedTicket =
    tickets.find((t) => t._id === resolvedSelectedTicketId) ||
    tickets[0] ||
    null;

  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
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

  const isCreatingNew = isCreateDialogOpen || isDialogForcedOpen;
  const canSendMessage = Boolean(selectedTicket?._id && message.trim());
  const canCreateTicket = Boolean(
    newTicketSubject.trim() && newTicketMessage.trim(),
  );

  const handleCreateNewTicketMode = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    if (isDialogForcedOpen && !open) {
      toast.info(text.forcedDialogHint);
      return;
    }
    setIsCreateDialogOpen(open);
  };

  const handleCreateTicket = async () => {
    if (!isUserRole) {
      toast.error(text.roleError);
      return;
    }
    if (!canCreateTicket) {
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

  const handleSubmitMessage = async () => {
    if (!isUserRole) {
      toast.error(text.roleError);
      return;
    }
    const value = message.trim();
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
      setMessage("");
    } catch (error) {
      toast.error(error?.response?.data?.message || text.sendError);
    }
  };

  const isBusy =
    createTicketMutation.isPending || sendMessageMutation.isPending;

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-background p-3 text-white sm:p-4"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {text.title}
            <p className="mt-1 text-sm font-normal text-white/45">
              {text.subtitle}
            </p>
          </h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#232325] px-4 text-sm font-medium text-white/85 transition-colors hover:bg-[#2b2b2e] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {text.back}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/20 bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
            <div className="border-b border-black/15 bg-[#1a1a1b] lg:border-b-0 lg:border-r lg:border-black/15">
              <div className="border-b border-black/15 px-4 py-3 text-sm font-semibold text-white">
                {text.tickets}
              </div>
              <div className="max-h-[520px] overflow-y-auto p-3 space-y-2">
                {isLoading ? (
                  <p className="text-xs text-white/60">{text.loading}</p>
                ) : null}
                {!isLoading ? (
                  <button
                    type="button"
                    onClick={handleCreateNewTicketMode}
                    className={`w-full rounded-lg border px-3 py-2 text-start text-xs font-semibold transition-colors ${
                      isCreatingNew
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 bg-[#232325] text-white/90 hover:bg-[#2a2a2d]"
                    }`}
                  >
                    {text.addNewTicket}
                  </button>
                ) : null}
                {!isLoading && !tickets.length ? (
                  <p className="text-xs text-white/60">{text.noTickets}</p>
                ) : null}
                {tickets.map((ticket) => (
                  <button
                    key={ticket._id}
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(ticket._id);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-start transition-colors ${
                      selectedTicket?._id === ticket._id
                        ? "border-primary/50 bg-primary/10"
                        : "border-white/10 bg-[#232325] hover:bg-[#2a2a2d]"
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">
                      {ticket.subject}
                    </div>
                    <div className="mt-1 text-[11px] text-white/60">
                      {formatDate(ticket.updatedAt)}
                    </div>
                    <div className="mt-1 text-[11px] text-primary">
                      {statusLabel(ticket.status)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 border-b border-black/15 px-4 py-3">
                <div className="grid h-6 w-6 place-items-center rounded-md bg-primary">
                  <Headphones className="h-4 w-4 text-black" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {selectedTicket?.subject || text.newTicket}
                </span>
              </div>

              <div
                ref={listRef}
                className="h-[420px] overflow-y-auto bg-[#1e1e1f] px-4 py-5 sm:px-5"
              >
                <div className="space-y-2.5">
                  {!selectedTicket?._id ? (
                    <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-center text-sm text-white/60">
                      {text.noTickets}
                    </div>
                  ) : null}
                  {(selectedTicket?.messages || []).map((msg, index) => {
                    const isUser =
                      String(msg.senderRole || "").toLowerCase() === "user";
                    return (
                      <div
                        key={`${msg.createdAt || index}-${index}`}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {isUser ? (
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-black">
                              {msg.message}
                              <div className="mt-1 text-[10px] text-black/70">
                                {formatDate(msg.createdAt)}
                              </div>
                            </div>
                            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary">
                              <UserRound className="h-3.5 w-3.5 text-black" />
                            </div>
                          </div>
                        ) : (
                          <div className="max-w-[320px] rounded-md bg-[#313133] px-3 py-2 text-[11px] text-white/95">
                            {msg.message}
                            <div className="mt-1 text-[10px] text-white/60">
                              {formatDate(msg.createdAt)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-black/15 bg-[#2a2a2d] px-4 py-4">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmitMessage();
                    }}
                    placeholder={text.messagePlaceholder}
                    className="h-9 rounded-lg border-0 bg-[#1f1f20] pr-12 text-xs text-white placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitMessage}
                    disabled={isBusy || !canSendMessage || !isUserRole}
                    className="absolute top-1/2 cursor-pointer text-primary transition-transform hover:scale-105 disabled:opacity-60 rtl:left-3 rtl:-translate-y-1/2 ltr:right-3 ltr:-translate-y-1/2"
                    aria-label={text.send}
                  >
                    {isBusy ? (
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
      </div>

      <Dialog open={isCreatingNew} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className={`border-white/10 bg-sidebar text-white sm:max-w-lg ${
            isDialogForcedOpen ? "[&>button]:hidden" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle>{text.addDialogTitle}</DialogTitle>
            <DialogDescription className="text-white/60">
              {text.addDialogDescription}
            </DialogDescription>
          </DialogHeader>

          {isDialogForcedOpen ? (
            <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
              {text.forcedDialogHint}
            </div>
          ) : null}

          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs text-white/70">{text.subject}</div>
              <Input
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder={text.subjectPlaceholder}
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-white/70">
                {text.messagePlaceholder}
              </div>
              <textarea
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder={text.messagePlaceholder}
                className="min-h-28 rounded-lg border-white/10 bg-[#232325] text-sm text-white placeholder:text-white/35 focus-visible:ring-1 w-full focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            {!isDialogForcedOpen ? (
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="inline-flex h-10 items-center rounded-md border border-white/10 bg-transparent px-4 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {text.close}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleCreateTicket}
              disabled={
                createTicketMutation.isPending ||
                !canCreateTicket ||
                !isUserRole
              }
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {createTicketMutation.isPending
                ? text.creating
                : text.createTicketAction}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
