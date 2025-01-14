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
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

export interface Notification {
  id?: string;
  type: 'system' | 'chat' | 'approval' | 'task' | 'reminder';
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  read: boolean;
  actionType?: 'leave' | 'advance' | 'reimbursement' | 'promotion' | 'review' | 'document';
  actionId?: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'notifications';

export const getNotifications = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...notification,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

export const markAsRead = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      read: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        updatedAt: serverTimestamp(),
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, COLLECTION),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Notification[];
    callback(notifications);
  });
};

// Helper function to create system notifications
export const createSystemNotification = async (
  recipientId: string,
  title: string,
  message: string,
  actionType?: Notification['actionType'],
  actionId?: string,
  link?: string
) => {
  return addNotification({
    type: 'system',
    title,
    message,
    recipientId,
    read: false,
    actionType,
    actionId,
    link,
  });
};