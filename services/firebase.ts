import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  push, 
  query, 
  orderByChild, 
  equalTo,
  update,
  remove
} from 'firebase/database';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import type { Post, Story, User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAPPZgVrZF9SEaS42xx8RcsnM2i8EpenUQ",
  authDomain: "creadit-loan-5203b.firebaseapp.com",
  databaseURL: "https://creadit-loan-5203b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "creadit-loan-5203b",
  storageBucket: "creadit-loan-5203b.appspot.com",
  messagingSenderId: "95634892627",
  appId: "1:95634892627:web:1500052cb60f3b7e4823a6",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// --- User & Auth Functions ---

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() as User : null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    const userRef = ref(db, `users/${userId}`);
    // Use update instead of set to avoid overwriting the whole object
    const snapshot = await get(userRef);
    const existingProfile = snapshot.exists() ? snapshot.val() : {};
    return set(userRef, { ...existingProfile, ...data, id: userId });
};

export const isHandleUnique = async (handle: string, currentUserId?: string): Promise<boolean> => {
    const usersRef = ref(db, 'users');
    const handleQuery = query(usersRef, orderByChild('handle'), equalTo(handle));
    const snapshot = await get(handleQuery);
    if (!snapshot.exists()) {
        return true;
    }
    if (currentUserId) {
        const users = snapshot.val();
        const userId = Object.keys(users)[0];
        return userId === currentUserId;
    }
    return false;
};

// --- Friend Request and Management Functions ---
export const sendFriendRequest = (fromId: string, toId: string) => {
    const requestRef = ref(db, `friendRequests/${toId}/${fromId}`);
    return set(requestRef, { timestamp: Date.now() });
};

export const cancelFriendRequest = (fromId: string, toId: string) => {
    const requestRef = ref(db, `friendRequests/${toId}/${fromId}`);
    return remove(requestRef);
};

export const handleFriendRequest = async (currentUserId: string, senderId: string, accept: boolean) => {
    const requestRef = ref(db, `friendRequests/${currentUserId}/${senderId}`);
    await remove(requestRef);

    if (accept) {
        const updates: Record<string, any> = {};
        updates[`users/${currentUserId}/friends/${senderId}`] = true;
        updates[`users/${senderId}/friends/${currentUserId}`] = true;
        await update(ref(db), updates);
    }
};

export const removeFriend = async (currentUserId: string, friendId: string) => {
    const updates: Record<string, any> = {};
    updates[`users/${currentUserId}/friends/${friendId}`] = null;
    updates[`users/${friendId}/friends/${currentUserId}`] = null;
    await update(ref(db), updates);
};

// --- Block/Unblock Functions ---
export const blockUser = async (blockerId: string, blockedId: string) => {
    // First, ensure they are not friends
    await removeFriend(blockerId, blockedId);
    
    // Then, add to the block list
    const blockRef = ref(db, `users/${blockerId}/blocked/${blockedId}`);
    return set(blockRef, true);
};

export const unblockUser = async (blockerId: string, blockedId: string) => {
    const blockRef = ref(db, `users/${blockerId}/blocked/${blockedId}`);
    return remove(blockRef);
};

// --- Admin Functions ---
export const banUser = (userId: string) => {
    return update(ref(db, `users/${userId}`), { isBanned: true });
};


// --- Post & Story Functions ---

export const createPost = async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);

    // Firebase RTDB doesn't allow `undefined` values in `set`.
    const cleanPostData = Object.entries(postData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as Omit<Post, 'id' | 'likes' | 'comments' | 'timestamp'>);

    await set(newPostRef, {
        ...cleanPostData,
        id: newPostRef.key,
        likes: 0,
        comments: 0,
        timestamp: Date.now(),
    });
};

export const updatePost = async (postId: string, newContent: string) => {
    const postRef = ref(db, `posts/${postId}`);
    return update(postRef, { content: newContent });
};

export const deletePost = async (postId: string) => {
    const postRef = ref(db, `posts/${postId}`);
    return remove(postRef);
};


export const createStory = async (storyData: Omit<Story, 'id' | 'timestamp'>) => {
    const storiesRef = ref(db, 'stories');
    const newStoryRef = push(storiesRef);
    await set(newStoryRef, {
        ...storyData,
        id: newStoryRef.key,
        timestamp: Date.now()
    });
};

export const seedDatabase = async () => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) {
    console.log('Database is empty. Ready for new users.');
    // No more seeding of users, posts, or stories.
  }
};