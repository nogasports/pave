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
import { wrapFirebaseOperation } from '../utils/errorHandling';

export interface OnboardingTask {
  id?: string;
  title: string;
  description: string;
  category: 'documentation' | 'setup' | 'training' | 'introduction' | 'other';
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface OnboardingProcess {
  id?: string;
  employeeId: string;
  startDate: Date;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  tasks: OnboardingTask[];
  type: 'onboarding' | 'offboarding';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'onboardingProcesses';

// Cache onboarding processes
let processesCache: {
  data: OnboardingProcess[];
  timestamp: number;
  type?: string;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getOnboardingProcesses = async (filters?: {
  employeeId?: string;
  type?: 'onboarding' | 'offboarding';
  status?: OnboardingProcess['status'];
}) => {
  return wrapFirebaseOperation(async () => {
    // Check cache first
    if (processesCache && 
        Date.now() - processesCache.timestamp < CACHE_DURATION &&
        processesCache.type === filters?.type) {
      let filtered = processesCache.data;
      
      if (filters?.employeeId) {
        filtered = filtered.filter(p => p.employeeId === filters.employeeId);
      }
      if (filters?.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      
      return filtered;
    }

    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (filters?.employeeId) {
      q = query(q, where('employeeId', '==', filters.employeeId));
    }
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const snapshot = await getDocs(q);
    const processes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      targetDate: doc.data().targetDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      tasks: doc.data().tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate?.toDate(),
        completedAt: task.completedAt?.toDate(),
      }))
    })) as OnboardingProcess[];

    // Update cache
    processesCache = {
      data: processes,
      timestamp: Date.now(),
      type: filters?.type
    };

    return processes;
  }, 'Error fetching onboarding processes');
};

export const addOnboardingProcess = async (process: Omit<OnboardingProcess, 'id' | 'createdAt' | 'updatedAt'>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...process,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }, 'Error adding onboarding process');
};

export const updateOnboardingProcess = async (id: string, process: Partial<OnboardingProcess>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...process,
      updatedAt: serverTimestamp(),
    });
  }, 'Error updating onboarding process');
};

export const updateOnboardingTask = async (processId: string, taskId: string, task: Partial<OnboardingTask>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = doc(db, COLLECTION, processId);
    const process = (await getDocs(query(collection(db, COLLECTION)))).docs
      .find(d => d.id === processId)?.data() as OnboardingProcess;
    
    if (!process) throw new Error('Process not found');
    
    const updatedTasks = process.tasks.map(t => 
      t.id === taskId ? { ...t, ...task } : t
    );
    
    await updateDoc(docRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp(),
    });
  }, 'Error updating onboarding task');
};