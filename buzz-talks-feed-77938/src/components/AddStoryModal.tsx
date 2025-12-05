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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-smooth">
              <Upload className="w-12 h-12 text-muted-foreground mb-3" />
              <span className="text-sm text-muted-foreground">Click to upload photo or video</span>
              <span className="text-xs text-muted-foreground mt-1">Stories disappear after 24 hours</span>
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
                  className="w-full h-64 object-cover rounded-xl"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="absolute top-2 right-2 p-2 bg-background rounded-full shadow-card hover:shadow-hover transition-smooth"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={loading || !file}
              className="gradient-primary text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
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
