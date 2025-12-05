import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { CreatePostModal } from '@/components/CreatePostModal';
import { ChatView } from '@/components/ChatView';
import { MessageCircle, Search, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConversations } from '@/hooks/useFirestore';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { SearchModal } from '@/components/SearchModal';

export default function Messages() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { conversations, loading } = useConversations();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedConversationId = searchParams.get('conversation');
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversationId: string) => {
    setSearchParams({ conversation: conversationId });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden h-[calc(100vh-180px)]">
            {selectedConversation ? (
              <ChatView
                conversationId={selectedConversation.id}
                otherUser={selectedConversation.otherUser}
                onBack={handleBack}
              />
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      <MessageCircle className="w-6 h-6" />
                      Messages
                    </h1>
                    <Button
                      onClick={() => setSearchModalOpen(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="divide-y divide-border overflow-y-auto h-[calc(100%-140px)]">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                      <p className="text-muted-foreground mb-4">Start a conversation with someone!</p>
                      <Button onClick={() => setSearchModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Message
                      </Button>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className="w-full p-4 hover:bg-muted/50 transition-smooth flex items-center gap-4 text-left"
                      >
                        <div className="relative">
                          <img
                            src={conversation.otherUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={conversation.otherUser?.username}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold truncate">
                              {conversation.otherUser?.username || 'Unknown'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {conversation.lastMessageAt &&
                                formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                  addSuffix: true,
                                })}
                            </span>
                          </div>
                          <p className="text-sm truncate text-muted-foreground">
                            {conversation.lastSenderId === user?.uid ? 'You: ' : ''}
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />

      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}
