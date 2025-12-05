// Firebase data types for the application

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  website?: string;
  location?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  hashtags: string[];
  location?: string;
  likes: string[];
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // For threaded replies
  likes: string[];
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  viewedBy: string[];
  createdAt: string;
  expiresAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention';
  postId?: string;
  commentId?: string;
  content?: string;
  read: boolean;
  createdAt: string;
}
