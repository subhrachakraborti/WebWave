
export interface Chatroom {
  id: string;
  name: string;
  creator_id: string;
  code: string;
  created_at: string; // ISO 8601 date string
  expires_at: string; // ISO 8601 date string
  chatroom_members?: { user_id: string }[];
}

export interface Message {
  id: string;
  chatroom_id: string;
  sender_id: string;
  sender_name: string;
  text: string | null;
  image_url: string | null;
  type: 'text' | 'image';
  created_at: string; // ISO 8601 date string
}
