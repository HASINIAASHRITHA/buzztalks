import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { CreatePostModal } from '@/components/CreatePostModal';
import { SearchModal } from '@/components/SearchModal';
import { Compass, Search, Loader2, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Explore() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hashtag = searchParams.get('hashtag');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let q;
        if (hashtag) {
          // Filter by hashtag
          q = query(
            collection(db, 'posts'),
            where('hashtags', 'array-contains', hashtag),
            orderBy('createdAt', 'desc')
          );
        } else {
          // Get all posts sorted by likes count (popular)
          q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...(docSnapshot.data() as Record<string, any>),
        }));

        // Sort by likes if not filtering by hashtag
        if (!hashtag) {
          postsData.sort((a: any, b: any) => (b.likes?.length || 0) - (a.likes?.length || 0));
        }

        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [hashtag]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      {/* Main content area with responsive margins */}
      <div className="min-h-screen pt-14 pb-20 md:pt-0 md:pb-0 md:ml-[72px] lg:ml-64">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          {/* Header with Search */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
              {hashtag ? (
                <>
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">{hashtag}</span>
                </>
              ) : (
                'Explore'
              )}
            </h1>
            <button
              onClick={() => setSearchModalOpen(true)}
              className="relative w-full max-w-xl"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, users, tags..."
                className="pl-9 sm:pl-10 cursor-pointer text-sm sm:text-base h-9 sm:h-10"
                readOnly
              />
            </button>
          </div>

          {/* Grid of Posts - responsive grid */}
          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Compass className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {hashtag ? `No posts with #${hashtag}` : 'No posts to explore'}
              </h3>
              <p className="text-sm text-muted-foreground">Check back later for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 sm:gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square group cursor-pointer overflow-hidden bg-muted"
                >
                  <img
                    src={post.mediaUrl}
                    alt="Post"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 sm:gap-4 md:gap-6 text-white">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold">{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold">{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />

      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}
