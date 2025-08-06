
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
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: 'You must be logged in to create a chatroom.' };
  }
  
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 120);

  try {
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
    console.error(error);
    return { error: 'Could not create chatroom.' };
  }
}

export async function joinChatroom(code: string) {
   const user = await getAuthenticatedUser();
   if (!user) {
     return { error: 'You must be logged in to join a chatroom.' };
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
}

export async function sendMessage(chatroomId: string, message: { text: string; type: 'text' | 'image'; imageUrl?: string; }) {
   const user = await getAuthenticatedUser();
   if (!user) {
     return { error: 'You must be logged in to send a message.' };
   }

  if (!message.text && message.type === 'text') {
    return { error: 'Message cannot be empty.' };
  }

  try {
    await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), {
      ...message,
      senderId: user.uid,
      senderName: user.name || 'Anonymous',
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to send message.' };
  }
}

export async function deleteChatroom(chatroomId: string) {
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

    try {
        const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        const batch = writeBatch(db);
        messagesSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        await deleteDoc(roomRef);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
      console.error(error);
      return { error: 'Could not delete chatroom.' };
    }
}
