import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  push, 
  query, 
  orderByChild, 
  equalTo 
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
    // If handle exists, check if it belongs to the current user
    if (currentUserId) {
        const users = snapshot.val();
        const userId = Object.keys(users)[0];
        return userId === currentUserId;
    }
    return false;
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

export const createStory = async (storyData: Omit<Story, 'id'>) => {
    const storiesRef = ref(db, 'stories');
    const newStoryRef = push(storiesRef);
    await set(newStoryRef, {
        ...storyData,
        id: newStoryRef.key,
    });
};

export const seedDatabase = async () => {
  // We no longer seed users, as they are created through sign-up.
  // We can still seed posts and stories if the database is completely empty.

  const postsRef = ref(db, 'posts');
  const postsSnapshot = await get(postsRef);
  if (!postsSnapshot.exists()) {
    console.log('Posts collection empty. Seeding posts...');
    const posts = {
      post1: { id: 'post1', userId: 'user2', content: 'Added a new video about modern architecture. Check it out!', mediaUrl: `https://picsum.photos/seed/post1/600/400`, mediaType: 'video', timestamp: Date.now() - 86400000 * 15, likes: 125, comments: 23, tag: 'General' },
      post2: { id: 'post2', userId: 'user4', content: 'What a beautiful sunset today! Feeling blessed.', mediaUrl: `https://picsum.photos/seed/post2/600/400`, mediaType: 'image', timestamp: Date.now() - 3600000 * 5, likes: 210, comments: 45 },
      post3: { id: 'post3', userId: 'user5', content: 'Just launched my new portfolio website. Let me know what you think! #webdev #portfolio', timestamp: Date.now() - 3600000 * 2, likes: 78, comments: 12 },
    };
     // We also need dummy users for these posts to resolve correctly.
    const users = {
      user2: { id: 'user2', name: 'Krishna Vinjam', avatarUrl: 'https://i.pravatar.cc/150?u=user2', role: 'user', email: 'krishna@demo.com', handle: 'krishna', coverPhotoUrl: 'https://picsum.photos/seed/cover2/1000/300', bio: 'Frontend Developer | React Enthusiast', isPublic: true },
      user3: { id: 'user3', name: 'Habib Habib', avatarUrl: 'https://i.pravatar.cc/150?u=user3', role: 'user', email: 'habib@demo.com', handle: 'habib', coverPhotoUrl: 'https://picsum.photos/seed/cover3/1000/300', bio: 'Loves hiking and photography.', isPublic: true },
      user4: { id: 'user4', name: 'Ahmad Raza', avatarUrl: 'https://i.pravatar.cc/150?u=user4', role: 'user', email: 'ahmad@demo.com', handle: 'ahmad', coverPhotoUrl: 'https://picsum.photos/seed/cover4/1000/300', bio: 'UX/UI Designer creating beautiful and intuitive interfaces.', isPublic: true },
      user5: { id: 'user5', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=user5', role: 'user', email: 'jane@demo.com', handle: 'jane', coverPhotoUrl: 'https://picsum.photos/seed/cover5/1000/300', bio: 'Coffee lover and world traveler.', isPublic: false }, // This user is private
    };
    await set(ref(db, 'users'), users);
    await set(postsRef, posts);
  }

  const storiesRef = ref(db, 'stories');
  const storiesSnapshot = await get(storiesRef);
  if (!storiesSnapshot.exists()) {
    console.log('Stories collection empty. Seeding stories...');
    const stories = {
      story1: { id: 'story1', userId: 'user2', imageUrl: 'https://i.pravatar.cc/300?u=story1' },
      story2: { id: 'story2', userId: 'user3', imageUrl: 'https://i.pravatar.cc/300?u=story2' },
      story3: { id: 'story3', userId: 'user4', imageUrl: 'https://i.pravatar.cc/300?u=story3' },
      story4: { id: 'story4', userId: 'user5', imageUrl: 'https://i.pravatar.cc/300?u=story4' },
    };
    await set(storiesRef, stories);
  }
};