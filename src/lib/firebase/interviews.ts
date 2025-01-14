import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { wrapFirebaseOperation } from '../utils/errorHandling';

export interface InterviewQuestion {
  id?: string;
  question: string;
  category: string;
  type: 'technical' | 'behavioral' | 'cultural';
  expectedAnswer?: string;
  maxScore: number;
}

export interface InterviewType {
  id?: string;
  name: string;
  description: string;
  duration: number;
  questions: InterviewQuestion[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'interviewTypes';

export const getInterviewTypes = async () => {
  return wrapFirebaseOperation(async () => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as InterviewType[];
  }, 'Error fetching interview types');
};

export const addInterviewType = async (type: Omit<InterviewType, 'id' | 'createdAt' | 'updatedAt'>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }, 'Error adding interview type');
};

export const updateInterviewType = async (id: string, type: Partial<InterviewType>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...type,
      updatedAt: serverTimestamp(),
    });
  }, 'Error updating interview type');
};

export const deleteInterviewType = async (id: string) => {
  return wrapFirebaseOperation(async () => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, 'Error deleting interview type');
};