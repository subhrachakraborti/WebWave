'use client';

import Logo from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <Logo className="h-24 w-24 text-primary" />
      <h1 className="text-4xl font-bold">Welcome to WebWave, {user?.displayName || 'User'}!</h1>
      <p className="max-w-md text-muted-foreground">
        Your space for ephemeral, real-time conversations. Create a new chatroom or join one using a code to get started.
      </p>
    </div>
  );
}
