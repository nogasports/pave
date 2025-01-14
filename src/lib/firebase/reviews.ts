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

// Types
export interface ReviewCycle {
  id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'Draft' | 'Active' | 'Completed';
  reviewers: {
    self: boolean;
    manager: boolean;
    peer: boolean;
  };
  questions: ReviewQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewQuestion {
  id: string;
  category: 'Performance' | 'Leadership' | 'Values' | 'Skills';
  question: string;
  type: 'rating' | 'text';
  required: boolean;
}

export interface Review {
  id?: string;
  cycleId: string;
  employeeId: string;
  reviewerId: string;
  reviewerType: 'Self' | 'Manager' | 'Peer';
  status: 'Pending' | 'In Progress' | 'Completed';
  responses: ReviewResponse[];
  summary?: string;
  rating?: number;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponse {
  questionId: string;
  rating?: number;
  comment?: string;
}

// Collection names
const COLLECTIONS = {
  cycles: 'reviewCycles',
  reviews: 'reviews'
};

// Review Cycles
export const getReviewCycles = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.cycles), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ReviewCycle[];
  } catch (error) {
    console.error('Error fetching review cycles:', error);
    throw error;
  }
};

export const addReviewCycle = async (cycle: Omit<ReviewCycle, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.cycles), {
      ...cycle,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review cycle:', error);
    throw error;
  }
};

export const updateReviewCycle = async (id: string, cycle: Partial<ReviewCycle>) => {
  try {
    const docRef = doc(db, COLLECTIONS.cycles, id);
    await updateDoc(docRef, {
      ...cycle,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating review cycle:', error);
    throw error;
  }
};

// Reviews
export const getReviews = async (cycleId?: string, employeeId?: string, reviewerId?: string) => {
  try {
    let q = query(collection(db, COLLECTIONS.reviews), orderBy('createdAt', 'desc'));
    
    if (cycleId) {
      q = query(q, where('cycleId', '==', cycleId));
    }
    
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId));
    }
    
    if (reviewerId) {
      q = query(q, where('reviewerId', '==', reviewerId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.reviews), {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const updateReview = async (id: string, review: Partial<Review>) => {
  try {
    const docRef = doc(db, COLLECTIONS.reviews, id);
    await updateDoc(docRef, {
      ...review,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Helper function to generate review assignments
export const generateReviewAssignments = async (
  cycleId: string,
  employees: { id: string; managerId?: string }[],
  reviewsPerEmployee: number = 2
) => {
  try {
    const assignments: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // For each employee
    for (const employee of employees) {
      // Self review
      assignments.push({
        cycleId,
        employeeId: employee.id,
        reviewerId: employee.id,
        reviewerType: 'Self',
        status: 'Pending',
        responses: [],
      });

      // Manager review
      if (employee.managerId) {
        assignments.push({
          cycleId,
          employeeId: employee.id,
          reviewerId: employee.managerId,
          reviewerType: 'Manager',
          status: 'Pending',
          responses: [],
        });
      }

      // Peer reviews
      const peers = employees.filter(e => 
        e.id !== employee.id && 
        e.managerId === employee.managerId
      );
      
      if (peers.length > 0) {
        // Randomly select peers
        const selectedPeers = peers
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(reviewsPerEmployee, peers.length));

        for (const peer of selectedPeers) {
          assignments.push({
            cycleId,
            employeeId: employee.id,
            reviewerId: peer.id,
            reviewerType: 'Peer',
            status: 'Pending',
            responses: [],
          });
        }
      }
    }

    // Create all review assignments
    const promises = assignments.map(assignment => addReview(assignment));
    await Promise.all(promises);

  } catch (error) {
    console.error('Error generating review assignments:', error);
    throw error;
  }
};