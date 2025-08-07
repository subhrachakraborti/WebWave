
'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '../user-avatar';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';


interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

// Basic regex to check if a string is a URL
const urlRegex = /^(https?:\/\/[^\s]+)/;

function ChatMessageContent({ message, isCurrentUser }: { message: Message, isCurrentUser: boolean }) {
    if (message.type === 'image' && message.image_url) {
        return (
            <a href={message.image_url} target="_blank" rel="noopener noreferrer">
                <Image
                    src={message.image_url}
                    alt="User uploaded content"
                    width={300}
                    height={300}
                    className="rounded-md object-cover"
                    data-ai-hint="user image"
                />
            </a>
        );
    }

    if (message.text && urlRegex.test(message.text)) {
        return (
            <a 
                href={message.text} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={cn(
                    "hover:underline break-all",
                    isCurrentUser ? "text-blue-200" : "text-blue-400"
                )}
            >
                {message.text}
            </a>
        );
    }

    return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
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
            const isCurrentUser = user && message.sender_id === user.uid;
            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}
              >
                {!isCurrentUser && <UserAvatar name={message.sender_name} userId={message.sender_id} />}
                <div
                  className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2',
                    isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  {!isCurrentUser && <p className="text-xs font-bold mb-1">{message.sender_name}</p>}
                  <ChatMessageContent message={message} isCurrentUser={!!isCurrentUser} />
                  <p className={cn('text-xs mt-1', isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {format(new Date(message.created_at), 'p')}
                  </p>
                </div>
                {isCurrentUser && <UserAvatar name={message.sender_name} userId={message.sender_id} />}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
