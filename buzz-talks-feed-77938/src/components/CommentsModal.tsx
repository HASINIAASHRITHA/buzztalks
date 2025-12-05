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
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first!
            </div>
          ) : (
            <div className="space-y-4">
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
                    <div key={reply.id} className="ml-10">
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

        <form onSubmit={handleSubmit} className="pt-4 border-t border-border">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
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
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newComment.trim() || submitting} size="icon">
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
    <div className="flex gap-3">
      <img
        src={comment.author?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
        alt={comment.author?.username}
        className={`rounded-full object-cover ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="font-semibold text-sm">{comment.author?.username || 'Unknown'}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          <button onClick={onLike} className={`flex items-center gap-1 hover:text-foreground ${isLiked ? 'text-destructive' : ''}`}>
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            {comment.likes?.length || 0}
          </button>
          <button onClick={onReply} className="flex items-center gap-1 hover:text-foreground">
            <Reply className="w-3 h-3" />
            Reply
          </button>
          {isAuthor && (
            <button onClick={onDelete} className="text-destructive hover:text-destructive/80">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
