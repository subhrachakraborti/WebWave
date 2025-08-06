
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/firebase';
import { Chatroom, Message } from '@/lib/types';
import { useAuth } from './use-auth';

export function useChatrooms() {
  const { user } = useAuth();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChatrooms([]);
      setLoading(false);
      return;
    }

    const fetchChatrooms = async () => {
        setLoading(true);
        const { data: memberEntries, error: memberError } = await supabase
            .from('chatroom_members')
            .select('chatroom_id')
            .eq('user_id', user.uid);
            
        if (memberError || !memberEntries) {
            console.error("Error fetching user's chatrooms:", memberError);
            setChatrooms([]);
            setLoading(false);
            return;
        }

        const roomIds = memberEntries.map(entry => entry.chatroom_id);

        if (roomIds.length > 0) {
            const { data: roomData, error: roomError } = await supabase
                .from('chatrooms')
                .select('*, chatroom_members(user_id)')
                .in('id', roomIds)
                .filter('expires_at', 'gt', new Date().toISOString());
            
            if (roomError) {
                console.error("Error fetching chatroom details:", roomError);
                setChatrooms([]);
            } else {
                setChatrooms(roomData as Chatroom[]);
            }
        } else {
            setChatrooms([]);
        }
        setLoading(false);
    };

    fetchChatrooms();
    
    const channel = supabase.channel('public:chatroom_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chatroom_members', filter: `user_id=eq.${user.uid}` }, fetchChatrooms)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chatrooms' }, fetchChatrooms)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user]);

  return { chatrooms, loading };
}

export function useMessages(chatroomId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatroomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chatroom_id', chatroomId)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        } else {
            setMessages(data as Message[]);
        }
        setLoading(false);
    };

    fetchMessages();

    const channel = supabase.channel(`public:messages:chatroom_id=eq.${chatroomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chatroom_id=eq.${chatroomId}` }, (payload) => {
        setMessages(currentMessages => [...currentMessages, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [chatroomId]);

  return { messages, loading };
}

export function useChatroom(chatroomId: string | null) {
    const [chatroom, setChatroom] = useState<Chatroom | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chatroomId) {
            setChatroom(null);
            setLoading(false);
            return;
        }

        const fetchChatroom = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('chatrooms')
                .select('*, chatroom_members(user_id)')
                .eq('id', chatroomId)
                .single();
            
            if (error || !data || new Date(data.expires_at) < new Date()) {
                console.error("Error fetching chatroom, or it has expired:", error);
                setChatroom(null);
            } else {
                setChatroom(data as Chatroom);
            }
            setLoading(false);
        };
        
        fetchChatroom();

        const roomChannel = supabase.channel(`public:chatrooms:id=eq.${chatroomId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'chatrooms', filter: `id=eq.${chatroomId}`}, fetchChatroom)
          .subscribe();
        
        const memberChannel = supabase.channel(`public:chatroom_members:chatroom_id=eq.${chatroomId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chatroom_members', filter: `chatroom_id=eq.${chatroomId}` }, fetchChatroom)
            .subscribe();

        return () => {
            supabase.removeChannel(roomChannel);
            supabase.removeChannel(memberChannel);
        };
    }, [chatroomId]);

    return { chatroom, loading };
}
