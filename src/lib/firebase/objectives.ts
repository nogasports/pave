import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export interface Objective {
  id?: string;
  title: string;
  description: string;
  keyResults: KeyResult[];
  type: 'Department' | 'Employee';
  assigneeId: string; // Department ID or Employee ID
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
  startDate: Date;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  priority: 'Low' | 'Medium' | 'High';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  weight: number; // Percentage weight of this KR in the objective
  status: 'Not Started' | 'In Progress' | 'Completed';
}

const COLLECTION = 'objectives';

export const getObjectives = async (assigneeId?: string) => {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (assigneeId) {
      q = query(q, where('assigneeId', '==', assigneeId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Objective[];
  } catch (error) {
    console.error('Error fetching objectives:', error);
    throw error;
  }
};

export const addObjective = async (objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...objective,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding objective:', error);
    throw error;
  }
};

export const updateObjective = async (id: string, objective: Partial<Objective>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...objective,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating objective:', error);
    throw error;
  }
};

export const deleteObjective = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting objective:', error);
    throw error;
  }
};