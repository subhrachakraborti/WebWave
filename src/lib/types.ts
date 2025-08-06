import { Timestamp } from 'firebase/firestore';

export interface Chatroom {
  id: string;
  name: string;
  creatorId: string;
  members: string[];
  code: string;
  createdAt: Timestamp;
  expiresAt: Date;
}

export interface Message {
  id: string;
  text: string;
  type: 'text' | 'image';
  imageUrl?: string;
  senderId: string;
  senderName: string;
  timestamp: Date | null;
}
