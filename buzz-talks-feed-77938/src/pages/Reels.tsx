import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Heart, MessageCircle, Send, Bookmark, Volume2, VolumeX, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Reel {
  id: string;
  authorId: string;
  mediaUrl: string;
  caption: string;
  likes: string[];
  commentsCount: number;
  createdAt: string;
}

interface UserProfile {
  username: string;
  avatarUrl: string;
}

const Reels = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reels, setReels] = useState<Reel[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reel));

      setReels(reelsData);

      const authorIds = [...new Set(reelsData.map(r => r.authorId))];
      const profiles: Record<string, UserProfile> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          const userDoc = await getDoc(doc(db, 'users', authorId));
          if (userDoc.exists()) {
            profiles[authorId] = userDoc.data() as UserProfile;
          }
        })
      );

      setUserProfiles(profiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.muted = muted;
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, muted]);

  const handleUnmute = () => {
    setHasInteracted(true);
    setMuted(false);
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.muted = false;
      video.play().catch(console.error);
    }
  };

  const handleMuteToggle = () => {
    if (muted && !hasInteracted) {
      handleUnmute();
    } else {
      setMuted(!muted);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / windowHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleLike = async (reelId: string, likes: string[]) => {
    if (!user) return;

    try {
      const reelRef = doc(db, 'reels', reelId);
      const isLiked = likes.includes(user.uid);
      
      if (isLiked) {
        await updateDoc(reelRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(reelRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error: any) {
      console.error('Error updating like:', error);
    }
  };

  const handleDelete = async (reelId: string, authorId: string) => {
    if (!user || user.uid !== authorId) return;

    if (!confirm('Are you sure you want to delete this reel?')) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'reels', reelId));
      toast({
        title: "Reel deleted",
        description: "Your reel has been removed successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting reel:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      
      {/* Main content - full screen for reels on mobile, sidebar offset on larger screens */}
      <div className="h-screen overflow-hidden md:ml-[72px] lg:ml-64">
        {reels.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground px-4 text-center">
            <div>
              <p className="text-sm sm:text-base">No reels yet. Upload a video to get started!</p>
            </div>
          </div>
        ) : (
          <div
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide touch-pan-y"
            onScroll={handleScroll}
          >
            {reels.map((reel, index) => {
              const profile = userProfiles[reel.authorId] || { username: 'Unknown', avatarUrl: '' };
              const isLiked = reel.likes.includes(user?.uid || '');

              return (
                <div
                  key={reel.id}
                  className="h-screen w-full snap-start relative flex items-center justify-center bg-black"
                >
                  {/* Video */}
                  <video
                    ref={(el) => videoRefs.current[index] = el}
                    src={reel.mediaUrl}
                    loop
                    playsInline
                    muted={muted}
                    className="h-full w-full object-contain sm:object-contain max-w-full"
                    onClick={() => {
                      const video = videoRefs.current[index];
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                  />

                  {/* Overlay - User Info */}
                  <div className="absolute bottom-20 sm:bottom-24 md:bottom-20 left-3 sm:left-4 md:left-6 right-16 sm:right-20 md:right-24 text-white">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white"
                      />
                      <span className="font-semibold text-xs sm:text-sm">{profile.username}</span>
                    </div>
                    <p className="text-xs sm:text-sm line-clamp-2">{reel.caption}</p>
                  </div>

                  {/* Delete Button (Top Right) */}
                  {user?.uid === reel.authorId && (
                    <div className="absolute top-16 sm:top-20 md:top-6 right-3 sm:right-4 md:right-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full transition-smooth">
                            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(reel.id, reel.authorId)}
                            disabled={isDeleting}
                            className="text-destructive focus:text-destructive text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete Reel'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {/* Right Actions */}
                  <div className="absolute bottom-20 sm:bottom-24 md:bottom-20 right-2 sm:right-3 md:right-6 flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
                    <button
                      onClick={() => handleLike(reel.id, reel.likes)}
                      className="flex flex-col items-center gap-0.5 sm:gap-1 text-white hover-scale"
                    >
                      <Heart
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${isLiked ? 'fill-destructive text-destructive' : ''}`}
                      />
                      <span className="text-[10px] sm:text-xs font-semibold">{reel.likes.length}</span>
                    </button>

                    <button className="flex flex-col items-center gap-0.5 sm:gap-1 text-white hover-scale">
                      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                      <span className="text-[10px] sm:text-xs font-semibold">{reel.commentsCount}</span>
                    </button>

                    <button className="flex flex-col items-center gap-0.5 sm:gap-1 text-white hover-scale">
                      <Send className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>

                    <button className="flex flex-col items-center gap-0.5 sm:gap-1 text-white hover-scale">
                      <Bookmark className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>

                    <button
                      onClick={handleMuteToggle}
                      className="flex flex-col items-center gap-0.5 sm:gap-1 text-white hover-scale mt-2 sm:mt-4"
                    >
                      {muted ? (
                        <VolumeX className="w-6 h-6 sm:w-7 sm:h-7" />
                      ) : (
                        <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reels;
