import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

export interface Department {
  id?: string;
  departmentId: string;
  name: string;
  head: string;
  employees: number;
  openPositions: number;
  budget: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'departments';

export const getDepartments = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Department[];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const addDepartment = async (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Generate a unique department ID (e.g., DEP001, DEP002, etc.)
    const snapshot = await getDocs(collection(db, COLLECTION));
    const nextNumber = snapshot.size + 1;
    const departmentId = `DEP${nextNumber.toString().padStart(3, '0')}`;

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...department,
      departmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (id: string, department: Partial<Department>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...department,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};