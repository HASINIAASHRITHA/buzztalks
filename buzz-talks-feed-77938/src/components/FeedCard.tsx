import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Flame, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CommentsModal } from '@/components/CommentsModal';

interface FeedCardProps {
  postId: string;
  user: {
    name: string;
    avatar: string;
  };
  image: string;
  caption: string;
  likes: string[];
  comments: number;
  timeAgo: string;
  authorId: string;
}

export function FeedCard({ postId, user, image, caption, likes: initialLikes, comments: initialComments, timeAgo, authorId }: FeedCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [liked, setLiked] = useState(initialLikes.includes(currentUser?.uid || ''));
  const [likeCount, setLikeCount] = useState(initialLikes.length);
  const [saved, setSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isTrending, setIsTrending] = useState(initialLikes.length > 50);

  // Real-time listener for post updates (likes and comments)
  useEffect(() => {
    const postRef = doc(db, 'posts', postId);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const newLikes = data.likes || [];
        setLikes(newLikes);
        setLikeCount(newLikes.length);
        setLiked(newLikes.includes(currentUser?.uid || ''));
        setCommentCount(data.commentsCount || 0);
        // Update trending status in real-time
        setIsTrending(newLikes.length > 50);
      }
    });

    return () => unsubscribe();
  }, [postId, currentUser?.uid]);

  const handleLike = async () => {
    if (!currentUser) return;

    // Show animation immediately for instant feedback
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);

    try {
      const postRef = doc(db, 'posts', postId);
      
      if (liked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);

        // Create notification for post author (if not self)
        if (authorId !== currentUser.uid) {
          const { addDoc, collection } = await import('firebase/firestore');
          await addDoc(collection(db, 'notifications'), {
            userId: authorId,
            fromUserId: currentUser.uid,
            type: 'like',
            postId,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (error: any) {
      console.error('Error updating like:', error);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || currentUser.uid !== authorId) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'posts', postId));
      toast({
        title: "Post deleted",
        description: "Your post has been removed successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserClick = () => {
    navigate(`/user/${authorId}`);
  };

  // Parse hashtags from caption
  const renderCaption = () => {
    const parts = caption.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <button
            key={i}
            onClick={() => navigate(`/explore?hashtag=${encodeURIComponent(part.slice(1))}`)}
            className="text-primary hover:underline"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <>
      <article className="bg-card rounded-xl sm:rounded-2xl shadow-card overflow-hidden mb-4 sm:mb-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4">
          <button onClick={handleUserClick} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-smooth">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-xs sm:text-sm">{user.name}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </button>
          {currentUser?.uid === authorId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-smooth">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Image - responsive aspect ratio */}
        <div className="relative aspect-square sm:aspect-[4/5] md:aspect-square bg-muted overflow-hidden group cursor-pointer">
          <img
            src={image}
            alt="Post"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onDoubleClick={handleLike}
            onClick={handleLike}
            loading="lazy"
          />

          {/* Trending Badge */}
          {isTrending && (
            <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
              <Flame className="w-3 h-3" />
              Trending
            </div>
          )}

          {/* Like Animation */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="animate-ping">
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-pink-500 text-pink-500 opacity-75" />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleLike}
                className={`hover-scale transition-transform duration-200 ${liked ? 'scale-110' : ''}`}
              >
                <div className="relative">
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${liked ? 'fill-destructive text-destructive' : ''}`}
                  />
                </div>
              </button>
              <button className="hover-scale relative" onClick={() => setCommentsOpen(true)}>
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                {commentCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {commentCount > 9 ? '9+' : commentCount}
                  </span>
                )}
              </button>
              <button className="hover-scale">
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className="hover-scale"
            >
              <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${saved ? 'fill-foreground' : ''}`} />
            </button>
          </div>

          {/* Likes */}
          <p className="font-semibold text-xs sm:text-sm">
            {likeCount} likes
          </p>

          {/* Caption */}
          <div className="text-xs sm:text-sm">
            <button onClick={handleUserClick} className="font-semibold mr-2 hover:underline">
              {user.name}
            </button>
            <span className="text-foreground">{renderCaption()}</span>
          </div>

          {/* Comments */}
          {commentCount > 0 && (
            <button 
              onClick={() => setCommentsOpen(true)}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              View all {commentCount} comments
            </button>
          )}
        </div>
      </article>

      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={postId}
      />
    </>
  );
}
