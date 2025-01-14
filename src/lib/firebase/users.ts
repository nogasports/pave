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
import { createUser, signIn, AppError } from './auth';
import { wrapFirebaseOperation } from '../utils/errorHandling';

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'employee';
  permissions: string[];
  active: boolean;
  employeeId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const ADMIN_PERMISSIONS = [
  'manage_employees',
  'manage_departments',
  'manage_recruitment',
  'manage_finance',
  'manage_assets',
  'view_reports',
  'manage_users',
  'manage_settings'
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

const COLLECTION = 'adminUsers';

export const getAdminUsers = async () => {
  return wrapFirebaseOperation(async () => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastLogin: doc.data().lastLogin?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AdminUser[];
  }, 'Error fetching admin users');
};

export const findAdminByEmail = async (email: string): Promise<AdminUser | null> => {
  return wrapFirebaseOperation(async () => {
    const q = query(collection(db, COLLECTION), where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      lastLogin: doc.data().lastLogin?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as AdminUser;
  }, 'Error finding admin user');
};

export const addAdminUser = async (user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>, password: string) => {
  return wrapFirebaseOperation(async () => {
    // Validate required fields
    if (!user.email || !user.name) {
      throw new Error('Email and name are required');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Validate email format
    if (!user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }

    // Normalize email
    const normalizedEmail = user.email.toLowerCase();

    // Check if admin already exists
    const existingAdmin = await findAdminByEmail(normalizedEmail);
    if (existingAdmin) {
      throw new Error('An admin user with this email already exists');
    }

    // Create Firebase auth account
    const { error: authError } = await createUser(normalizedEmail, password);
    if (authError) {
      throw new Error(`Failed to create user account: ${authError.message}`);
    }

    // Create admin user document
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...user,
      email: normalizedEmail,
      employeeId: user.employeeId || null,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }, 'Error adding admin user');
};

export const updateAdminUser = async (id: string, user: Partial<AdminUser>) => {
  return wrapFirebaseOperation(async () => {
    // Don't allow changing email for existing users
    if (user.email) {
      delete user.email;
    }

    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...user,
      updatedAt: serverTimestamp(),
    });
  }, 'Error updating admin user');
};

export const deleteAdminUser = async (id: string) => {
  return wrapFirebaseOperation(async () => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, 'Error deleting admin user');
};