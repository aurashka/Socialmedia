export interface User {
  id: string;
  name: string;
  avatarUrl: string;
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
