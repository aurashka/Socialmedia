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
  remove,
  runTransaction,
  limitToLast,
  endBefore,
  orderByKey
} from 'firebase/database';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import type { Post, Story, User, Comment, Notification } from '../types';

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

export const setUserBadge = (userId: string, badgeUrl: string | null) => {
    return update(ref(db, `users/${userId}`), { badgeUrl });
};


// --- Post & Story Functions ---
export const createPost = async (postData: Omit<Post, 'id' | 'commentCount' | 'timestamp'>) => {
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);

    const cleanPostData = Object.entries(postData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as Omit<Post, 'id' | 'commentCount' | 'timestamp'>);

    await set(newPostRef, {
        ...cleanPostData,
        id: newPostRef.key,
        commentCount: 0,
        timestamp: Date.now(),
    });
};

export const toggleReaction = async (postId: string, userId: string, reactionType: string) => {
    const postReactionsRef = ref(db, `posts/${postId}/reactions`);
    
    await runTransaction(postReactionsRef, (currentData) => {
        const reactions = currentData || {};
        let userPreviousReaction: string | null = null;
        
        for (const type in reactions) {
            if (reactions[type] && reactions[type][userId]) {
                userPreviousReaction = type;
                delete reactions[type][userId];
                if (Object.keys(reactions[type]).length === 0) {
                    delete reactions[type];
                }
                break;
            }
        }
        
        if (userPreviousReaction !== reactionType) {
            if (!reactions[reactionType]) {
                reactions[reactionType] = {};
            }
            reactions[reactionType][userId] = true;
        }

        return reactions;
    });
};

export const toggleBookmark = async (userId: string, postId: string) => {
    const bookmarkRef = ref(db, `users/${userId}/bookmarkedPosts/${postId}`);
    return runTransaction(bookmarkRef, (currentData) => {
        // If it exists (is true), remove it (return null). Otherwise, add it (return true).
        return currentData ? null : true;
    });
};


export const updatePost = async (postId: string, newContent: string) => {
    const postRef = ref(db, `posts/${postId}`);
    return update(postRef, { content: newContent });
};

// FIX: Add updatePostPrivacy function to update post privacy settings.
export const updatePostPrivacy = async (postId: string, newPrivacy: Post['privacy']) => {
    const postRef = ref(db, `posts/${postId}`);
    return update(postRef, { privacy: newPrivacy });
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

// --- Comment Functions ---
export const addComment = async (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    const commentsRef = ref(db, 'comments');
    const newCommentRef = push(commentsRef);
    
    const newComment: Comment = {
        ...commentData,
        id: newCommentRef.key!,
        timestamp: Date.now(),
    };
    
    await set(newCommentRef, newComment);
    
    const postCommentCountRef = ref(db, `posts/${commentData.postId}/commentCount`);
    await runTransaction(postCommentCountRef, (currentCount) => (currentCount || 0) + 1);

    if (commentData.parentCommentId) {
        const parentCommentReplyCountRef = ref(db, `comments/${commentData.parentCommentId}/replyCount`);
        await runTransaction(parentCommentReplyCountRef, (currentCount) => (currentCount || 0) + 1);
    }
};

export const fetchComments = async (postId: string): Promise<Comment[]> => {
    const commentsRef = ref(db, 'comments');
    const commentsQuery = query(
        commentsRef, 
        orderByChild('postId'), 
        equalTo(postId)
    );
    
    const snapshot = await get(commentsQuery);
    if (!snapshot.exists()) return [];
    
    let allComments = Object.values(snapshot.val()) as Comment[];
    
    allComments.sort((a, b) => a.timestamp - b.timestamp);
    
    return allComments;
};


export const fetchReplies = async (commentId: string): Promise<Comment[]> => {
    const repliesRef = ref(db, 'comments');
    const repliesQuery = query(repliesRef, orderByChild('parentCommentId'), equalTo(commentId));
    
    const snapshot = await get(repliesQuery);
    if (!snapshot.exists()) return [];
    
    const replies = Object.values(snapshot.val()) as Comment[];
    return replies.sort((a, b) => a.timestamp - b.timestamp);
};


export const seedDatabase = async () => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) {
    console.log('Database is empty. Ready for new users.');
  }
};
