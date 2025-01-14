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

export interface Company {
  id?: string;
  name: string;
  registrationNumber: string;
  logo?: string;
  type: 'parent' | 'subsidiary';
  parentId?: string;
  industry: string;
  foundedYear: number;
  description?: string;
  website?: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'companies';

export const getCompanies = async () => {
  return wrapFirebaseOperation(async () => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Company[];
  }, 'Error fetching companies');
};

export const addCompany = async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...company,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }, 'Error adding company');
};

export const updateCompany = async (id: string, company: Partial<Company>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...company,
      updatedAt: serverTimestamp(),
    });
  }, 'Error updating company');
};

export const deleteCompany = async (id: string) => {
  return wrapFirebaseOperation(async () => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, 'Error deleting company');
};