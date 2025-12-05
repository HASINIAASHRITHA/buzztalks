import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useStories } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';

interface AddStoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddStoryModal({ open, onClose }: AddStoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { addStory } = useStories();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePost = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const mediaUrl = await uploadToCloudinary(file);
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      await addStory(mediaUrl, mediaType);

      toast({
        title: "Story added!",
        description: "Your story has been shared for 24 hours.",
      });

      setFile(null);
      setPreview('');
      onClose();
    } catch (error: any) {
      console.error('Story upload error:', error);
      toast({
        title: "Upload failed",
        description: error?.message || "Could not upload story.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Add to Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {!preview ? (
            <label className="flex flex-col items-center justify-center h-48 sm:h-56 md:h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-smooth touch-target">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm text-muted-foreground text-center px-4">Click to upload photo or video</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">Stories disappear after 24 hours</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative">
              {file?.type.startsWith('video/') ? (
                <video
                  src={preview}
                  controls
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl"
                />
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="absolute top-2 right-2 p-1.5 sm:p-2 bg-background rounded-full shadow-card hover:shadow-hover transition-smooth touch-target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={loading || !file}
              className="gradient-primary text-primary-foreground text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Uploading...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                'Share Story'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
