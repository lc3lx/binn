"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteGlobal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Delete Item",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isArabic = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border-white/10 bg-[#202021] text-white sm:max-w-md ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        <DialogHeader className={isArabic ? "sm:text-right" : "sm:text-left"}>
          <div className="mb-2 flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-[#ef4444]" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-white/55">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter
          className={`gap-2 ${isArabic ? "sm:flex-row-reverse" : "sm:flex-row"}`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-white/15 bg-[#2a2a2c] text-white/85 hover:bg-[#303033] hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isArabic ? "جارٍ الحذف..." : "Deleting..."}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
