import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile, Comment, Notification, Follow, Conversation, Message, Story } from '@/types/firebase';

// Follow/Unfollow
export function useFollow() {
  const { user } = useAuth();

  const follow = async (targetUserId: string) => {
    if (!user) return;

    const batch = writeBatch(db);
    
    // Add follow document
    const followRef = doc(collection(db, 'follows'));
    batch.set(followRef, {
      followerId: user.uid,
      followingId: targetUserId,
      createdAt: new Date().toISOString(),
    });

    // Update follower's following count
    const followerRef = doc(db, 'users', user.uid);
    batch.update(followerRef, { followingCount: increment(1) });

    // Update target's followers count
    const targetRef = doc(db, 'users', targetUserId);
    batch.update(targetRef, { followersCount: increment(1) });

    // Create notification
    const notificationRef = doc(collection(db, 'notifications'));
    batch.set(notificationRef, {
      userId: targetUserId,
      fromUserId: user.uid,
      type: 'follow',
      read: false,
      createdAt: new Date().toISOString(),
    });

    await batch.commit();
  };

  const unfollow = async (targetUserId: string) => {
    if (!user) return;

    const batch = writeBatch(db);

    // Find and delete follow document
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', user.uid),
      where('followingId', '==', targetUserId)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Update counts
    const followerRef = doc(db, 'users', user.uid);
    batch.update(followerRef, { followingCount: increment(-1) });

    const targetRef = doc(db, 'users', targetUserId);
    batch.update(targetRef, { followersCount: increment(-1) });

    await batch.commit();
  };

  const isFollowing = async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;

    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', user.uid),
      where('followingId', '==', targetUserId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  return { follow, unfollow, isFollowing };
}

// Comments
export function useComments(postId: string) {
  const [comments, setComments] = useState<(Comment & { author: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Comment));

      // Fetch author profiles
      const authorIds = [...new Set(commentsData.map((c) => c.authorId))];
      const profiles: Record<string, UserProfile> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          const userDoc = await getDoc(doc(db, 'users', authorId));
          if (userDoc.exists()) {
            profiles[authorId] = userDoc.data() as UserProfile;
          }
        })
      );

      setComments(
        commentsData.map((c) => ({
          ...c,
          author: profiles[c.authorId],
        }))
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user || !content.trim()) return;

    const commentRef = await addDoc(collection(db, 'comments'), {
      postId,
      authorId: user.uid,
      content: content.trim(),
      parentId: parentId || null,
      likes: [],
      createdAt: new Date().toISOString(),
    });

    // Update post's comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { commentsCount: increment(1) });

    // Get post author for notification
    const postDoc = await getDoc(postRef);
    if (postDoc.exists() && postDoc.data().authorId !== user.uid) {
      await addDoc(collection(db, 'notifications'), {
        userId: postDoc.data().authorId,
        fromUserId: user.uid,
        type: 'comment',
        postId,
        commentId: commentRef.id,
        content: content.substring(0, 100),
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    return commentRef.id;
  };

  const likeComment = async (commentId: string) => {
    if (!user) return;

    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (commentDoc.exists()) {
      const likes = commentDoc.data().likes || [];
      if (likes.includes(user.uid)) {
        await updateDoc(commentRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(commentRef, { likes: arrayUnion(user.uid) });
      }
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    await deleteDoc(doc(db, 'comments', commentId));
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { commentsCount: increment(-1) });
  };

  return { comments, loading, addComment, likeComment, deleteComment };
}

// Notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<(Notification & { fromUser: UserProfile })[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Notification));

      // Fetch from user profiles
      const fromUserIds = [...new Set(notificationsData.map((n) => n.fromUserId))];
      const profiles: Record<string, UserProfile> = {};

      await Promise.all(
        fromUserIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data() as UserProfile;
          }
        })
      );

      const enrichedNotifications = notificationsData.map((n) => ({
        ...n,
        fromUser: profiles[n.fromUserId],
      }));

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter((n) => !n.read).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const batch = writeBatch(db);
    notifications
      .filter((n) => !n.read)
      .forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
    await batch.commit();
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

