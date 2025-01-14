import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { wrapFirebaseOperation } from '../utils/errorHandling';

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
  read: boolean;
  readBy: string[];
  senderName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRoom {
  id?: string;
  type: 'direct' | 'department' | 'announcement' | 'ticket';
  participants: string[];
  departmentId?: string;
  title?: string;
  status?: 'open' | 'closed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'general' | 'technical' | 'billing' | 'other';
  ticketNumber?: string;
  assignedTo?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to generate ticket number
const generateTicketNumber = async () => {
  const q = query(collection(db, ROOMS_COLLECTION), 
    where('type', '==', 'ticket'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  const lastTicket = snapshot.docs[0]?.data();
  const lastNumber = lastTicket?.ticketNumber 
    ? parseInt(lastTicket.ticketNumber.split('-')[1])
    : 0;
  return `TKT-${(lastNumber + 1).toString().padStart(5, '0')}`;
};
const MESSAGES_COLLECTION = 'chatMessages';
const ROOMS_COLLECTION = 'chatRooms';

// Chat Rooms
export const getChatRooms = async (userId: string) => {
  return wrapFirebaseOperation(async () => {
    let q;
    const userRole = localStorage.getItem('userRole');

    // Different queries based on user role
    if (userRole === 'admin' || userRole === 'super_admin') {
      q = query(
        collection(db, ROOMS_COLLECTION),
        where('type', '==', 'ticket'),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, ROOMS_COLLECTION),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessage: doc.data().lastMessage ? {
        ...doc.data().lastMessage,
        timestamp: doc.data().lastMessage.timestamp?.toDate()
      } : undefined,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ChatRoom[];
  }, 'Error fetching chat rooms');
};

export const createChatRoom = async (room: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const ticketNumber = room.type === 'ticket' ? await generateTicketNumber() : undefined;
    const status = room.type === 'ticket' ? 'open' : undefined;
    const priority = room.type === 'ticket' ? 'normal' : undefined;

    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
      ...room,
      ticketNumber,
      status,
      priority,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

export const updateRoom = async (roomId: string, updates: Partial<ChatRoom>) => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating chat room:', error);
    throw error;
  }
};

// Messages
export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...message,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update room's last message
    const roomRef = doc(db, ROOMS_COLLECTION, message.roomId);
    await updateDoc(roomRef, {
      lastMessage: {
        content: message.content,
        senderId: message.senderId,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ChatMessage[];
    callback(messages);
  });
};

export const subscribeToRooms = (userId: string, callback: (rooms: ChatRoom[]) => void) => {
  let q;
  
  // Different queries for support staff vs regular users
  if (userId === 'support') {
    q = query(
      collection(db, ROOMS_COLLECTION),
      where('type', '==', 'ticket'),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, ROOMS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessage: doc.data().lastMessage ? {
        ...doc.data().lastMessage,
        timestamp: doc.data().lastMessage.timestamp?.toDate()
      } : undefined,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ChatRoom[];
    callback(rooms);
  });
};