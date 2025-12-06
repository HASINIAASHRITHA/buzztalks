import { Home, Search, Compass, Heart, MessageCircle, PlusSquare, User, Settings, Moon, Sun, LogOut, Film, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications, useConversations } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Film, label: 'Reels', path: '/reels' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Heart, label: 'Notifications', path: '/notifications' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: PlusSquare, label: 'Create', path: '/create' },
  { icon: User, label: 'Profile', path: '/profile' },
];

// Bottom nav items for mobile - limited selection
const mobileNavItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: PlusSquare, label: 'Create', path: '/create' },
  { icon: Film, label: 'Reels', path: '/reels' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { unreadMessagesCount } = useConversations();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Desktop Sidebar (lg and above)
  const DesktopSidebar = () => (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-6 flex-col z-40 hidden lg:flex">
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
          const showNotificationBadge = item.path === '/notifications' && unreadCount > 0;
          const showMessageBadge = item.path === '/messages' && unreadMessagesCount > 0;
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-muted ${
                isActive ? 'bg-muted font-semibold' : ''
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {showNotificationBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {showMessageBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
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

  // Tablet Sidebar (collapsed with icons only)
  const TabletSidebar = () => (
    <aside className="fixed left-0 top-0 h-screen w-[72px] border-r border-border bg-card py-6 px-3 flex-col items-center z-40 hidden md:flex lg:hidden">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          B
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 w-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showNotificationBadge = item.path === '/notifications' && unreadCount > 0;
          const showMessageBadge = item.path === '/messages' && unreadMessagesCount > 0;
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              title={item.label}
              className={`w-full flex items-center justify-center p-3 rounded-xl transition-smooth hover:bg-muted ${
                isActive ? 'bg-muted' : ''
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {showNotificationBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {showMessageBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2 w-full">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </Button>

        <button 
          onClick={handleLogout}
          title="Logout"
          className="w-full flex items-center justify-center p-3 rounded-xl transition-smooth hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );

  // Mobile Bottom Navigation
  const MobileBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50 md:hidden safe-area-inset-bottom">
      {mobileNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        const showNotificationBadge = item.path === '/notifications' && unreadCount > 0;
        const showMessageBadge = item.path === '/messages' && unreadMessagesCount > 0;
        
        return (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-smooth ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
              {showNotificationBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {showMessageBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  // Mobile Header with Menu
  const MobileHeader = () => (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50 md:hidden safe-area-inset-top">
      <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
        BuzzTalks
      </h1>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleNavigation('/notifications')}
          className="p-2 rounded-full hover:bg-muted transition-smooth relative"
        >
          <Heart className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          )}
        </button>
        
        <button 
          onClick={() => handleNavigation('/messages')}
          className="p-2 rounded-full hover:bg-muted transition-smooth relative"
        >
          <MessageCircle className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-full hover:bg-muted transition-smooth">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                  Menu
                </h2>
              </div>
              
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const showNotificationBadge = item.path === '/notifications' && unreadCount > 0;
                  const showMessageBadge = item.path === '/messages' && unreadMessagesCount > 0;
                  
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-muted ${
                        isActive ? 'bg-muted font-semibold' : ''
                      }`}
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5" />
                        {showNotificationBadge && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                        {showMessageBadge && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border space-y-1">
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-muted">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 px-4"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="text-sm">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </Button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-smooth hover:bg-destructive/10 text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );

  return (
    <>
      <DesktopSidebar />
      <TabletSidebar />
      <MobileHeader />
      <MobileBottomNav />
    </>
  );
}
