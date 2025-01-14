import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export interface SupportTicket {
  id?: string;
  title: string;
  description: string;
  category: 'technical' | 'hr' | 'assets' | 'payroll' | 'benefits';
  type: 'hardware' | 'software' | 'network' | 'access' | 'payroll' | 'benefits' | 'workplace' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  submittedBy: string;
  assignedTo?: string;
  departmentId?: string;
  assetId?: string;
  hrRequestType?: 'payroll' | 'benefits' | 'leave' | 'workplace' | 'other';
  hrDocuments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];
  attachments?: string[];
  chatEnabled: boolean;
  lastMessageAt?: Date;
  unreadCount?: number;
  feedback?: {
    rating?: number;
    comment?: string;
    givenAt?: Date;
  };
  messages: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    attachments?: string[];
    read: boolean;
    readBy: string[];
  }[];
  history: {
    action: string;
    timestamp: Date;
    userId: string;
    comment?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

const COLLECTION = 'supportTickets';

export const getTickets = async (filters?: {
  userId?: string;
  departmentId?: string;
  status?: SupportTicket['status'];
}) => {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (filters?.userId) {
      q = query(q, where('submittedBy', '==', filters.userId));
    }
    
    if (filters?.departmentId) {
      q = query(q, where('departmentId', '==', filters.departmentId));
    }
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
      closedAt: doc.data().closedAt?.toDate(),
      messages: doc.data().messages?.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate()
      })),
      history: doc.data().history?.map((entry: any) => ({
        ...entry,
        timestamp: entry.timestamp?.toDate()
      }))
    })) as SupportTicket[];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

export const addTicket = async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Validate required fields
    if (!ticket.title || !ticket.description || !ticket.submittedBy || !ticket.category || !ticket.type) {
      throw new Error('Missing required fields for support ticket');
    }

    // Clean up the data
    const cleanData = {
      ...ticket,
      category: ticket.category || 'technical',
      type: ticket.type || 'other',
      priority: ticket.priority || 'medium',
      status: 'open',
      messages: ticket.messages || [],
      history: ticket.history || [{
        action: 'created',
        timestamp: new Date(),
        userId: ticket.submittedBy,
      }],
      attachments: ticket.attachments || [],
      feedback: ticket.feedback || null,
      chatEnabled: true,
      unreadCount: 0,
    };

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding ticket:', error);
    throw error;
  }
};

export const updateTicket = async (id: string, updates: Partial<SupportTicket>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

export const addMessage = async (ticketId: string, message: {
  content: string;
  senderId: string;
  attachments?: string[];
}) => {
  try {
    const docRef = doc(db, COLLECTION, ticketId);
    await updateDoc(docRef, {
      messages: arrayUnion({
        id: Date.now().toString(),
        ...message,
        timestamp: serverTimestamp(),
      }),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};