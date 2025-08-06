'use client';

import Link from 'next/link';
import { LogOut, MessageSquarePlus, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChatrooms } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import UserAvatar from '@/components/user-avatar';
import { signOutUser } from '@/lib/actions/auth';
import { CreateRoomButton } from './create-room-button';
import { JoinRoomDialog } from './join-room-dialog';
import { Skeleton } from '../ui/skeleton';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export default function ChatSidebar() {
  const { user, loading: authLoading } = useAuth();
  const { chatrooms, loading: chatroomsLoading } = useChatrooms(user?.uid);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOutUser();
  };

  return (
    <aside className="flex h-full w-full max-w-xs flex-col border-r bg-secondary/20">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">WebWave</h1>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="mb-2 text-lg font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chatrooms
          </h2>
          <div className="space-y-1">
            {chatroomsLoading ? (
              <>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </>
            ) : chatrooms.length > 0 ? (
              chatrooms.map((room) => (
                <Button
                  key={room.id}
                  variant={pathname === `/dashboard/chat/${room.id}` ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/dashboard/chat/${room.id}`}>{room.name}</Link>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-2">No chatrooms yet.</p>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <CreateRoomButton />
        <JoinRoomDialog />
      </div>

      <div className="mt-auto p-4 border-t">
        {authLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
                <UserAvatar name={user.displayName} />
                <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">{user.displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
