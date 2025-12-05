import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Story {
  id: string;
  user: string;
  avatar: string;
  hasStory: boolean;
}

export function StoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const loadStories = async () => {
      if (!user) return;
      
      try {
        const usersQuery = query(collection(db, 'users'), limit(10));
        const snapshot = await getDocs(usersQuery);
        
        const storiesData: Story[] = snapshot.docs.map(doc => ({
          id: doc.id,
          user: doc.data().username || 'User',
          avatar: doc.data().avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`,
          hasStory: doc.id !== user.uid,
        }));
        
        setStories(storiesData);
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    };

    loadStories();
  }, [user]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (stories.length === 0) return null;

  return (
    <div className="relative bg-card rounded-2xl p-4 shadow-card mb-6">
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background rounded-full p-2 shadow-card hover:shadow-hover transition-smooth"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stories.map((story) => (
          <button
            key={story.id}
            className="flex flex-col items-center gap-2 min-w-fit group"
          >
            <div className={`p-1 rounded-full ${story.hasStory ? 'gradient-story' : 'bg-muted'} hover-scale`}>
              <div className="p-0.5 bg-background rounded-full">
                <img
                  src={story.avatar}
                  alt={story.user}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground max-w-[70px] truncate">
              {story.user}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background rounded-full p-2 shadow-card hover:shadow-hover transition-smooth"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
