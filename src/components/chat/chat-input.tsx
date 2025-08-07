
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/lib/actions/chat';
import { Loader2, Send, Smile, Link as LinkIcon, Info } from 'lucide-react';
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
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
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
      setIsLinkDialogOpen(false); // Close the dialog
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
           <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                  <LinkIcon className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle>Send a Link</DialogTitle>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="top">
                           <div className="grid gap-4">
                               <div className="space-y-1">
                                <h4 className="font-medium leading-none">Sharing Content</h4>
                                <p className="text-sm text-muted-foreground">
                                    You can send any direct URL. For sharing files like images, videos, or documents, use a peer-to-peer service.
                                </p>
                               </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Recommended: <a href="https://file.pizza/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">file.pizza</a></h4>
                                     <p className="text-xs text-muted-foreground">
                                        ✅ Only upload files you have the right to share.
                                    </p>
                                     <p className="text-xs text-muted-foreground">
                                        ⚠️ No illegal or harmful content allowed.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                       🔒 Share download links only with known recipients.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        📤 Files are shared directly between browsers — no server storage.
                                    </p>
                                </div>
                           </div>
                        </PopoverContent>
                    </Popover>
                  </div>
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
