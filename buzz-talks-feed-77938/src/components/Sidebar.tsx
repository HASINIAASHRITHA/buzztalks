import { Home, Search, Compass, Heart, MessageCircle, PlusSquare, User, Settings, Moon, Sun, LogOut, Film } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Film, label: 'Reels', path: '/reels' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Heart, label: 'Notifications', path: '/notifications' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: PlusSquare, label: 'Create', path: '/create' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
          BuzzTalks
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = item.path === '/notifications' && unreadCount > 0;
          
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-muted ${
                isActive ? 'bg-muted font-semibold' : ''
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-muted">
          <Settings className="w-6 h-6" />
          <span className="text-base">Settings</span>
        </button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-4"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          <span className="text-base">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </Button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
