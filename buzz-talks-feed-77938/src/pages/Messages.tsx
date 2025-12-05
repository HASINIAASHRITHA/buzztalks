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
      
      {/* Main content area with responsive margins */}
      <div className="min-h-screen pt-14 pb-20 md:pt-0 md:pb-0 md:ml-[72px] lg:ml-64">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6">
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-card overflow-hidden h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]">
            {selectedConversation ? (
              <ChatView
                conversationId={selectedConversation.id}
                otherUser={selectedConversation.otherUser}
                onBack={handleBack}
              />
            ) : (
              <>
                {/* Header */}
                <div className="p-3 sm:p-4 md:p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      Messages
                    </h1>
                    <Button
                      onClick={() => setSearchModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">New Message</span>
                      <span className="xs:hidden">New</span>
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="divide-y divide-border overflow-y-auto h-[calc(100%-100px)] sm:h-[calc(100%-120px)] md:h-[calc(100%-140px)]">
                  {loading ? (
                    <div className="flex justify-center py-8 sm:py-12">
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-6 sm:p-8 md:p-12 text-center">
                      <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">No messages yet</h3>
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">Start a conversation with someone!</p>
                      <Button onClick={() => setSearchModalOpen(true)} className="text-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Message
                      </Button>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className="w-full p-3 sm:p-4 hover:bg-muted/50 transition-smooth flex items-center gap-3 sm:gap-4 text-left"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={conversation.otherUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={conversation.otherUser?.username}
                            className="w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <p className="font-semibold text-sm sm:text-base truncate">
                              {conversation.otherUser?.username || 'Unknown'}
                            </p>
                            <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {conversation.lastMessageAt &&
                                formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                  addSuffix: true,
                                })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm truncate text-muted-foreground">
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
