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
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './config';

export interface AssetType {
  id?: string;
  category: string;
  subCategory: string;
  name: string;
  description?: string;
  location: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id?: string;
  assetNumber: string;
  assetTypeId: string;
  stockId?: string;
  name: string;
  description: string;
  location: string;
  departmentId: string;
  registrationCode: string;
  custodianId: string;
  remark?: string;
  serialNumber: string;
  model: string;
  photo?: string;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  supportHistory?: {
    ticketId: string;
    timestamp: Date;
    type: string;
    status: string;
  }[];
  status: 'Available' | 'Allocated' | 'Under Maintenance' | 'Retired';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetStock {
  id?: string;
  assetTypeId: string;
  location: string;
  quantity: number;
  minimumQuantity: number;
  reorderPoint: number;
  unitCost: number;
  currency: string;
  lastRestockDate?: Date;
  nextRestockDate?: Date;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransaction {
  id?: string;
  stockId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  referenceNumber?: string;
  performedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetRequest {
  id?: string;
  assetId: string;
  employeeId: string;
  type: 'request' | 'return' | 'maintenance';
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  reason?: string;
  requestDate: Date;
  approvedBy?: string;
  approvedAt?: Date;
  approverComment?: string;
  supportTicketId?: string;
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

const COLLECTION = 'assets';
const ASSET_TYPES_COLLECTION = 'assetTypes';
const ASSET_STOCK_COLLECTION = 'assetStock';
const STOCK_TRANSACTIONS_COLLECTION = 'stockTransactions';
const LOCATIONS_COLLECTION = 'locations';

// Asset Types Management
export const getAssetTypes = async () => {
  try {
    const q = query(collection(db, ASSET_TYPES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AssetType[];
  } catch (error) {
    console.error('Error fetching asset types:', error);
    throw error;
  }
};

export const addAssetType = async (assetType: Omit<AssetType, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Validate required fields
    if (!assetType.name || !assetType.category || !assetType.subCategory || !assetType.location) {
      throw new Error('Missing required fields');
    }

    // Clean up the data
    const cleanData = {
      name: assetType.name.trim(),
      category: assetType.category.trim(),
      subCategory: assetType.subCategory.trim(),
      location: assetType.location.trim(),
      description: assetType.description?.trim() || '',
      photo: assetType.photo || '',
      active: assetType.active ?? true,
    };

    const docRef = await addDoc(collection(db, ASSET_TYPES_COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding asset type:', error);
    throw error;
  }
};

// Stock Management
export const getAssetStock = async () => {
  try {
    const q = query(collection(db, ASSET_STOCK_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AssetStock[];
  } catch (error) {
    console.error('Error fetching asset stock:', error);
    throw error;
  }
};

export const updateAssetStock = async (id: string, stock: Partial<AssetStock>) => {
  try {
    if (id === 'new') {
      const docRef = await addDoc(collection(db, ASSET_STOCK_COLLECTION), {
        ...stock,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    }

    const docRef = doc(db, ASSET_STOCK_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Stock record not found');
    }

    await updateDoc(docRef, {
      ...stock,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating asset stock:', error);
    throw error;
  }
};

// Locations Management
export const getLocations = async () => {
  try {
    const q = query(collection(db, LOCATIONS_COLLECTION), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const addLocation = async (name: string) => {
  try {
    const docRef = await addDoc(collection(db, LOCATIONS_COLLECTION), { name });
    return docRef.id;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};

export const getAssets = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Asset[];
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

export const addAsset = async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'assetNumber'>) => {
  try {
    // Generate asset number based on type and count
    const assetType = await getDoc(doc(db, ASSET_TYPES_COLLECTION, asset.assetTypeId));
    if (!assetType.exists()) {
      throw new Error('Invalid asset type');
    }
    
    const snapshot = await getDocs(collection(db, COLLECTION));
    const typeCount = snapshot.docs
      .map(doc => doc.data())
      .filter(data => data.assetTypeId === asset.assetTypeId)
      .length;
    
    const prefix = assetType.data().category === 'Furniture' ? 'FUR' :
                  assetType.data().category === 'Electronics' ? 'ELE' : 'VEH';
    
    const assetNumber = `${prefix}${(typeCount + 1).toString().padStart(4, '0')}`;

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...asset,
      assetNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
};

export const updateAsset = async (id: string, asset: Partial<Asset>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...asset,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
};

export const deleteAsset = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};

// Stock Transactions
export const addStockTransaction = async (transaction: Omit<StockTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Update stock quantity
    const stockRef = doc(db, ASSET_STOCK_COLLECTION, transaction.stockId);
    const stockDoc = await getDoc(stockRef);
    
    if (!stockDoc.exists()) {
      throw new Error('Stock not found');
    }
    
    const currentStock = stockDoc.data() as AssetStock;
    const newQuantity = transaction.type === 'in' 
      ? currentStock.quantity + transaction.quantity
      : currentStock.quantity - transaction.quantity;

    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    // Update stock
    await updateDoc(stockRef, {
      quantity: newQuantity,
      lastRestockDate: transaction.type === 'in' ? serverTimestamp() : currentStock.lastRestockDate,
      updatedAt: serverTimestamp()
    });

    // Record transaction
    const docRef = await addDoc(collection(db, STOCK_TRANSACTIONS_COLLECTION), {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding stock transaction:', error);
    throw error;
  }
};

export const getStockTransactions = async (stockId?: string) => {
  try {
    let q = query(collection(db, STOCK_TRANSACTIONS_COLLECTION), orderBy('createdAt', 'desc'));
    
    if (stockId) {
      q = query(q, where('stockId', '==', stockId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as StockTransaction[];
  } catch (error) {
    console.error('Error fetching stock transactions:', error);
    throw error;
  }
};