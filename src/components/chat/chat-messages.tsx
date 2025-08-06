
'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '../user-avatar';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No messages yet. Be the first to say something!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = user && message.senderId === user.uid;
            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}
              >
                {!isCurrentUser && <UserAvatar name={message.senderName} />}
                <div
                  className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2',
                    isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  {!isCurrentUser && <p className="text-xs font-bold mb-1">{message.senderName}</p>}
                  {message.type === 'image' && message.imageUrl ? (
                    <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={message.imageUrl}
                        alt="User uploaded content"
                        width={300}
                        height={300}
                        className="rounded-md object-cover"
                        data-ai-hint="user image"
                      />
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  <p className={cn('text-xs mt-1', isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isCurrentUser && <UserAvatar name={message.senderName} />}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
