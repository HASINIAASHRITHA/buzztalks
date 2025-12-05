import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useNotifications } from '@/hooks/useFirestore';
import { Heart, MessageCircle, UserPlus, Bell, Mail, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'message':
        return <Mail className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'message':
        return 'sent you a message';
      default:
        return 'interacted with you';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.type === 'follow') {
      navigate(`/user/${notification.fromUserId}`);
    } else if (notification.type === 'message') {
      navigate('/messages');
    } else if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </h1>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-border">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">When people interact with you, you'll see it here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 flex items-start gap-4 hover:bg-muted/50 transition-smooth text-left ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                  >
                    <img
                      src={notification.fromUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={notification.fromUser?.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">
                              {notification.fromUser?.username || 'Someone'}
                            </span>
                            {' '}
                            <span className="text-muted-foreground">
                              {getActionText(notification.type)}
                            </span>
                          </p>
                          {notification.content && (
                            <p className="text-sm text-muted-foreground mt-1">
                              "{notification.content}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />
    </div>
  );
}
