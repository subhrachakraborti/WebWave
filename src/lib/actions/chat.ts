'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getUserIdFromSession } from '../firebase/server';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getUserId() {
    const sessionCookie = cookies().get('session')?.value;
    return await getUserIdFromSession(sessionCookie);
}

export async function createChatroom(name: string) {
  const userId = await getUserId();
  if (!userId) return { error: 'User not authenticated.' };
  
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 120);

  try {
    const newRoom = await addDoc(collection(db, 'chatrooms'), {
      name,
      creatorId: userId,
      members: [userId],
      code: generateCode(),
      createdAt: serverTimestamp(),
      expiresAt: expirationDate,
    });
    revalidatePath('/dashboard');
    return { id: newRoom.id };
  } catch (error) {
    return { error: 'Could not create chatroom.' };
  }
}

export async function joinChatroom(code: string) {
  const userId = await getUserId();
  if (!userId) return { error: 'User not authenticated.' };

  const q = query(collection(db, 'chatrooms'), where('code', '==', code));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return { error: 'Invalid room code.' };
  }

  const roomDoc = querySnapshot.docs[0];
  const roomData = roomDoc.data();

  if (roomData.expiresAt.toDate() < new Date()) {
    return { error: 'This chatroom has expired.' };
  }

  if (roomData.members.length >= 7) {
    return { error: 'This chatroom is full.' };
  }

  if (roomData.members.includes(userId)) {
     return { id: roomDoc.id }; // Already a member
  }

  await updateDoc(doc(db, 'chatrooms', roomDoc.id), {
    members: arrayUnion(userId),
  });

  revalidatePath('/dashboard');
  return { id: roomDoc.id };
}

export async function sendMessage(chatroomId: string, message: { text: string; type: 'text' | 'image'; imageUrl?: string; }) {
  const userId = await getUserId();
  const user = (await getDoc(doc(db, 'users', userId!))).data(); // This is a simplification. A proper user profile fetch would be better.
  if (!userId) return { error: 'User not authenticated.' };

  if (!message.text && message.type === 'text') {
    return { error: 'Message cannot be empty.' };
  }

  try {
    await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), {
      ...message,
      senderId: userId,
      senderName: user?.displayName || 'Anonymous', // Fallback name
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to send message.' };
  }
}

export async function deleteChatroom(chatroomId: string) {
    const userId = await getUserId();
    if (!userId) return { error: 'User not authenticated.' };

    const roomRef = doc(db, 'chatrooms', chatroomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists() || roomSnap.data().creatorId !== userId) {
        return { error: 'Unauthorized or room not found.' };
    }

    try {
        // Delete all messages in subcollection
        const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        const batch = writeBatch(db);
        messagesSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        // Delete the chatroom document itself
        await deleteDoc(roomRef);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {