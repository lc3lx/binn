"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Headphones, KeyRound, Send, Wallet, X } from "lucide-react";
import {
  useAdminSupportListQuery,
  useReplyToSupportTicketMutation,
  useUpdateSupportTicketStatusMutation,
} from "@/api/services/admin/admin-support/admin-support.query";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const statusBadgeClass = {
  open: "border border-primary/30 bg-primary/10 text-primary",
  waiting: "border border-[#6b4c14]/30 bg-[#4b3f15] text-primary",
  closed: "border border-white/10 bg-[#2d2d2f] text-white/45",
};

const formatTime = (value) => {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "--";
  }
};

export default function AdminSupportPage() {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith("/ar");
  const text = isArabic
    ? {
        title: "محادثات الدعم",
        openTickets: "تذاكر مفتوحة",
        filters: {
          active: "الكل",
          open: "مفتوحة",
          waiting: "قيد الانتظار",
          closed: "مغلقة",
        },
        loading: "جارٍ تحميل التذاكر...",
        loadError: "فشل تحميل تذاكر الدعم.",
        empty: "لا توجد تذاكر حالياً.",
        unknownUser: "مستخدم غير معروف",
        noSubject: "بدون عنوان",
        noMessages: "لا توجد رسائل بعد.",
        typeMessage: "اكتب رسالة",
        closeConversation: "إغلاق المحادثة",
        replySuccess: "تم إرسال الرد بنجاح.",
        replyError: "فشل إرسال الرد.",
        closeSuccess: "تم إغلاق التذكرة بنجاح.",
        closeError: "فشل إغلاق التذكرة.",
        account: "الحساب",
        active: "نشط",
        balance: "الرصيد",
        kyc: "التوثيق",
      }
    : {
        title: "Support Conversations",
        openTickets: "open tickets",
        filters: {
          active: "All",
          open: "Open",
          waiting: "Waiting",
          closed: "Closed",
        },
        loading: "Loading tickets...",
        loadError: "Failed to load support tickets.",
        empty: "No tickets found.",
        unknownUser: "Unknown user",
        noSubject: "No subject",
        noMessages: "No messages yet.",
        typeMessage: "Type a message",
        closeConversation: "Close conversation",
        replySuccess: "Reply sent successfully.",
        replyError: "Failed to send reply.",
        closeSuccess: "Ticket closed successfully.",
        closeError: "Failed to close ticket.",
        account: "Account",
        active: "Active",
        balance: "Balance",
        kyc: "KYC",
      };

  const filters = [
    { key: "active", label: text.filters.active },
    { key: "open", label: text.filters.open },
    { key: "waiting", label: text.filters.waiting },
    { key: "closed", label: text.filters.closed },
  ];

  const [selectedFilter, setSelectedFilter] = useState("active");
  const [message, setMessage] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const { data, isLoading, isError } = useAdminSupportListQuery({
    status: selectedFilter,
    page: 1,
    limit: 10,
  });
  const { mutate: replyToTicket, isPending: isReplyPending } =
    useReplyToSupportTicketMutation({
      onSuccess: () => {
        setMessage("");
        toast.success(text.replySuccess);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || text.replyError);
      },
    });
  const { mutate: updateTicketStatus, isPending: isStatusPending } =
    useUpdateSupportTicketStatusMutation({
      onSuccess: () => {
        toast.success(text.closeSuccess);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || text.closeError);
      },
    });

  const tickets = useMemo(() => data?.data || [], [data]);
  const counters = data?.counters || { all: 0, open: 0, waiting: 0, closed: 0 };

  const activeTicketId = useMemo(() => {
    if (!tickets.length) return null;
    if (selectedTicketId && tickets.some((t) => t?._id === selectedTicketId)) {
      return selectedTicketId;
    }
    return tickets[0]._id;
  }, [tickets, selectedTicketId]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket?._id === activeTicketId) || null,
    [activeTicketId, tickets],
  );

  const selectedMessages = Array.isArray(selectedTicket?.messages)
    ? selectedTicket.messages
    : [];

  const openCount = counters?.open || 0;

  const handleSendReply = () => {
    const text = message.trim();
    if (!selectedTicket?._id || !text) return;

    replyToTicket({
      ticketId: selectedTicket._id,
      payload: { message: text },
    });
  };

  const handleCloseTicket = () => {
    if (!selectedTicket?._id || String(selectedTicket?.status).toLowerCase() === "closed") {
      return;
    }

    updateTicketStatus({
      ticketId: selectedTicket._id,
      payload: { status: "closed" },
    });
  };

  return (
    <div className="min-h-screen p-4 text-white sm:p-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-[30px] font-bold leading-none text-white">
            {text.title}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {openCount} {text.openTickets}
          </p>
        </div>

        <div className="overflow-hidden rounded-[12px] border border-white/5 bg-[#242426]">
          <div className="grid min-h-[640px] grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_260px]">
            <div className="border-r border-white/5 bg-[#1f1f20]">
              <div className="flex items-center gap-2 border-b border-white/5 p-3">
                {filters.map((filter) => {
                  const active = selectedFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setSelectedFilter(filter.key)}
                      className={`rounded-md px-3 py-2 text-xs transition-colors ${
                        active
                          ? "bg-primary text-black"
                          : "text-white/45 hover:bg-[#2d2d2f] hover:text-white/75"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-0">
                {isLoading ? (
                  <div className="px-4 py-5 text-xs text-white/55">{text.loading}</div>
                ) : isError ? (
                  <div className="px-4 py-5 text-xs text-red-400">
                    {text.loadError}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="px-4 py-5 text-xs text-white/45">{text.empty}</div>
                ) : (
                  tickets.map((ticket) => {
                    const active = activeTicketId === ticket._id;
                    const status = String(ticket?.status || "open").toLowerCase();
                    const userName = ticket?.user?.name || text.unknownUser;
                    const preview = ticket?.messages?.[0]?.message || "--";

                    return (
                      <button
                        key={ticket._id}
                        type="button"
                        onClick={() => setSelectedTicketId(ticket._id)}
                        className={`w-full border-b border-white/5 px-3 py-4 text-left transition-colors hover:bg-white/[0.02] ${
                          active ? "bg-[#262628]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-black">
                              {userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">
                                {userName}
                              </div>
                              <div className="mt-1 text-[11px] text-primary/90">
                                {ticket?.subject || "--"}
                              </div>
                              <div className="mt-2 max-w-[190px] truncate text-[11px] text-white/35">
                                {preview}
                              </div>
                              <div className="mt-2 text-[10px] text-white/28">
                                {formatTime(ticket?.lastReplyAt || ticket?.updatedAt)}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${
                              statusBadgeClass[status] || statusBadgeClass.open
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex min-h-[640px] flex-col border-r border-white/5 bg-[#2a2a2c]">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-black">
                    {(selectedTicket?.user?.name || "UN").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {selectedTicket?.user?.name || text.unknownUser}
                    </div>
                    <div className="text-xs text-white/35">
                      {selectedTicket?.subject || text.noSubject}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] text-primary">
                    {selectedTicket?.status || "open"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCloseTicket}
                    disabled={
                      isStatusPending ||
                      String(selectedTicket?.status || "").toLowerCase() === "closed"
                    }
                    className="text-white/35 transition-colors hover:text-white/65"
                    aria-label={text.closeConversation}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 px-4 py-5">
                {selectedMessages.length === 0 ? (
                  <div className="text-xs text-white/45">{text.noMessages}</div>
                ) : (
                  selectedMessages.map((item, index) => {
                    const isAdmin = item?.senderRole === "admin";
                    return (
                      <div
                        key={`${item?.createdAt || index}-${index}`}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[340px] rounded-[12px] border px-4 py-3 ${
                            isAdmin
                              ? "border-primary/10 bg-[#3a3216] text-primary"
                              : "border-white/15 bg-[#333335] text-white"
                          }`}
                        >
                          <div className="text-sm leading-6">{item?.message || "--"}</div>
                          <div
                            className={`mt-2 text-[10px] ${
                              isAdmin ? "text-primary/70" : "text-white/35"
                            }`}
                          >
                            {formatTime(item?.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/5 p-3">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={text.typeMessage}
                    className="h-10 rounded-[10px] border-white/10 bg-[#3a3a3c] text-sm text-white placeholder:text-white/25"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isReplyPending || !message.trim() || !selectedTicket?._id}
                    className="absolute top-1/2 -translate-y-1/2 text-primary transition-colors hover:text-primary/80 ltr:right-3 rtl:left-3"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1f1f20] px-4 py-5">
              <div className="flex flex-col items-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-bold text-black">
                  {(selectedTicket?.user?.name || "UN").slice(0, 2).toUpperCase()}
                </div>
                <div className="mt-4 text-lg font-semibold text-white">
                  {selectedTicket?.user?.name || "--"}
                </div>
                <div className="mt-1 text-xs text-white/35">
                  {selectedTicket?.user?.email || "--"}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-[10px] bg-[#2d2d2f] px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <KeyRound className="h-3.5 w-3.5 text-primary/75" />
                    {text.account}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-primary">{text.active}</div>
                </div>

                <div className="rounded-[10px] bg-[#2d2d2f] px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <Wallet className="h-3.5 w-3.5 text-primary/75" />
                    {text.balance}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-primary">--</div>
                </div>

                <div className="rounded-[10px] bg-[#2d2d2f] px-4 py-3">
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <Headphones className="h-3.5 w-3.5 text-primary/75" />
                    {text.kyc}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-primary">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