// Direct Messages
export function useConversations() {
  const [conversations, setConversations] = useState<(Conversation & { otherUser: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Conversation));

      // Fetch other user profiles
      const otherUserIds = conversationsData.map((c) =>
        c.participants.find((p) => p !== user.uid)
      );
      const profiles: Record<string, UserProfile> = {};

      await Promise.all(
        otherUserIds.map(async (userId) => {
          if (!userId) return;
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data() as UserProfile;
          }
        })
      );

      setConversations(
        conversationsData.map((c) => ({
          ...c,
          otherUser: profiles[c.participants.find((p) => p !== user.uid) || ''],
        }))
      );

      // Calculate total unread messages count
      let totalUnread = 0;
      await Promise.all(
        conversationsData.map(async (conversation) => {
          const messagesQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', conversation.id),
            where('read', '==', false),
            where('senderId', '!=', user.uid)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          totalUnread += messagesSnapshot.size;
        })
      );
      setUnreadMessagesCount(totalUnread);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createOrGetConversation = async (otherUserId: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    // Check if conversation exists
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
    const snapshot = await getDocs(q);
    
    const existing = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.participants.includes(otherUserId);
    });

    if (existing) return existing.id;

    // Create new conversation
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants: [user.uid, otherUserId],
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      lastSenderId: '',
      createdAt: new Date().toISOString(),
    });

    return conversationRef.id;
  };

  return { conversations, loading, createOrGetConversation, unreadMessagesCount };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      
      setMessages(messagesData);

      // Mark unread messages from other users as read
      const unreadMessages = messagesData.filter(
        (msg) => msg.senderId !== user?.uid && !msg.read
      );

      if (unreadMessages.length > 0) {
        const batch = writeBatch(db);
        unreadMessages.forEach((msg) => {
          batch.update(doc(db, 'messages', msg.id), { read: true });
        });
        await batch.commit();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId, user?.uid]);

  const sendMessage = async (content: string, mediaUrl?: string) => {
    if (!user || (!content.trim() && !mediaUrl)) return;

    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId: user.uid,
      content: content.trim(),
      mediaUrl: mediaUrl || null,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Update conversation
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: (mediaUrl && !content.trim()) ? "📸 Image" : content.trim(),
      lastMessageAt: new Date().toISOString(),
      lastSenderId: user.uid,
    });

    // Create notification for other participant
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
    if (conversationDoc.exists()) {
      const otherUserId = conversationDoc.data().participants.find((p: string) => p !== user.uid);
      if (otherUserId) {
        await addDoc(collection(db, 'notifications'), {
          userId: otherUserId,
          fromUserId: user.uid,
          type: 'message',
          content: (mediaUrl && !content.trim()) ? "📸 Sent you an image" : content.substring(0, 100),
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  return { messages, loading, sendMessage };
}

// Stories
export function useStories() {
  const [stories, setStories] = useState<Map<string, (Story & { author: UserProfile })[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const q = query(
      collection(db, 'stories'),
      where('createdAt', '>=', twentyFourHoursAgo),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const storiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Story));

      // Fetch author profiles
      const authorIds = [...new Set(storiesData.map((s) => s.authorId))];
      const profiles: Record<string, UserProfile> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          const userDoc = await getDoc(doc(db, 'users', authorId));
          if (userDoc.exists()) {
            profiles[authorId] = userDoc.data() as UserProfile;
          }
        })
      );

      // Group stories by author
      const grouped = new Map<string, (Story & { author: UserProfile })[]>();
      storiesData.forEach((story) => {
        const enriched = { ...story, author: profiles[story.authorId] };
        if (!grouped.has(story.authorId)) {
          grouped.set(story.authorId, []);
        }
        grouped.get(story.authorId)!.push(enriched);
      });

      setStories(grouped);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addStory = async (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!user) return;

    await addDoc(collection(db, 'stories'), {
      authorId: user.uid,
      mediaUrl,
      mediaType,
      viewedBy: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    await updateDoc(doc(db, 'stories', storyId), {
      viewedBy: arrayUnion(user.uid),
    });
  };

  return { stories, loading, addStory, viewStory };
}

// Search
export function useSearch() {
  const [results, setResults] = useState<{
    users: UserProfile[];
    hashtags: { tag: string; count: number }[];
  }>({ users: [], hashtags: [] });
  const [loading, setLoading] = useState(false);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults({ users: [], hashtags: [] });
      return;
    }

    setLoading(true);
    const searchLower = query.toLowerCase();

    try {
      // Search users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs
        .map((doc) => doc.data() as UserProfile)
        .filter(
          (user) =>
            user.username?.toLowerCase().includes(searchLower) ||
            user.bio?.toLowerCase().includes(searchLower)
        )
        .slice(0, 10);

      // Search hashtags in posts
      if (query.startsWith('#')) {
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const hashtagCounts: Record<string, number> = {};
        
        postsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const tags = data.hashtags || [];
          tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(searchLower.replace('#', ''))) {
              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            }
          });
        });

        const hashtags = Object.entries(hashtagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setResults({ users, hashtags });
      } else {
        setResults({ users, hashtags: [] });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, search };
}

// User profile by ID
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { profile, loading };
}

// User posts
export function useUserPosts(userId: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { posts, loading };
}
