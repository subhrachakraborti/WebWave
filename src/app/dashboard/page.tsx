'use client';

import Logo from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/use-sidebar-provider';

export default function DashboardPage() {
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center sm:p-8">
      <Logo className="h-24 w-24 text-primary" />
      <h1 className="text-3xl font-bold sm:text-4xl">Welcome to WebWave, {user?.displayName || 'User'}!</h1>
      <p className="max-w-md text-muted-foreground">
        Select a chatroom from the sidebar to start messaging, or create a new one.
      </p>
      <Button
        className="lg:hidden"
        onClick={() => setOpenMobile(true)}
      >
        Create or Join Room
      </Button>
    </div>
  );
}
