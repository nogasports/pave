import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { createAssetSupportTicket } from './assetSupport';
import { Asset } from './assets';
import { Employee } from './employees';

export interface AssetRequest {
  id?: string;
  assetId: string;
  stockId?: string;
  employeeId: string;
  type: 'request' | 'return' | 'maintenance';
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  reason?: string;
  requestDate: Date;
  quantity?: number;
  approvedBy?: string;
  approvedAt?: Date;
  approverComment?: string;
  supportTicketId?: string;
  allocatedAssets?: string[];
  history: {
    status: string;
    date: Date;
    comment?: string;
    by?: string;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'assetRequests';

export const getAssetRequests = async (employeeId?: string) => {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      requestDate: doc.data().requestDate?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate(),
      history: doc.data().history?.map((entry: any) => ({
        ...entry,
        date: entry.date?.toDate()
      })),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AssetRequest[];
  } catch (error) {
    console.error('Error fetching asset requests:', error);
    throw error;
  }
};

export const addAssetRequest = async (
  request: Omit<AssetRequest, 'id' | 'createdAt' | 'updatedAt'>,
  asset: Asset,
  employee: Employee
) => {
  try {
    // Create support ticket first
    const ticketId = await createAssetSupportTicket(
      asset,
      employee,
      request.type,
      request.reason || '',
      request.type === 'maintenance' ? 'high' : 'medium'
    );

    // Add initial history entry
    const history = [{
      status: 'pending',
      date: new Date(),
      comment: request.reason
    }];

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...request,
      supportTicketId: ticketId,
      history,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding asset request:', error);
    throw error;
  }
};

export const updateAssetRequest = async (id: string, request: Partial<AssetRequest>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Request not found');
    }

    const currentRequest = docSnap.data() as AssetRequest;

    // Add new history entry if status is changing
    if (request.status && request.status !== currentRequest.status) {
      const historyEntry = {
        status: request.status,
        date: new Date(),
        comment: request.approverComment,
        by: request.approvedBy
      };
      request.history = [...(currentRequest.history || []), historyEntry];
    }
    
    // If request is being approved/rejected, update asset status
    if (request.status === 'approved' || request.status === 'rejected') {
      const assetRef = doc(db, 'assets', currentRequest.assetId);
      const assetDoc = await getDoc(assetRef);
      
      if (!assetDoc.exists()) {
        throw new Error('Asset not found');
      }
      
      if (request.status === 'approved') {
        if (currentRequest.type === 'request') {
          await updateDoc(assetRef, {
            status: 'Allocated',
            custodianId: currentRequest.employeeId,
            updatedAt: serverTimestamp(),
          });
        } else if (currentRequest.type === 'return') {
          await updateDoc(assetRef, {
            status: 'Available',
            custodianId: '',
            updatedAt: serverTimestamp(),
          });
        }
      }
    }
    
    await updateDoc(docRef, {
      ...request,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating asset request:', error);
    throw error;
  }
};