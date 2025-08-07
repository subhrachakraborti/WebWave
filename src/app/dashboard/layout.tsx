'use client';

import ChatSidebar from '@/components/chat/sidebar';
import { Sidebar } from '@/components/ui/sidebar';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useSidebar, SidebarProvider } from '@/hooks/use-sidebar-provider';

function MobileHeader() {
  const { setOpenMobile } = useSidebar();
  return (
    <header className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => setOpenMobile(true)}
        >
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6 text-primary" />
        <span className="font-bold">WebWave</span>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <ChatSidebar />
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <MobileHeader />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
