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

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Training {
  id?: string;
  title: string;
  description: string;
  type: 'In-Person' | 'Online';
  departmentId?: string; // Optional - if null, available to all
  startDate?: Date;
  endDate?: Date;
  location?: string;
  instructor?: string;
  maxParticipants?: number;
  duration?: number; // in hours
  content?: {
    pdfData?: string; // base64 encoded PDF for online courses
    questions?: AssessmentQuestion[];
  };
  passingScore: number;
  status: 'Draft' | 'Active' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'trainings';

export const getTrainings = async (departmentId?: string) => {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (departmentId) {
      q = query(q, where('departmentId', '==', departmentId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Training[];
  } catch (error) {
    console.error('Error fetching trainings:', error);
    throw error;
  }
};

export const addTraining = async (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Clean up the data before saving
    const cleanData = {
      ...training,
      content: {
        pdfData: training.content?.pdfData || null,
        questions: training.content?.questions || []
      }
    };

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding training:', error);
    throw error;
  }
};

export const updateTraining = async (id: string, training: Partial<Training>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...training,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating training:', error);
    throw error;
  }
};

export const deleteTraining = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting training:', error);
    throw error;
  }
};