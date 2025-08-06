
'use client';

import { useState, useEffect } from 'react';
import { Chatroom } from '@/lib/types';
import { Users, Trash2, Clock } from 'lucide-react';
import { SharePopover } from './share-popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { deleteChatroom } from '@/lib/actions/chat';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface ChatHeaderProps {
  chatroom: Chatroom;
}

export default function ChatHeader({ chatroom }: ChatHeaderProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');

  const isCreator = user && chatroom.creator_id === user.uid;
  const memberCount = chatroom.chatroom_members?.length || 0;

  useEffect(() => {
    if (!chatroom.expires_at) return;

    const interval = setInterval(() => {
      const expirationTime = new Date(chatroom.expires_at).getTime();
      const now = new Date().getTime();
      const distance = expirationTime - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chatroom.expires_at]);

  const handleDelete = async () => {
    const result = await deleteChatroom(chatroom.id);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success', description: 'Chatroom deleted.' });
      router.push('/dashboard');
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-secondary/40">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{chatroom.name}</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{memberCount} / 7 members</span>
            </div>
             {timeLeft && (
            <div className="flex items-center font-mono text-xs bg-muted px-2 py-1 rounded-md">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>Expires in: {timeLeft}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SharePopover code={chatroom.code} />
        {isCreator && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete Chatroom</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the chatroom and all of its messages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </header>
  );
}
