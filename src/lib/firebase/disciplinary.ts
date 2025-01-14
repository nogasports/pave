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

export interface DisciplinaryCase {
  id?: string;
  caseNumber: string;
  reportedBy: string;
  defendantId: string;
  plaintiffId?: string;
  type: 'Misconduct' | 'Performance' | 'Attendance' | 'Other';
  description: string;
  evidence?: string[];
  status: 'Reported' | 'Investigation' | 'Hearing' | 'Decision' | 'Appeal' | 'Closed';
  severity: 'Minor' | 'Moderate' | 'Major';
  investigationFindings?: string;
  defendantStatement?: string;
  plaintiffStatement?: string;
  witnesses?: string[];
  decision?: {
    action: 'Warning' | 'Suspension' | 'Termination' | 'Other';
    details: string;
    date: Date;
    by: string;
  };
  appeal?: {
    filed: boolean;
    date?: Date;
    reason?: string;
    status?: 'Pending' | 'Approved' | 'Rejected';
    decision?: string;
  };
  nextAction?: string;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'disciplinaryCases';

export const getDisciplinaryCases = async (employeeId?: string) => {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (employeeId) {
      q = query(q, where('defendantId', '==', employeeId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      decision: doc.data().decision ? {
        ...doc.data().decision,
        date: doc.data().decision.date?.toDate()
      } : undefined,
      appeal: doc.data().appeal ? {
        ...doc.data().appeal,
        date: doc.data().appeal.date?.toDate()
      } : undefined,
      dueDate: doc.data().dueDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as DisciplinaryCase[];
  } catch (error) {
    console.error('Error fetching disciplinary cases:', error);
    throw error;
  }
};

export const addDisciplinaryCase = async (caseData: Omit<DisciplinaryCase, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Generate case number
    const snapshot = await getDocs(collection(db, COLLECTION));
    const caseNumber = `DC${(snapshot.size + 1).toString().padStart(4, '0')}`;

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...caseData,
      caseNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding disciplinary case:', error);
    throw error;
  }
};

export const updateDisciplinaryCase = async (id: string, caseData: Partial<DisciplinaryCase>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...caseData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating disciplinary case:', error);
    throw error;
  }
};