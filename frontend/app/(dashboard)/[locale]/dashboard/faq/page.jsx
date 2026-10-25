"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteFaqMutation,
  useFaqListQuery,
} from "@/api/services/admin/faq/faq.query";
import AddFaqDialog from "./components/Add-faq-dialog";
import EditFaqDialog from "./components/Edit-faq-dialog";
import DeleteGlobal from "@/components/shared/delete-global";
import { usePathname } from "next/navigation";

export default function AdminFaqPage() {
  const pathname = usePathname();
  const isArabic = pathname?.startsWith("/ar");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  const { data, isLoading, isError } = useFaqListQuery();
  const { mutate: deleteFaq, isPending: isDeletingFaq } = useDeleteFaqMutation({
    onSuccess: () => {
      toast.success(isArabic ? "تم حذف السؤال" : "FAQ deleted successfully");
      setIsDeleteOpen(false);
      setSelectedFaq(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          (isArabic ? "تعذر حذف السؤال" : "Failed to delete FAQ"),
      );
    },
  });

  const faqItems = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const itemsCount = Number(data?.results || faqItems.length || 0);
  const categoriesCount = useMemo(
    () =>
      new Set(
        faqItems
          .map((item) => String(item?.category || "").trim())
          .filter(Boolean),
      ).size,
    [faqItems],
  );

  return (
    <div className="min-h-screen  p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-bold leading-none text-white">
              {isArabic ? "إدارة الأسئلة الشائعة" : "FAQ Management"}
            </h1>
            <p className="mt-2 text-sm text-white/45">
              {isArabic
                ? `${itemsCount} سؤال في ${categoriesCount} تصنيفات`
                : `${itemsCount} FAQ items across ${categoriesCount} categories`}
            </p>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {isArabic ? "إضافة سؤال" : "Add FAQ"}
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-[14px] border border-white/10 bg-background px-4 py-5 text-sm text-white/55">
            {isArabic ? "جاري تحميل الأسئلة..." : "Loading FAQs..."}
          </div>
        ) : isError ? (
          <div className="rounded-[14px] border border-red-400/30 bg-red-500/5 px-4 py-5 text-sm text-red-300">
            {isArabic ? "تعذر تحميل الأسئلة." : "Failed to load FAQs."}
          </div>
        ) : faqItems.length === 0 ? (
          <div className="rounded-[14px] border border-white/10 bg-background px-4 py-5 text-sm text-white/55">
            {isArabic ? "لا توجد أسئلة شائعة." : "No FAQs found."}
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item?._id || `faq-${index}`}
                value={item?._id || `item-${index}`}
                className="overflow-hidden rounded-[14px] border border-white/10 bg-background px-4"
              >
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="flex-1 py-5 text-base font-medium text-white hover:no-underline">
                    {item?.question || "--"}
                  </AccordionTrigger>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFaq(item);
                        setIsEditOpen(true);
                      }}
                      className="text-primary transition-colors hover:text-primary/80"
                      aria-label={`Edit FAQ ${index + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFaq(item);
                        setIsDeleteOpen(true);
                      }}
                      className="text-[#ef4444] transition-colors hover:text-[#f87171]"
                      aria-label={`Delete FAQ ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <AccordionContent className="text-sm leading-7 text-white/55">
                  {item?.answer || "--"}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <AddFaqDialog open={isAddOpen} onOpenChange={setIsAddOpen} isArabic={isArabic} />
      <EditFaqDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        faq={selectedFaq}
        isArabic={isArabic}
      />
      <DeleteGlobal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          if (!selectedFaq?._id) return;
          deleteFaq(selectedFaq._id);
        }}
        isLoading={isDeletingFaq}
        title={isArabic ? "حذف السؤال" : "Delete FAQ"}
        description={
          isArabic
            ? "سيتم حذف هذا السؤال نهائياً. لا يمكن التراجع عن هذا الإجراء."
            : "This FAQ item will be permanently deleted. This action cannot be undone."
        }
        confirmText={isArabic ? "حذف" : "Delete"}
        cancelText={isArabic ? "إلغاء" : "Cancel"}
        isArabic={isArabic}
      />
    </div>
  );
}
