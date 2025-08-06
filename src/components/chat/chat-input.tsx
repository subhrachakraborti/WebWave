'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/lib/actions/chat';
import { Loader2, Send, Smile, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/use-auth';

const emojis = ['😀', '😂', '😍', '🤔', '😢', '🔥', '👍', '❤️', '🎉', '👋'];

interface ChatInputProps {
  chatroomId: string;
}

export default function ChatInput({ chatroomId }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendMessage = async (messageContent?: { text: string; type: 'text' | 'image'; imageUrl?: string }) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send messages.' });
        return;
    }
    setIsLoading(true);
    
    const message = messageContent || { text, type: 'text' as const };

    if (message.type === 'text' && !message.text.trim()) {
      setIsLoading(false);
      return;
    }

    const result = await sendMessage(chatroomId, message, user.uid, user.displayName || 'Anonymous');
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      if(message.type === 'text') setText('');
    }
    setIsLoading(false);
  };

  const handleImageSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imageUrl = formData.get('imageUrl') as string;
    if (imageUrl) {
      handleSendMessage({ text: `Image: ${imageUrl}`, type: 'image', imageUrl });
      (e.target as HTMLFormElement).closest('dialog')?.close();
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="pr-24"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={!user}
        />
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!user}>
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="icon"
                    onClick={() => setText((prev) => prev + emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
           <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!user}>
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send an Image</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleImageSend} className="space-y-4">
                  <Input name="imageUrl" placeholder="https://example.com/image.png" type="url" required />
                  <DialogFooter>
                    <Button type="submit">Send Image</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          <Button onClick={() => handleSendMessage()} disabled={isLoading || !text.trim() || !user} size="icon">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
