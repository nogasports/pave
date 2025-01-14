import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '../lib/firebase/auth';
import { handleFirebaseError } from '../lib/utils/errorHandling';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored super admin status
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';

    const unsubscribe = subscribeToAuthChanges(
      (user) => {
        // Set super admin status if applicable
        if (user?.email?.toLowerCase() === 'victor@mutunga.co') {
          localStorage.setItem('isSuperAdmin', 'true');
        }
        setUser(user);
        // Restore super admin status if needed
        if (user?.email?.toLowerCase() === 'victor@mutunga.co' && !isSuperAdmin) {
          localStorage.setItem('isSuperAdmin', 'true');
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        const appError = handleFirebaseError(error);
        setError(appError.message);
        setLoading(false);
        localStorage.removeItem('isSuperAdmin');
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);