'use client';

import { Chatroom } from '@/lib/types';
import { Users, Trash2 } from 'lucide-react';
import { SharePopover } from './share-popover';
import { useAuth } from '@/hooks/use-auth';
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

interface ChatHeaderProps {
  chatroom: Chatroom;
}

export default function ChatHeader({ chatroom }: ChatHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isCreator = user?.uid === chatroom.creatorId;

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
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">{chatroom.name}</h2>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{chatroom.members.length} / 7 members</span>
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
