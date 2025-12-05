import { useState } from 'react';
import { X, Upload, Loader2, MapPin, Hash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Extract hashtags from caption
  const extractHashtags = (text: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
  };

  const handlePost = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image or video to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to create a post.",
          variant: "destructive",
        });
        return;
      }

      const mediaUrl = await uploadToCloudinary(file);
      const isVideo = file.type.startsWith('video/');
      const hashtags = extractHashtags(caption);
      
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, doc, updateDoc, increment } = await import('firebase/firestore');
      
      const collectionName = isVideo ? 'reels' : 'posts';
      
      await addDoc(collection(db, collectionName), {
        authorId: user.uid,
        mediaUrl,
        mediaType: isVideo ? 'video' : 'image',
        caption,
        hashtags,
        location: location || null,
        likes: [],
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      });

      // Update user's post count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { postsCount: increment(1) });

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });

      setFile(null);
      setPreview('');
      setCaption('');
      setLocation('');
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error?.message || "There was an error uploading your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      setPreview('');
      setCaption('');
      setLocation('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">Create New Post</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Share a photo or video with your followers</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* File Upload */}
          {!preview ? (
            <label className="flex flex-col items-center justify-center h-40 sm:h-52 md:h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-smooth">
              <Upload className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 text-muted-foreground mb-2 sm:mb-3" />
              <span className="text-xs sm:text-sm text-muted-foreground text-center px-4">Click to upload photo or video</span>
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
                  className="w-full h-40 sm:h-52 md:h-64 object-cover rounded-xl"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 sm:h-52 md:h-64 object-cover rounded-xl"
                />
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="absolute top-2 right-2 p-1.5 sm:p-2 bg-background rounded-full shadow-card hover:shadow-hover transition-smooth"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="caption" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
              Caption (use #hashtags)
            </Label>
            <Textarea
              id="caption"
              placeholder="Write a caption... Add #hashtags to reach more people"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[70px] sm:min-h-[80px] md:min-h-[100px] resize-none text-sm"
            />
            {extractHashtags(caption).length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                {extractHashtags(caption).map((tag) => (
                  <span key={tag} className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Location (optional)
            </Label>
            <Input
              id="location"
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
            <Button variant="outline" onClick={handleClose} disabled={loading} className="h-9 sm:h-10 text-sm">
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={loading || !file}
              className="gradient-primary text-primary-foreground h-9 sm:h-10 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Share Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
