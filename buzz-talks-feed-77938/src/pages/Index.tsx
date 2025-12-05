import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { StoryCarousel } from '@/components/StoryCarousel';
import { FeedCard } from '@/components/FeedCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { SuggestionsBox } from '@/components/SuggestionsBox';
import { Loader2 } from 'lucide-react';

interface Post {
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

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadCurrentUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setCurrentUserProfile(userDoc.data() as UserProfile);
      }
    };

    loadCurrentUser();

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      setPosts(postsData);

      const authorIds = [...new Set(postsData.map(p => p.authorId))];
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <StoryCarousel />
              
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No posts yet. Be the first to share something!
                  </div>
                ) : (
                  posts.map((post) => {
                    const profile = userProfiles[post.authorId] || { username: 'Unknown', avatarUrl: '' };
                    return (
                      <FeedCard
                        key={post.id}
                        postId={post.id}
                        user={{
                          name: profile.username,
                          avatar: profile.avatarUrl
                        }}
                        image={post.mediaUrl}
                        caption={post.caption}
                        likes={post.likes}
                        comments={post.commentsCount}
                        timeAgo={new Date(post.createdAt).toLocaleDateString()}
                        authorId={post.authorId}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                {/* User Profile Card */}
                <div className="bg-card rounded-2xl shadow-card p-5 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={currentUserProfile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="Your profile"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{currentUserProfile?.username || 'Loading...'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-center text-sm">
                    <div>
                      <p className="font-bold">{posts.filter(p => p.authorId === user?.uid).length}</p>
                      <p className="text-muted-foreground text-xs">Posts</p>
                    </div>
                    <div>
                      <p className="font-bold">0</p>
                      <p className="text-muted-foreground text-xs">Followers</p>
                    </div>
                    <div>
                      <p className="font-bold">0</p>
                      <p className="text-muted-foreground text-xs">Following</p>
                    </div>
                  </div>
                </div>

                <SuggestionsBox />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />
    </div>
  );
};

export default Index;
