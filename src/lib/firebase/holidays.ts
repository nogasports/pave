import { 
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export interface Holiday {
  id?: string;
  name: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'holidays';

export const getHolidays = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Holiday[];
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

export const addHoliday = async (holiday: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...holiday,
      date: Timestamp.fromDate(new Date(holiday.date)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding holiday:', error);
    throw error;
  }
};