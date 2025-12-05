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
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-muted-foreground">User not found</div>;
  }

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Profile Header */}
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
          />
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    variant={isFollowing ? 'outline' : 'default'}
                    className={!isFollowing ? 'gradient-primary text-primary-foreground' : ''}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      'Unfollow'
                    ) : (
                      'Follow'
                    )}
                  </Button>
                  <Button onClick={handleMessage} variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <Button onClick={() => navigate('/profile')} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8 mb-4">
              <div className="text-center">
                <p className="font-bold text-lg">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.followersCount || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.followingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {profile.website}
              </a>
            )}
            {profile.location && (
              <p className="text-sm text-muted-foreground mt-1">📍 {profile.location}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t border-border">
        <div className="flex justify-center py-3">
          <button className="flex items-center gap-2 text-sm font-semibold">
            <Grid3X3 className="w-4 h-4" />
            Posts
          </button>
        </div>

        {postsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No posts yet</div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square relative group cursor-pointer">
                <img
                  src={post.mediaUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
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
