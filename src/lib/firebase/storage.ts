import { getStorage, ref, uploadBytes, getDownloadURL as getFirebaseDownloadURL } from 'firebase/storage';
import { app } from './config';
import { wrapFirebaseOperation } from '../utils/errorHandling';

const storage = getStorage(app);

export const uploadFile = async (path: string, file: File): Promise<string> => {
  return wrapFirebaseOperation(async () => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getFirebaseDownloadURL(storageRef);
  }, 'Error uploading file');
};

export const getDownloadURL = async (path: string): Promise<string> => {
  return wrapFirebaseOperation(async () => {
    const storageRef = ref(storage, path);
    return await getFirebaseDownloadURL(storageRef);
  }, 'Error getting download URL');
};