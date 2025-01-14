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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Types
export interface HeadcountRequest {
  id?: string;
  departmentId: string;
  hiringManagerId: string;
  position: string;
  count: number;
  justification: string;
  jobDescription: string;
  requirements: string;
  qualifications: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPosting {
  id?: string;
  headcountRequestId: string;
  departmentId: string;
  title: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  closingDate: Date;
  status: 'Draft' | 'Published' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id?: string;
  jobPostingId: string;
  // Interview Details
  interviewStatus?: 'scheduled' | 'completed' | 'cancelled';
  interviewDate?: Date;
  interviewType?: 'phone' | 'video' | 'in-person';
  interviewers?: string[];
  interviewLocation?: string;
  interviewNotes?: string;
  interviewFeedback?: {
    technical?: number;
    communication?: number;
    cultural?: number;
    overall?: number;
    comments?: string;
  };
  resumeUrl: string;
  coverLetter: string;
  executiveSummary: string;
  education: string;
  workExperience: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: number;
  currentCompany?: string;
  currentPosition?: string;
  noticePeriod?: string;
  expectedSalary?: number;
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  notes?: string;
  interviewFeedback?: string;
  interviewDate?: Date;
  interviewers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Collection names
const COLLECTIONS = {
  headcount: 'headcountRequests',
  jobs: 'jobPostings',
  applications: 'jobApplications'
};

// Headcount Requests
export const getHeadcountRequests = async (departmentId?: string) => {
  try {
    let q = query(collection(db, COLLECTIONS.headcount));
    
    if (departmentId) {
      q = query(q, 
        where('departmentId', '==', departmentId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      approvedAt: doc.data().approvedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as HeadcountRequest[];
  } catch (error) {
    console.error('Error fetching headcount requests:', error);
    throw error;
  }
};

export const addHeadcountRequest = async (request: Omit<HeadcountRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.headcount), {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding headcount request:', error);
    throw error;
  }
};

export const updateHeadcountRequest = async (id: string, request: Partial<HeadcountRequest>) => {
  try {
    const docRef = doc(db, COLLECTIONS.headcount, id);
    await updateDoc(docRef, {
      ...request,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating headcount request:', error);
    throw error;
  }
};

// Job Postings
export const getJobPostings = async (status?: JobPosting['status']) => {
  try {
    let q = query(collection(db, COLLECTIONS.jobs));
    
    if (status) {
      q = query(q, 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      closingDate: doc.data().closingDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as JobPosting[];
  } catch (error) {
    console.error('Error fetching job postings:', error);
    throw error;
  }
};

export const addJobPosting = async (posting: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.jobs), {
      ...posting,
      closingDate: Timestamp.fromDate(new Date(posting.closingDate)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding job posting:', error);
    throw error;
  }
};

export const updateJobPosting = async (id: string, posting: Partial<JobPosting>) => {
  try {
    const docRef = doc(db, COLLECTIONS.jobs, id);
    await updateDoc(docRef, {
      ...posting,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating job posting:', error);
    throw error;
  }
};

// Job Applications
export const getJobApplications = async (jobPostingId?: string) => {
  try {
    let q = query(collection(db, COLLECTIONS.applications));
    
    if (jobPostingId) {
      q = query(q,
        where('jobPostingId', '==', jobPostingId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as JobApplication[];
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
};

export const addJobApplication = async (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.applications), {
      ...application,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding job application:', error);
    throw error;
  }
};

export const updateJobApplication = async (id: string, application: Partial<JobApplication>) => {
  try {
    const docRef = doc(db, COLLECTIONS.applications, id);
    await updateDoc(docRef, {
      ...application,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating job application:', error);
    throw error;
  }
};