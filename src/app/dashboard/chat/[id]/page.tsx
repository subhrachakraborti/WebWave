
'use client';

import { useChatroom, useMessages } from '@/hooks/use-chat';
import ChatHeader from '@/components/chat/chat-header';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { Loader2 } from 'lucide-react';
import React from 'react';

// The main page component is now responsible for handling params.
export default function ChatPage({ params }: { params: { id: string } }) {
  // We extract the id here and pass it down to the client component.
  const id = params.id;
  return <ChatRoom id={id} />;
}

// This new component contains the actual chat UI and its logic.
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
