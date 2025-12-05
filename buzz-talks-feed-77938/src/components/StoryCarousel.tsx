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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, [stories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (stories.length === 0) return null;

  return (
    <div className="relative bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-card mb-4 sm:mb-6">
      {/* Left Arrow - hidden on mobile, shown on hover for larger screens */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-background rounded-full p-1.5 sm:p-2 shadow-card hover:shadow-hover transition-smooth hidden sm:block"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth touch-pan-x"
      >
        {stories.map((story) => (
          <button
            key={story.id}
            className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-fit group"
          >
            <div className={`p-0.5 sm:p-1 rounded-full ${story.hasStory ? 'gradient-story' : 'bg-muted'} hover-scale`}>
              <div className="p-0.5 bg-background rounded-full">
                <img
                  src={story.avatar}
                  alt={story.user}
                  className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground max-w-[60px] sm:max-w-[70px] truncate">
              {story.user}
            </span>
          </button>
        ))}
      </div>

      {/* Right Arrow - hidden on mobile */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-background rounded-full p-1.5 sm:p-2 shadow-card hover:shadow-hover transition-smooth hidden sm:block"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
