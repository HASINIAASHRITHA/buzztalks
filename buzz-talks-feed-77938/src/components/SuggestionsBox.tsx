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
    <div className="bg-card rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-muted-foreground text-sm">Suggestions For You</h2>
        <button className="text-xs font-semibold hover:text-muted-foreground transition-smooth">
          See All
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.followers} followers</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary font-semibold hover:bg-muted"
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
