import { Search, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderBarProps {
  onCreatePost: () => void;
}

export function HeaderBar({ onCreatePost }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search BuzzTalks..."
          className="pl-10 rounded-full border-border"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-muted transition-smooth relative">
          <Heart className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        
        <button className="p-2 rounded-full hover:bg-muted transition-smooth relative">
          <MessageCircle className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <Button
          onClick={onCreatePost}
          className="gradient-primary text-primary-foreground rounded-full px-6 shadow-card hover:shadow-hover transition-smooth"
        >
          Add Post
        </Button>
      </div>
    </header>
  );
}
