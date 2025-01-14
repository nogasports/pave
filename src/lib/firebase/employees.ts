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

export interface Employee {
  id?: string;
  employeeId: string;
  // Personal Details
  title: string;
  firstName: string;
  fatherName: string;
  lastName: string;
  photo?: string;
  dateOfBirth?: Date;
  gender: 'Male' | 'Female';
  address?: {
    city: string;
    woreda: string;
    houseNumber: string;
  };
  education?: {
    level: string;
    fieldOfStudy: string;
  };
  dependents?: {
    spouse?: {
      name: string;
      phone: string;
    };
    children?: {
      name: string;
      dateOfBirth: Date;
    }[];
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  externalExperience?: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];

  // Employment Details
  jobTitle: string;
  departmentId: string;
  managerId?: string;
  position: 'Employee' | 'Manager';
  jobGrade: string;
  section?: string;
  employmentType: 'Permanent' | 'Contract';
  contractEndDate?: Date;

  // Work Details
  staffId: string;
  officeLocation: string;
  workPhone: string;
  workEmail: string;

  // Compensation
  salaryCurrency: 'ETB' | 'USD';
  payFrequency: 'Monthly' | 'Bi-weekly' | 'Weekly';
  salary: number;
  transportAllowance: number;
  housingAllowance: number;
  positionAllowance: number;

  // Time
  dateJoined?: Date;
  dateLeft?: Date;
  yearsOfExperience: number;

  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'employees';

export const getEmployees = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateOfBirth: doc.data().dateOfBirth?.toDate(),
      dateJoined: doc.data().dateJoined?.toDate(),
      dateLeft: doc.data().dateLeft?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Employee[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const findEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  try {
    if (!email) {
      console.log('No email provided to findEmployeeByEmail');
      return null;
    }

    const q = query(
      collection(db, COLLECTION), 
      where('workEmail', '==', email.toLowerCase())
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('No employee found for email:', email);
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      dateJoined: data.dateJoined?.toDate?.() || null,
      dateLeft: data.dateLeft?.toDate?.() || null,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Employee;
  } catch (error) {
    console.error('Error finding employee by email:', error);
    throw error;
  }
};

export const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Generate employee ID if not provided
    if (!employee.employeeId) {
      const snapshot = await getDocs(collection(db, COLLECTION));
      const nextNumber = snapshot.size + 1;
      employee.employeeId = `EMP${nextNumber.toString().padStart(4, '0')}`;
    }

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...employee,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, employee: Partial<Employee>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...employee,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};