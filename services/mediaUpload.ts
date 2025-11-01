import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, auth } from './firebase'; // To get current user for path

const storage = getStorage(app);

export const uploadMedia = async (file: File, type: 'image' | 'audio'): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated for media upload.");

  const fileExtension = file.name.split('.').pop();
  const fileName = `${new Date().getTime()}.${fileExtension}`;
  const path = type === 'image' 
    ? `images/${userId}/${fileName}` 
    : `audio/${userId}/${fileName}`;
  
  const mediaRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(mediaRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
};
