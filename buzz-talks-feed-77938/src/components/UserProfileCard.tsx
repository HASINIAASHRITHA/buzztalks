import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFollow, useUserProfile, useUserPosts } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageCircle, Grid3X3 } from 'lucide-react';
import { useConversations } from '@/hooks/useFirestore';

interface UserProfileCardProps {
  userId: string;
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { posts, loading: postsLoading } = useUserPosts(userId);
  const { follow, unfollow, isFollowing: checkIsFollowing } = useFollow();
  const { createOrGetConversation } = useConversations();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    if (user && userId && !isOwnProfile) {
      checkIsFollowing(userId).then(setIsFollowing);
    }
  }, [user, userId, isOwnProfile]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollow(userId);
        setIsFollowing(false);
      } else {
        await follow(userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const conversationId = await createOrGetConversation(userId);
      navigate(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error('Message error:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">User not found</div>;
  }

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
      {/* Profile Header */}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">
          <img
            src={profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={profile.username}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary/20 flex-shrink-0"
          />
          
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate max-w-full">{profile.username}</h1>
              
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    variant={isFollowing ? 'outline' : 'default'}
                    className={`text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 ${!isFollowing ? 'gradient-primary text-primary-foreground' : ''}`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      'Unfollow'
                    ) : (
                      'Follow'
                    )}
                  </Button>
                  <Button onClick={handleMessage} variant="outline" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-4">
                    <MessageCircle className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Message</span>
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <Button onClick={() => navigate('/profile')} variant="outline" className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 md:gap-8 mb-3 sm:mb-4">
              <div className="text-center">
                <p className="font-bold text-base sm:text-lg">{posts.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base sm:text-lg">{profile.followersCount || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base sm:text-lg">{profile.followingCount || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && <p className="text-xs sm:text-sm">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-primary hover:underline block truncate"
              >
                {profile.website}
              </a>
            )}
            {profile.location && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">📍 {profile.location}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t border-border">
        <div className="flex justify-center py-2 sm:py-3">
          <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold touch-target">
            <Grid3X3 className="w-4 h-4" />
            Posts
          </button>
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-6 sm:py-8">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm">No posts yet</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 sm:gap-1">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square relative group cursor-pointer">
                <img
                  src={post.mediaUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    ❤️ {post.likes?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {post.commentsCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
