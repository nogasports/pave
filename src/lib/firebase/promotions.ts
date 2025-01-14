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

export interface PromotionRequest {
  id?: string;
  employeeId: string;
  departmentId: string;
  currentPosition: string;
  proposedPosition: string;
  reviewCycleId: string;
  reviewScore?: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: Date;
  effectiveDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'promotionRequests';

export const getPromotionRequests = async (departmentId?: string) => {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (departmentId) {
      q = query(q, where('departmentId', '==', departmentId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      approvedAt: doc.data().approvedAt?.toDate(),
      effectiveDate: doc.data().effectiveDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PromotionRequest[];
  } catch (error) {
    console.error('Error fetching promotion requests:', error);
    throw error;
  }
};

export const addPromotionRequest = async (request: Omit<PromotionRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding promotion request:', error);
    throw error;
  }
};

export const updatePromotionRequest = async (id: string, request: Partial<PromotionRequest>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...request,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating promotion request:', error);
    throw error;
  }
};