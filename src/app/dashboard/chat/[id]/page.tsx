
'use client';

import { useChatroom, useMessages } from '@/hooks/use-chat';
import ChatHeader from '@/components/chat/chat-header';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { Loader2 } from 'lucide-react';
import React from 'react';

// The main page component is now responsible for handling params.
export default function ChatPage({ params }: { params: { id: string } }) {
  // Although this is a client component, Next.js recommends this pattern
  // for future compatibility. We can pass the id down.
  const id = params.id;
  return <ChatRoom id={id} />;
}

// A new component to contain the actual chat UI logic.
function ChatRoom({ id }: { id: string }) {
  const { chatroom, loading: chatroomLoading } = useChatroom(id);
  const { messages, loading: messagesLoading } = useMessages(id);

  const isLoading = chatroomLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chatroom) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <h2 className="text-2xl font-bold">Chat Not Found</h2>
        <p className="text-muted-foreground">
          This chat may have expired or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader chatroom={chatroom} />
      <ChatMessages messages={messages} loading={messagesLoading} />
      <ChatInput chatroomId={id} />
    </div>
  );
}
