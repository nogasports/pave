import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './config';

// Shift Types
export interface Shift {
  id?: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number; // in minutes
  workDays: string[]; // ['Monday', 'Tuesday', etc.]
  type: 'Regular' | 'Night' | 'Flexible';
  allowedLateMinutes?: number;
  allowedEarlyDeparture?: number;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Leave Types
export interface Leave {
  id?: string;
  employeeId: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Types
export interface Attendance {
  id?: string;
  employeeId: string;
  shiftId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'Late' | 'Early-Departure' | 'Half-Day';
  lateMinutes?: number;
  earlyMinutes?: number;
  totalWorkHours?: number;
  overtimeHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shift Management
const SHIFTS_COLLECTION = 'shifts';

export const getShifts = async () => {
  try {
    const q = query(collection(db, SHIFTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Shift[];
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const addShift = async (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, SHIFTS_COLLECTION), {
      ...shift,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding shift:', error);
    throw error;
  }
};

export const updateShift = async (id: string, shift: Partial<Shift>) => {
  try {
    const docRef = doc(db, SHIFTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...shift,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

export const deleteShift = async (id: string) => {
  try {
    await deleteDoc(doc(db, SHIFTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
};

// Leave Management
const LEAVES_COLLECTION = 'leaves';

export const getLeaves = async (employeeId?: string) => {
  try {
    let q = query(collection(db, LEAVES_COLLECTION));
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Leave[];
  } catch (error) {
    console.error('Error fetching leaves:', error);
    throw error;
  }
};

export const addLeave = async (leave: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, LEAVES_COLLECTION), {
      ...leave,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding leave:', error);
    throw error;
  }
};

export const updateLeave = async (id: string, leave: Partial<Leave>) => {
  try {
    const docRef = doc(db, LEAVES_COLLECTION, id);
    const feedback = leave.status === 'Approved' ? 'approved' : 'rejected';
    const history = [{
      status: leave.status,
      date: new Date(),
      comment: leave.approverComment || `Leave request ${feedback}`,
      by: leave.approvedBy
    }];

    await updateDoc(docRef, {
      ...leave,
      history,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating leave:', error);
    throw error;
  }
};

export const deleteLeave = async (id: string) => {
  try {
    await deleteDoc(doc(db, LEAVES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting leave:', error);
    throw error;
  }
};

// Attendance Management
const ATTENDANCE_COLLECTION = 'attendance';

export const getAttendance = async (employeeId?: string, startDate?: Date, endDate?: Date) => {
  try {
    let q = query(collection(db, ATTENDANCE_COLLECTION));
    
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId));
    }
    
    // Add date filter if provided
    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }
    
    // Order by date descending
    q = query(q, orderBy('date', 'desc'));
    
    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      checkIn: doc.data().checkIn?.toDate(),
      checkOut: doc.data().checkOut?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Attendance[];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const addAttendance = async (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Get shift details
    const shiftRef = doc(db, SHIFTS_COLLECTION, attendance.shiftId);
    const shiftDoc = await getDoc(shiftRef);
    if (!shiftDoc.exists()) throw new Error('Shift not found');
    const shift = shiftDoc.data() as Shift;

    // Calculate time differences
    const shiftStart = new Date(`${attendance.date.toISOString().split('T')[0]}T${shift.startTime}`);
    const shiftEnd = new Date(`${attendance.date.toISOString().split('T')[0]}T${shift.endTime}`);
    const checkIn = attendance.checkIn;
    const checkOut = attendance.checkOut;

    let status = 'Present';
    let lateMinutes = 0;
    let earlyMinutes = 0;
    let totalWorkHours = 0;

    if (checkIn && checkOut) {
      // Calculate total work hours
      totalWorkHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      // Calculate late minutes
      if (checkIn > shiftStart) {
        lateMinutes = Math.round((checkIn.getTime() - shiftStart.getTime()) / (1000 * 60));
        if (lateMinutes > (shift.allowedLateMinutes || 15)) {
          status = 'Late';
        }
      }

      // Calculate early departure
      if (checkOut < shiftEnd) {
        earlyMinutes = Math.round((shiftEnd.getTime() - checkOut.getTime()) / (1000 * 60));
        if (earlyMinutes > (shift.allowedEarlyDeparture || 15)) {
          status = status === 'Late' ? 'Late-Early' : 'Early-Departure';
        }
      }
    }

    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
      ...attendance,
      status,
      lateMinutes,
      earlyMinutes,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding attendance:', error);
    throw error;
  }
};

export const updateAttendance = async (id: string, attendance: Partial<Attendance>) => {
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, id);
    // Convert dates to Firestore timestamps
    const data = {
      ...attendance,
      date: serverTimestamp(),
      checkIn: attendance.checkIn ? serverTimestamp() : null,
      checkOut: attendance.checkOut ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

export const deleteAttendance = async (id: string) => {
  try {
    await deleteDoc(doc(db, ATTENDANCE_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};