import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/useFirestore';
import { Search, Hash, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import debounce from '@/lib/debounce';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { results, loading, search } = useSearch();
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      search(value);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
    onClose();
  };

  const handleHashtagClick = (tag: string) => {
    navigate(`/explore?hashtag=${encodeURIComponent(tag)}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={handleChange}
              placeholder="Search users or #hashtags..."
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Users */}
                {results.users.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Users</h3>
                    <div className="space-y-2">
                      {results.users.map((user) => (
                        <button
                          key={user.userId}
                          onClick={() => handleUserClick(user.userId)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-smooth"
                        >
                          <img
                            src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="text-left">
                            <p className="font-semibold">{user.username}</p>
                            {user.bio && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {results.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Hashtags</h3>
                    <div className="space-y-2">
                      {results.hashtags.map(({ tag, count }) => (
                        <button
                          key={tag}
                          onClick={() => handleHashtagClick(tag)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-smooth"
                        >
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Hash className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">#{tag}</p>
                            <p className="text-sm text-muted-foreground">{count} posts</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {query && !loading && results.users.length === 0 && results.hashtags.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found for "{query}"
                  </div>
                )}

                {/* Initial state */}
                {!query && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Search for users or hashtags</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
