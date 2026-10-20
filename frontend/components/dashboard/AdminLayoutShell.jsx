"use client";

import { useState } from "react";
import AdminSidebar from "@/components/dashboard/admin_sidebar";
import AdminHeader from "@/components/dashboard/AdminHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function AdminLayoutShell({ locale, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="min-h-screen flex">
      <AdminSidebar />

      <main className="flex-1 bg-background">
        <AdminHeader
          locale={locale}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />
        {children}
      </main>

      <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <DialogContent className="left-0 top-0 h-screen w-[280px] max-w-[280px] translate-x-0 translate-y-0 border-r border-white/10 bg-sidebar p-0 data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 sm:rounded-none">
          <DialogTitle className="sr-only">Admin navigation menu</DialogTitle>
          <AdminSidebar asDrawer />
        </DialogContent>
      </Dialog>
    </div>
  );
}
