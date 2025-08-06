
'use server';

import { db } from '@/lib/firebase/server';
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
import { getAuthenticatedUser } from '../firebase/server';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createChatroom(name: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: 'Authentication failed. Please log in again.' };
    }
    
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 120);

    const newRoom = await addDoc(collection(db, 'chatrooms'), {
      name,
      creatorId: user.uid,
      members: [user.uid],
      code: generateCode(),
      createdAt: serverTimestamp(),
      expiresAt: expirationDate,
    });
    revalidatePath('/dashboard');
    return { id: newRoom.id };
  } catch (error) {
    console.error('Error in createChatroom:', error);
    return { error: 'Could not create chatroom due to a server error.' };
  }
}

export async function joinChatroom(code: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: 'Authentication failed. Please log in again.' };
    }

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

    if (roomData.members.includes(user.uid)) {
      return { id: roomDoc.id }; // Already a member
    }

    await updateDoc(doc(db, 'chatrooms', roomDoc.id), {
      members: arrayUnion(user.uid),
    });

    revalidatePath('/dashboard');
    return { id: roomDoc.id };
  } catch (error) {
    console.error('Error in joinChatroom:', error);
    return { error: 'Could not join chatroom due to a server error.' };
  }
}

export async function sendMessage(chatroomId: string, message: { text: string; type: 'text' | 'image'; imageUrl?: string; }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: 'Authentication failed. Please log in again.' };
    }

    if (!message.text && message.type === 'text') {
      return { error: 'Message cannot be empty.' };
    }

    await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), {
      ...message,
      senderId: user.uid,
      senderName: user.name || 'Anonymous',
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { error: 'Failed to send message due to a server error.' };
  }
}

export async function deleteChatroom(chatroomId: string) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return { error: 'Authentication required.' };
        }

        const roomRef = doc(db, 'chatrooms', chatroomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
            return { error: 'Room not found.' };
        }

        if (roomSnap.data().creatorId !== user.uid) {
            return { error: 'Only the creator can delete this room.' };
        }

        const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        const batch = writeBatch(db);
        messagesSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        await deleteDoc(roomRef);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
      console.error('Error in deleteChatroom:', error);
      return { error: 'Could not delete chatroom due to a server error.' };
    }
}
