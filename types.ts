export interface User {
  id: string; // Firebase Auth UID
  name?: string;
  handle?: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  coverPhotoUrl?: string;
  bio?: string;
  isPublic?: boolean;
  friends?: Record<string, boolean>; // Record of friend user IDs
  isBanned?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[]; // Changed from mediaUrl to support multiple images
  mediaType?: 'video'; // Only used for the legacy video post
  timestamp: number;
  likes: number;
  comments: number;
  tag?: string;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: number; // Added timestamp for sorting stories
}