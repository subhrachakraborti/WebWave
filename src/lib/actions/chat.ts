
'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '../firebase/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client setup - uses environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    // User can be authenticated or null
    const user = await getAuthenticatedUser();
    
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 120);

    const roomCode = generateCode();

    const { data: roomData, error: roomError } = await supabase
      .from('chatrooms')
      .insert({
        name,
        // Use user's UID if they are logged in, otherwise use a placeholder or null
        creator_id: user ? user.uid : 'anonymous',
        code: roomCode,
        expires_at: expirationDate.toISOString(),
      })
      .select('id')
      .single();

    if (roomError || !roomData) {
      console.error('Error creating chatroom in Supabase:', roomError);
      return { error: 'Could not create chatroom due to a database error.' };
    }

    // If the user is logged in, add them as a member
    if (user) {
      const { error: memberError } = await supabase
        .from('chatroom_members')
        .insert({
          chatroom_id: roomData.id,
          user_id: user.uid,
        });

      if (memberError) {
        console.error('Error adding member to chatroom:', memberError);
        // Not a fatal error, the room is still created
      }
    }

    revalidatePath('/dashboard');
    return { id: roomData.id };
  } catch (error) {
    console.error('Error in createChatroom:', error);
    return { error: 'Could not create chatroom due to a server error.' };
  }
}

export async function joinChatroom(code: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: 'You must be logged in to join a room.' };
    }

    const { data: roomData, error: roomError } = await supabase
      .from('chatrooms')
      .select('id, expires_at')
      .eq('code', code)
      .single();

    if (roomError || !roomData) {
      return { error: 'Invalid room code.' };
    }
    
    if (new Date(roomData.expires_at) < new Date()) {
      return { error: 'This chatroom has expired.' };
    }

    const { data: members, error: membersError } = await supabase
        .from('chatroom_members')
        .select('user_id', { count: 'exact' })
        .eq('chatroom_id', roomData.id);

    if (membersError) {
        return { error: 'Could not verify room members.' };
    }

    if (members.length >= 7) {
        return { error: 'This chatroom is full.' };
    }

    const isAlreadyMember = members.some(m => m.user_id === user.uid);
    if (isAlreadyMember) {
        return { id: roomData.id }; // Already a member
    }

    const { error: insertError } = await supabase
        .from('chatroom_members')
        .insert({ chatroom_id: roomData.id, user_id: user.uid });
        
    if (insertError) {
        return { error: 'Could not join chatroom due to a database error.' };
    }

    revalidatePath('/dashboard');
    return { id: roomData.id };
  } catch (error) {
    console.error('Error in joinChatroom:', error);
    return { error: 'Could not join chatroom due to a server error.' };
  }
}

export async function sendMessage(chatroomId: string, message: { text: string; type: 'text' | 'image'; imageUrl?: string; }) {
  try {
    const user = await getAuthenticatedUser();
    
    if (message.type === 'text' && !message.text.trim()) {
      return { error: 'Message cannot be empty.' };
    }

    const { error } = await supabase
        .from('messages')
        .insert({
            chatroom_id: chatroomId,
            sender_id: user ? user.uid : 'anonymous',
            sender_name: user ? (user.name || 'Anonymous User') : 'Anonymous',
            text: message.text,
            image_url: message.imageUrl,
            type: message.type,
        });

    if (error) {
        console.error('Supabase send message error:', error);
        return { error: 'Failed to send message due to a database error.' };
    }

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

        const { data: room, error: fetchError } = await supabase
            .from('chatrooms')
            .select('creator_id')
            .eq('id', chatroomId)
            .single();

        if (fetchError || !room) {
            return { error: 'Room not found.' };
        }
        
        if (room.creator_id !== user.uid) {
            return { error: 'Only the creator can delete this room.' };
        }
        
        // Supabase is configured with ON DELETE CASCADE, so deleting the chatroom
        // will automatically delete associated members and messages.
        const { error: deleteError } = await supabase
            .from('chatrooms')
            .delete()
            .eq('id', chatroomId);

        if(deleteError) {
            console.error('Supabase delete error:', deleteError);
            return { error: 'Could not delete chatroom due to a database error.' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
      console.error('Error in deleteChatroom:', error);
      return { error: 'Could not delete chatroom due to a server error.' };
    }
}
