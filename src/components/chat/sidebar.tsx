
'use client';

import Link from 'next/link';
import { Users, LogIn, LogOut, MessageSquarePlus } from 'lucide-react';
import { useChatrooms } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { CreateRoomButton } from './create-room-button';
import { JoinRoomDialog } from './join-room-dialog';
import { Skeleton } from '../ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { signOutUser } from '@/lib/actions/auth';
import UserAvatar from '../user-avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ChatSidebar() {
  const { chatrooms, loading: chatroomsLoading } = useChatrooms();
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from client-side
      await signOutUser(); // Sign out from server-side (clear cookie)
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to log out.' });
    }
  };

  return (
    <aside className="flex h-full w-full max-w-xs flex-col border-r bg-secondary/20">
      <div className="p-4 border-b flex justify-between items-center">
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
            {chatroomsLoading || authLoading ? (
              <>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </>
            ) : user ? (
              chatrooms.length > 0 ? (
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
                <p className="text-sm text-muted-foreground p-2">No chatrooms yet. Create or join one!</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground p-2">Please log in to see your chatrooms.</p>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2 mt-auto">
        {authLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : user ? (
          <>
            <div className="flex items-center justify-between">
              <div className='flex items-center gap-2'>
                <UserAvatar name={user.displayName} imageUrl={user.photoURL} />
                <span className="text-sm font-medium truncate">{user.displayName || 'User'}</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Log Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CreateRoomButton />
            <JoinRoomDialog />
          </>
        ) : (
          <>
            <CreateRoomButton />
            <JoinRoomDialog />
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="mr-2 h-5 w-5" />
              Login to View Dashboard
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
