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
  blocked?: Record<string, boolean>; // Record of blocked user IDs
  isVerified?: boolean;
  badgeUrl?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[]; // Changed from mediaUrl to support multiple images
  mediaType?: 'video'; // Only used for the legacy video post
  timestamp: number;
  reactions?: Record<string, Record<string, boolean>>; // e.g. { like: { userId1: true } }
  commentCount: number;
  tag?: string;
  isPublic?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  timestamp: number;
  parentCommentId?: string; // for replies
  reactions?: Record<string, Record<string, boolean>>; // { like: { userId1: true } }
  replyCount?: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'like' | 'comment' | 'reply' | 'mention' | 'friend_request';
  postId?: string;
  commentId?: string;
  read: boolean;
  timestamp: number;
}


export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: number; // Added timestamp for sorting stories
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverPhotoUrl: string;
  avatarUrl: string;
  creatorId: string;
  members: Record<string, 'admin' | 'member'>;
  isPublic: boolean;
  timestamp: number;
}

export interface Channel {
  id:string;
  name: string;
  description: string;
  avatarUrl: string;
  creatorId: string;
  subscribers: Record<string, boolean>;
  isVerified?: boolean;
  timestamp: number;
}