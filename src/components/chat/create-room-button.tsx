
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createChatroom } from '@/lib/actions/chat';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateRoomButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (roomName.trim().length < 3) {
      toast({ variant: 'destructive', title: 'Error', description: 'Room name must be at least 3 characters.' });
      return;
    }

    setIsLoading(true);
    const result = await createChatroom(roomName);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
      setIsLoading(false);
    } else {
      toast({ title: 'Success', description: 'Chatroom created.' });
      setRoomName('');
      setIsOpen(false);
      setIsLoading(false);
      router.push(`/dashboard/chat/${result.id}`);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
           <MessageSquarePlus className="mr-2 h-5 w-5" />
          Create New Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Chatroom</DialogTitle>
          <DialogDescription>
            Give your new chatroom a name. It will expire in 2 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Name</label>
              <Input id="room-name" placeholder="E.g., Project Phoenix" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Room
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
