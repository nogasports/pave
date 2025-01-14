import { FirebaseError } from 'firebase/app';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'unknown-error',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export const handleFirebaseError = (error: unknown): AppError => {
  if (error instanceof FirebaseError) {
    // Log the error for debugging
    console.error('Firebase error:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    switch (error.code) {
      case 'permission-denied':
      case 'auth/insufficient-permissions':
        return new AppError(
          'You do not have permission to perform this action.',
          error.code,
          error
        );

      case 'failed-precondition':
      case 'failed-condition':
        return new AppError(
          'Operation failed. Please check your permissions and try again.',
          error.code,
          error
        );

      case 'unavailable':
        return new AppError(
          'Service temporarily unavailable. Please try again later.',
          error.code,
          error
        );
      case 'resource-exhausted':
        return new AppError(
          'Too many requests. Please try again later.',
          error.code,
          error
        );
      case 'auth/network-request-failed':
        return new AppError(
          'Network error. Please check your internet connection.',
          error.code,
          error
        );
      case 'auth/invalid-credential':
        return new AppError(
          'Invalid credentials. Please check your email and password.',
          error.code,
          error
        );
      case 'auth/user-not-found':
        return new AppError(
          'User not found. Please check your email or sign up.',
          error.code,
          error
        );
      case 'auth/wrong-password':
        return new AppError(
          'Incorrect password. Please try again.',
          error.code,
          error
        );
      case 'auth/too-many-requests':
        return new AppError(
          'Too many attempts. Please try again later.',
          error.code,
          error
        );
      case 'auth/email-already-in-use':
        return new AppError(
          'Email already in use. Please use a different email.',
          error.code,
          error
        );
      case 'not-found':
        return new AppError(
          'The requested resource was not found.',
          error.code,
          error
        );
      default:
        return new AppError(
          'An unexpected error occurred. Please try again.',
          error.code || 'unknown-error',
          error
        );
    }
  }
  
  // Log non-Firebase errors
  console.error('Non-Firebase error:', error);

  return new AppError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'unknown-error',
    error instanceof Error ? error : undefined
  );
};

export const wrapFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  retries = 3
): Promise<T> => {
  let lastError;
  let delay = 1000; // Start with 1 second delay

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error instanceof FirebaseError) {
        // Retry only for temporary errors
        if (['unavailable', 'resource-exhausted', 'network-request-failed'].includes(error.code)) {
          console.warn(`Retrying operation after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, 10000); // Exponential backoff with 10s max
          continue;
        }
      }
      throw handleFirebaseError(error);
    }
  }
  throw handleFirebaseError(lastError);
};