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

export interface LeaveType {
  id?: string;
  name: string;
  daysPerYear: number;
  description: string;
  carryForward: boolean;
  maxCarryForwardDays?: number;
  minServiceDays?: number;
  proRated: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'leaveTypes';

export const getLeaveTypes = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as LeaveType[];
  } catch (error) {
    console.error('Error fetching leave types:', error);
    throw error;
  }
};

export const addLeaveType = async (leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...leaveType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding leave type:', error);
    throw error;
  }
};

export const updateLeaveType = async (id: string, leaveType: Partial<LeaveType>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...leaveType,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating leave type:', error);
    throw error;
  }
};

export const deleteLeaveType = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting leave type:', error);
    throw error;
  }
};