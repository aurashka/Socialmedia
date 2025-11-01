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

// --- Admin Functions ---
export const banUser = (userId: string) => {
    return update(ref(db, `users/${userId}`), { isBanned: true });
};


// --- Post & Story Functions ---

export const createPost = async (postData: Omit<Post, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);
    await set(newPostRef, {
        ...postData,
        id: newPostRef.key,
        likes: 0,
        comments: 0,
        timestamp: Date.now(),
    });
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
  const postsRef = ref(db, 'posts');
  const postsSnapshot = await get(postsRef);
  if (!postsSnapshot.exists()) {
    console.log('Seeding database...');
    // We need dummy users for posts to resolve correctly.
    const users = {
      user2: { id: 'user2', name: 'Krishna Vinjam', avatarUrl: 'https://i.pravatar.cc/150?u=user2', role: 'user', email: 'krishna@demo.com', handle: 'krishna', coverPhotoUrl: 'https://picsum.photos/seed/cover2/1000/300', bio: 'Frontend Developer | React Enthusiast', isPublic: true },
      user3: { id: 'user3', name: 'Habib Habib', avatarUrl: 'https://i.pravatar.cc/150?u=user3', role: 'user', email: 'habib@demo.com', handle: 'habib', coverPhotoUrl: 'https://picsum.photos/seed/cover3/1000/300', bio: 'Loves hiking and photography.', isPublic: true },
    };
    await set(ref(db, 'users'), users);

    const posts = {
      post1: { id: 'post1', userId: 'user2', content: 'Exploring the serene beauty of nature. #nature #travel', mediaUrls: [`https://picsum.photos/seed/postA/600/400`, `https://picsum.photos/seed/postB/600/400`], timestamp: Date.now() - 86400000 * 2, likes: 125, comments: 23 },
      post2: { id: 'post2', userId: 'user3', content: 'What a beautiful sunset today! Feeling blessed.', mediaUrls: [`https://picsum.photos/seed/post2/600/400`], timestamp: Date.now() - 3600000 * 5, likes: 210, comments: 45 },
    };
    await set(postsRef, posts);
    
    const stories = {
      story1: { id: 'story1', userId: 'user2', imageUrl: 'https://i.pravatar.cc/300?u=story1', timestamp: Date.now() - 3600000 * 3 },
      story2: { id: 'story2', userId: 'user3', imageUrl: 'https://i.pravatar.cc/300?u=story2', timestamp: Date.now() - 3600000 * 2 },
      story3: { id: 'story3', userId: 'user2', imageUrl: 'https://i.pravatar.cc/300?u=story3', timestamp: Date.now() - 3600000 * 1 },
    };
    await set(ref(db, 'stories'), stories);
  }
};