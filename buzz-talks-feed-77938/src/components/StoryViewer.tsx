import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Story, UserProfile } from '@/types/firebase';
import { useStories } from '@/hooks/useFirestore';

interface StoryViewerProps {
  open: boolean;
  onClose: () => void;
  stories: (Story & { author: UserProfile })[];
  initialIndex?: number;
}

export function StoryViewer({ open, onClose, stories, initialIndex = 0 }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const { viewStory } = useStories();

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!open || !currentStory) return;

    // Mark story as viewed
    viewStory(currentStory.id);

    // Auto-advance progress
    const duration = currentStory.mediaType === 'video' ? 15000 : 5000;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return prev;
          }
        }
        return prev + 100 / (duration / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [open, currentIndex, currentStory]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none overflow-hidden">
        <div className="relative aspect-[9/16] max-h-[80vh]">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.author?.avatarUrl}
                alt={currentStory.author?.username}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <span className="text-white font-semibold text-sm">
                {currentStory.author?.username}
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media */}
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
