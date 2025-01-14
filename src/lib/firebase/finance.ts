import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  where,
  getDoc,
  setDoc,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { wrapFirebaseOperation } from '../utils/errorHandling';

// Payroll Types
export interface PayrollRecord {
  id?: string;
  employeeId: string;
  month: string; // Format: YYYY-MM
  baseSalary: number;
  allowances: {
    transport: number;
    housing: number;
    position: number;
  };
  deductions: {
    tax: number;
    pension: number;
    other: number;
  };
  overtime?: {
    hours: number;
    rate: number;
    amount: number;
  };
  netSalary: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Paid';
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Salary Advance Types
export interface SalaryAdvance {
  id?: string;
  employeeId: string;
  amount: number;
  reason: string;
  requestDate: Date;
  repaymentDate: Date;
  installments: number;
  monthlyDeduction: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Medical Reimbursement Types
export interface MedicalReimbursement {
  id?: string;
  employeeId: string;
  expenseDate: Date;
  amount: number;
  description: string;
  receiptUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Finance Settings Types
export interface FinanceSettings {
  id?: string;
  taxBrackets: {
    from: number;
    to: number;
    rate: number;
  }[];
  pensionRate: number;
  employerPensionRate: number;
  maxAdvanceAmount: number;
  maxAdvanceInstallments: number;
  maxMedicalReimbursement: number;
  allowances: {
    transport: {
      default: number;
      managerBonus: number;
    };
    housing: {
      default: number;
      managerBonus: number;  
    };
    position: {
      default: number;
      managerBonus: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payroll Management
const PAYROLL_COLLECTION = 'payroll';

export const getPayrollRecords = async (month?: string, employeeId?: string) => {
  try {
    let q = collection(db, PAYROLL_COLLECTION);
    
    const conditions = [];

    if (month) {
      conditions.push(where('month', '==', month));
    }
    
    if (employeeId) {
      conditions.push(where('employeeId', '==', employeeId));
    }

    conditions.push(orderBy('createdAt', 'desc'));
    q = query(q, ...conditions);
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PayrollRecord[];
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    throw error;
  }
};

export const addPayrollRecord = async (record: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, PAYROLL_COLLECTION), {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding payroll record:', error);
    throw error;
  }
};

export const updatePayrollRecord = async (id: string, record: Partial<PayrollRecord>) => {
  try {
    const docRef = doc(db, PAYROLL_COLLECTION, id);
    await updateDoc(docRef, {
      ...record,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating payroll record:', error);
    throw error;
  }
};

export const deletePayrollRecord = async (id: string) => {
  try {
    await deleteDoc(doc(db, PAYROLL_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting payroll record:', error);
    throw error;
  }
};

// Salary Advance Management
const SALARY_ADVANCE_COLLECTION = 'salaryAdvances';

export const getSalaryAdvances = async (employeeId?: string) => {
  try {
    let q = collection(db, SALARY_ADVANCE_COLLECTION);
    const conditions = [];
    
    if (employeeId) {
      conditions.push(where('employeeId', '==', employeeId));
    }

    conditions.push(orderBy('createdAt', 'desc'));
    q = query(q, ...conditions);
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      requestDate: doc.data().requestDate?.toDate(),
      repaymentDate: doc.data().repaymentDate?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as SalaryAdvance[];
  } catch (error) {
    console.error('Error fetching salary advances:', error);
    throw error;
  }
};

export const addSalaryAdvance = async (advance: Omit<SalaryAdvance, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, SALARY_ADVANCE_COLLECTION), {
      ...advance,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding salary advance:', error);
    throw error;
  }
};

export const updateSalaryAdvance = async (id: string, advance: Partial<SalaryAdvance>) => {
  try {
    const docRef = doc(db, SALARY_ADVANCE_COLLECTION, id);
    await updateDoc(docRef, {
      ...advance,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating salary advance:', error);
    throw error;
  }
};

export const deleteSalaryAdvance = async (id: string) => {
  try {
    await deleteDoc(doc(db, SALARY_ADVANCE_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting salary advance:', error);
    throw error;
  }
};

// Medical Reimbursement Management
const MEDICAL_REIMBURSEMENT_COLLECTION = 'medicalReimbursements';

export const getMedicalReimbursements = async (employeeId?: string) => {
  try {
    let q = collection(db, MEDICAL_REIMBURSEMENT_COLLECTION);
    const conditions = [];
    
    if (employeeId) {
      conditions.push(where('employeeId', '==', employeeId));
    }

    conditions.push(orderBy('createdAt', 'desc'));
    q = query(q, ...conditions);
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expenseDate: doc.data().expenseDate?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MedicalReimbursement[];
  } catch (error) {
    console.error('Error fetching medical reimbursements:', error);
    throw error;
  }
};

export const addMedicalReimbursement = async (reimbursement: Omit<MedicalReimbursement, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, MEDICAL_REIMBURSEMENT_COLLECTION), {
      ...reimbursement,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding medical reimbursement:', error);
    throw error;
  }
};

export const updateMedicalReimbursement = async (id: string, reimbursement: Partial<MedicalReimbursement>) => {
  try {
    const docRef = doc(db, MEDICAL_REIMBURSEMENT_COLLECTION, id);
    await updateDoc(docRef, {
      ...reimbursement,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating medical reimbursement:', error);
    throw error;
  }
};

const SETTINGS_COLLECTION = 'financeSettings';

export const getFinanceSettings = async () => {
  return wrapFirebaseOperation(async () => {
    const q = query(
      collection(db, SETTINGS_COLLECTION),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Create default settings if none exist
      const defaultSettings: Omit<FinanceSettings, 'id' | 'createdAt' | 'updatedAt'> = {
        taxBrackets: [
          { from: 0, to: 600, rate: 0 },
          { from: 601, to: 1650, rate: 10 },
          { from: 1651, to: 3200, rate: 15 },
          { from: 3201, to: 5250, rate: 20 },
          { from: 5251, to: 7800, rate: 25 },
          { from: 7801, to: 10900, rate: 30 },
          { from: 10901, to: Infinity, rate: 35 },
        ],
        pensionRate: 7,
        employerPensionRate: 11,
        maxAdvanceAmount: 50000,
        maxAdvanceInstallments: 12,
        maxMedicalReimbursement: 10000,
        allowances: {
          transport: {
            default: 2000,
            managerBonus: 1000
          },
          housing: {
            default: 3000,
            managerBonus: 2000
          },
          position: {
            default: 1000,
            managerBonus: 1500
          }
        }
      };
      
      const docRef = await addDoc(collection(db, SETTINGS_COLLECTION), {
        ...defaultSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as FinanceSettings;
  }, 'Error fetching finance settings');
};

export const updateFinanceSettings = async (id: string, settings: Partial<FinanceSettings>) => {
  return wrapFirebaseOperation(async () => {
    const docRef = doc(db, SETTINGS_COLLECTION, id);
    await updateDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  }, 'Error updating finance settings');
};

// Initialize collections
export const initializeFinanceCollections = async () => {
  try {
    // Create collections if they don't exist
    const collections = [
      'payroll',
      'salaryAdvances',
      'medicalReimbursements',
      'financeSettings'
    ];

    for (const collectionName of collections) {
      const dummyDoc = doc(collection(db, collectionName), '_dummy');
      await setDoc(dummyDoc, { initialized: true }, { merge: true });
      await deleteDoc(dummyDoc);
    }

    // Create default finance settings
    const settingsRef = doc(collection(db, 'financeSettings'), 'default');
    await setDoc(settingsRef, {
      taxBrackets: [
        { from: 0, to: 600, rate: 0 },
        { from: 601, to: 1650, rate: 10 },
        { from: 1651, to: 3200, rate: 15 },
        { from: 3201, to: 5250, rate: 20 },
        { from: 5251, to: 7800, rate: 25 },
        { from: 7801, to: 10900, rate: 30 },
        { from: 10901, to: Infinity, rate: 35 },
      ],
      pensionRate: 7,
      maxAdvanceAmount: 50000,
      maxAdvanceInstallments: 12,
      maxMedicalReimbursement: 10000,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error initializing finance collections:', error);
    throw error;
  }
};