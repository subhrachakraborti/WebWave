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
import { joinChatroom } from '@/lib/actions/chat';
import { Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function JoinRoomDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
     if (code.trim().length !== 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Code must be 8 characters long.' });
      return;
    }
    setIsLoading(true);
    const result = await joinChatroom(code.toUpperCase());
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
      setIsLoading(false);
    } else {
      toast({ title: 'Success', description: `Joined chatroom.` });
      setCode('');
      setIsOpen(false);
      setIsLoading(false);
      router.push(`/dashboard/chat/${result.id}`);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Users className="mr-2 h-5 w-5" />
          Join with Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Chatroom</DialogTitle>
          <DialogDescription>
            Enter the 8-digit code for the room you want to join.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label htmlFor="room-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Code</label>
              <Input id="room-code" placeholder="ABC123DE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join Room
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
