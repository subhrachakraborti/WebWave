'use client';

import { useChatroom, useMessages } from '@/hooks/use-chat';
import ChatHeader from '@/components/chat/chat-header';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const { chatroom, loading: chatroomLoading } = useChatroom(params.id);
  const { messages, loading: messagesLoading } = useMessages(params.id);
  
  const isLoading = authLoading || chatroomLoading;

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
        <p className="text-muted-foreground">This chat may have expired or does not exist.</p>
      </div>
    );
  }
  
  if (!user || !chatroom.members.includes(user.uid)) {
     return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You are not a member of this chatroom.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen">
      <ChatHeader chatroom={chatroom} />
      <ChatMessages messages={messages} loading={messagesLoading} userId={user.uid} />
      <ChatInput chatroomId={params.id} />
    </div>
  );
}
