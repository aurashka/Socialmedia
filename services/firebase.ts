import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import type { Post, Story } from '../types';

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
  const dbRef = ref(db);
  const snapshot = await get(dbRef);
  if (!snapshot.exists()) {
    console.log('Database appears empty. Seeding initial data...');
    const users = {
      user1: { id: 'user1', name: 'George Alex', avatarUrl: 'https://i.pravatar.cc/150?u=user1' },
      user2: { id: 'user2', name: 'Krishna Vinjam', avatarUrl: 'https://i.pravatar.cc/150?u=user2' },
      user3: { id: 'user3', name: 'Habib Habib', avatarUrl: 'https://i.pravatar.cc/150?u=user3' },
      user4: { id: 'user4', name: 'Ahmad Raza', avatarUrl: 'https://i.pravatar.cc/150?u=user4' },
      user5: { id: 'user5', name: 'Jane Doe', avatarUrl: 'https://i.pravatar.cc/150?u=user5' },
    };

    const posts = {
      post1: { id: 'post1', userId: 'user2', content: 'Added a new video about modern architecture. Check it out!', mediaUrl: `https://picsum.photos/seed/post1/600/400`, mediaType: 'video', timestamp: Date.now() - 86400000 * 15, likes: 125, comments: 23, tag: 'General' },
      post2: { id: 'post2', userId: 'user4', content: 'What a beautiful sunset today! Feeling blessed.', mediaUrl: `https://picsum.photos/seed/post2/600/400`, mediaType: 'image', timestamp: Date.now() - 3600000 * 5, likes: 210, comments: 45 },
      post3: { id: 'post3', userId: 'user5', content: 'Just launched my new portfolio website. Let me know what you think! #webdev #portfolio', timestamp: Date.now() - 3600000 * 2, likes: 78, comments: 12 },
    };

    const stories = {
      story1: { id: 'story1', userId: 'user2', imageUrl: 'https://i.pravatar.cc/300?u=story1' },
      story2: { id: 'story2', userId: 'user3', imageUrl: 'https://i.pravatar.cc/300?u=story2' },
      story3: { id: 'story3', userId: 'user4', imageUrl: 'https://i.pravatar.cc/300?u=story3' },
      story4: { id: 'story4', userId: 'user5', imageUrl: 'https://i.pravatar.cc/300?u=story4' },
    };
    
    await set(ref(db, 'users'), users);
    await set(ref(db, 'posts'), posts);
    await set(ref(db, 'stories'), stories);
    console.log('Database seeded!');
  }
};
