import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComments } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Send, Trash2, Loader2, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
}

export function CommentsModal({ open, onClose, postId }: CommentsModalProps) {
  const { comments, loading, addComment, likeComment, deleteComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    await addComment(newComment, replyingTo || undefined);
    setNewComment('');
    setReplyingTo(null);
    setSubmitting(false);
  };

  const parentComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 sm:pr-4">
          {loading ? (
            <div className="flex justify-center py-6 sm:py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              No comments yet. Be the first!
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {parentComments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <CommentItem
                    comment={comment}
                    onLike={() => likeComment(comment.id)}
                    onDelete={() => deleteComment(comment.id)}
                    onReply={() => setReplyingTo(comment.id)}
                    currentUserId={user?.uid}
                  />
                  
                  {/* Replies */}
                  {getReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="ml-6 sm:ml-10">
                      <CommentItem
                        comment={reply}
                        onLike={() => likeComment(reply.id)}
                        onDelete={() => deleteComment(reply.id)}
                        onReply={() => setReplyingTo(comment.id)}
                        currentUserId={user?.uid}
                        isReply
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="pt-3 sm:pt-4 border-t border-border safe-area-inset">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 text-xs sm:text-sm text-muted-foreground">
              <span>Replying to comment...</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-primary hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-1.5 sm:gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm h-9 sm:h-10"
            />
            <Button type="submit" disabled={!newComment.trim() || submitting} size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CommentItemProps {
  comment: any;
  onLike: () => void;
  onDelete: () => void;
  onReply: () => void;
  currentUserId?: string;
  isReply?: boolean;
}

function CommentItem({ comment, onLike, onDelete, onReply, currentUserId, isReply }: CommentItemProps) {
  const isLiked = comment.likes?.includes(currentUserId);
  const isAuthor = comment.authorId === currentUserId;

  return (
    <div className="flex gap-2 sm:gap-3">
      <img
        src={comment.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
        alt={comment.author?.username}
        className={`rounded-full object-cover flex-shrink-0 ${isReply ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
          <p className="font-semibold text-xs sm:text-sm">{comment.author?.username || 'Unknown'}</p>
          <p className="text-xs sm:text-sm break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 mt-1 text-[10px] sm:text-xs text-muted-foreground">
          <span className="truncate max-w-[80px] sm:max-w-none">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          <button onClick={onLike} className={`flex items-center gap-1 hover:text-foreground touch-target ${isLiked ? 'text-destructive' : ''}`}>
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            {comment.likes?.length || 0}
          </button>
          <button onClick={onReply} className="flex items-center gap-1 hover:text-foreground touch-target">
            <Reply className="w-3 h-3" />
            <span className="hidden xs:inline">Reply</span>
          </button>
          {isAuthor && (
            <button onClick={onDelete} className="text-destructive hover:text-destructive/80 touch-target">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
