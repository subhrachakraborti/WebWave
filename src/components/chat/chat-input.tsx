
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/lib/actions/chat';
import { Loader2, Send, Smile, Link as LinkIcon } from 'lucide-react';
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

const emojis = ['😀', '😂', '😍', '🤔', '😢', '🔥', '👍', '❤️', '🎉', '👋'];

interface ChatInputProps {
  chatroomId: string;
}

export default function ChatInput({ chatroomId }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (messageContent?: { text: string; type: 'text' | 'image'; imageUrl?: string }) => {
    setIsLoading(true);
    
    const message = messageContent || { text, type: 'text' as const };

    if (message.type === 'text' && !message.text.trim()) {
      setIsLoading(false);
      return;
    }

    const result = await sendMessage(chatroomId, message);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      if(message.type === 'text') setText('');
    }
    setIsLoading(false);
  };

  const handleLinkSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const linkUrl = formData.get('linkUrl') as string;
    if (linkUrl) {
      handleSendMessage({ text: linkUrl, type: 'text' });
      (e.target as HTMLFormElement).closest('dialog')?.close();
    }
  };

  return (
    <div className="p-2 md:p-4 border-t bg-background">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="pr-28 md:pr-32"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <div className="absolute top-1/2 right-1.5 md:right-2 transform -translate-y-1/2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <Smile className="h-4 w-4 md:h-5 md:w-5" />
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
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                  <LinkIcon className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send a Link</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLinkSend} className="space-y-4">
                  <Input name="linkUrl" placeholder="https://example.com" type="url" required />
                  <DialogFooter>
                    <Button type="submit">Send Link</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          <Button onClick={() => handleSendMessage()} disabled={isLoading || !text.trim()} size="icon" className="h-8 w-8 md:h-10 md:w-10">
            {isLoading ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Send className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
