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
  bookmarkedPosts?: Record<string, boolean>; // Record of bookmarked post IDs
  onlineStatus?: 'online' | 'offline';
  lastChanged?: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  media?: { url: string; type: 'image' | 'video' }[];
  timestamp: number;
  reactions?: Record<string, Record<string, boolean>>; // e.g. { like: { userId1: true } }
  commentCount: number;
  tag?: string;
  privacy: 'public' | 'friends' | 'private';
  areCommentsDisabled?: boolean;
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
  type: 'like' | 'comment' | 'reply' | 'mention' | 'friend_request' | 'friend_accept';
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

export interface Conversation {
  id: string;
  participants: Record<string, boolean>;
  lastMessage: {
    text?: string;
    mediaType?: 'image' | 'audio' | 'video';
    senderId: string;
    timestamp: number;
  };
  lastRead: Record<string, number>;
  typing?: Record<string, boolean>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  timestamp: number;
  reactions?: Record<string, Record<string, boolean>>; // e.g., { '👍': { userId1: true } }
  replyTo?: {
    messageId: string;
    senderId: string;
    text?: string;
    mediaType?: 'image' | 'audio' | 'video';
  };
  isDeleted?: boolean;
}
