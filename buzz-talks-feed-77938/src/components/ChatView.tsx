import { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uploadToCloudinary } from '@/lib/cloudinary';
import type { UserProfile } from '@/types/firebase';

interface ChatViewProps {
  conversationId: string;
  otherUser: UserProfile;
  onBack: () => void;
}

export function ChatView({ conversationId, otherUser, onBack }: ChatViewProps) {
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await sendMessage(newMessage);
    setNewMessage('');
    setSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const mediaUrl = await uploadToCloudinary(file);
      await sendMessage('Sent an image', mediaUrl);
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-border">
        <button onClick={onBack} className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-smooth touch-target">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <img
          src={otherUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
          alt={otherUser?.username}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm sm:text-base truncate">{otherUser?.username || 'Unknown'}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.uid;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    {message.mediaUrl && (
                      <img
                        src={message.mediaUrl}
                        alt="Shared"
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    <p className="text-xs sm:text-sm">{message.content}</p>
                    <p
                      className={`text-[10px] sm:text-xs mt-1 ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border safe-area-inset">
        <div className="flex gap-1.5 sm:gap-2">
          <label className="cursor-pointer flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <Button type="button" variant="outline" size="icon" disabled={uploading} asChild className="h-9 w-9 sm:h-10 sm:w-10">
              <span>
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </span>
            </Button>
          </label>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm sm:text-base h-9 sm:h-10"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending} size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
