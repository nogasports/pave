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
import { wrapFirebaseOperation } from '../utils/errorHandling';

export interface Document {
  id?: string;
  title: string;
  type: 'policy' | 'procedure' | 'form' | 'contract' | 'employee' | 'other';
  category: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  departmentId?: string;
  employeeId?: string;
  tags: string[];
  status: 'active' | 'archived' | 'draft';
  version: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'documents';

export const getDocuments = async (filters?: {
  type?: Document['type'];
  departmentId?: string;
  employeeId?: string;
  status?: Document['status'];
}) => {
  return wrapFirebaseOperation(async () => {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters?.departmentId) {
      q = query(q, where('departmentId', '==', filters.departmentId));
    }
    if (filters?.employeeId) {
      q = query(q, where('employeeId', '==', filters.employeeId));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Document[];
  }, 'Error fetching documents');
};

export const addDocument = async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...document,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const updateDocument = async (id: string, document: Partial<Document>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...document,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};