import { Search, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { SearchModal } from '@/components/SearchModal';

interface HeaderBarProps {
  onCreatePost: () => void;
}

export function HeaderBar({ onCreatePost }: HeaderBarProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 md:py-4 hidden md:flex items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-xs lg:max-w-sm xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
          <Input
            placeholder="Search BuzzTalks..."
            className="pl-9 lg:pl-10 rounded-full border-border text-sm lg:text-base"
            onClick={() => setSearchModalOpen(true)}
            readOnly
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <button className="p-2 rounded-full hover:bg-muted transition-smooth relative">
            <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-muted transition-smooth relative">
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          <Button
            onClick={onCreatePost}
            className="gradient-primary text-primary-foreground rounded-full px-4 lg:px-6 shadow-card hover:shadow-hover transition-smooth text-sm lg:text-base"
          >
            <span className="hidden sm:inline">Add Post</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </div>
      </header>

      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
