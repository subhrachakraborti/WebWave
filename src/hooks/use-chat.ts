'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chatroom, Message } from '@/lib/types';

const anonymousUserId = 'anonymous_user';

export function useChatrooms() {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'chatrooms'), where('members', 'array-contains', anonymousUserId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt.toDate(),
      })) as Chatroom[];
      setChatrooms(rooms.filter(room => room.expiresAt > new Date()));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chatrooms: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    setLoading(true);
    const q = query(collection(db, 'chatrooms', chatroomId, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
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

        const roomRef = doc(db, 'chatrooms', chatroomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const roomData = {
                    id: docSnap.id,
                    ...data,
                    expiresAt: data.expiresAt.toDate(),
                } as Chatroom;
                
                if (roomData.expiresAt > new Date()) {
                    setChatroom(roomData);
                } else {
                    setChatroom(null); // Room expired
                }
            } else {
                setChatroom(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching chatroom details: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatroomId]);

    return { chatroom, loading };
}
