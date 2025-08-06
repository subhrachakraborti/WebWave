'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { useChatrooms } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { CreateRoomButton } from './create-room-button';
import { JoinRoomDialog } from './join-room-dialog';
import { Skeleton } from '../ui/skeleton';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

export default function ChatSidebar() {
  const { chatrooms, loading: chatroomsLoading } = useChatrooms();
  const pathname = usePathname();

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

      <div className="p-4 border-t space-y-2 mt-auto">
        <CreateRoomButton />
        <JoinRoomDialog />
      </div>
    </aside>
  );
}
