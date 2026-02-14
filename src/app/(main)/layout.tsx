import { AppSidebar } from "@/components/global/sidebar";
import TopBar from "@/components/global/sidebar/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { ReactNode, Suspense } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <TopBar />
        <div className="p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
