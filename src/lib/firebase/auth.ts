import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import { auth } from './config';
import { handleFirebaseError, AppError } from '../utils/errorHandling';
import { findEmployeeByEmail } from './employees';
import { findAdminByEmail } from './users';

export { AppError };

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

export const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendPasswordResetEmail(auth, email);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: handleFirebaseError(error) };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const normalizedEmail = email.toLowerCase();

    // Check user type and permissions
    if (normalizedEmail === 'victor@mutunga.co') {
      localStorage.setItem('userRole', 'super_admin');
      return {
        user: userCredential.user,
        role: 'super_admin',
        error: null
      };
    }

    // Check for employee record
    const employee = await findEmployeeByEmail(normalizedEmail);
    const adminUser = await findAdminByEmail(normalizedEmail);

    if (employee) {
      localStorage.setItem('employeeId', employee.id || '');

      if (adminUser) {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminId', adminUser.id || '');
        return {
          user: userCredential.user,
          role: 'admin',
          error: null
        };
      }

      localStorage.setItem('userRole', 'employee');
      return {
        user: userCredential.user,
        role: 'employee',
        error: null
      };
    }

    throw new Error('User not found in employee records');
  } catch (error) {
    const appError = handleFirebaseError(error);
    return { user: null, error: appError };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: handleFirebaseError(error) };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    // Clear stored data
    // Clear stored tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('isSuperAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('employeeId');
    return { error: null };
  } catch (error) {
    const appError = handleFirebaseError(error);
    return { error: appError };
  }
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void,
  onError?: (error: Error) => void
) => {
  return onAuthStateChanged(
    auth, 
    callback,
    error => {
      console.error('Auth state change error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
};