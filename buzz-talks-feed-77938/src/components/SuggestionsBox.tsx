import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Suggestion {
  id: string;
  name: string;
  avatar: string;
  followers: string;
}

export function SuggestionsBox() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user) return;
      
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('userId', '!=', user.uid),
          limit(5)
        );
        const snapshot = await getDocs(usersQuery);
        
        const suggestionsData: Suggestion[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().username || 'User',
          avatar: doc.data().avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`,
          followers: '0',
        }));
        
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };

    loadSuggestions();
  }, [user]);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl shadow-card p-3 sm:p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="font-semibold text-muted-foreground text-xs sm:text-sm">Suggestions For You</h2>
        <button className="text-[10px] sm:text-xs font-semibold hover:text-muted-foreground transition-smooth">
          See All
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {suggestions.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{user.followers} followers</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary font-semibold hover:bg-muted text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8 flex-shrink-0"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
