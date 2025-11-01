export interface User {
  id: string; // Firebase Auth UID
  name?: string;
  handle?: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video'; // Keep video for seeded data, but user posts will be 'image'
  timestamp: number;
  likes: number;
  comments: number;
  tag?: string;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
}
