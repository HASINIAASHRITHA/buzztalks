import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Grid3X3, Settings, MapPin, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useFollow } from '@/hooks/useFirestore';

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { follow, unfollow, isFollowing: checkIsFollowing } = useFollow();
  
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const profileUserId = userId || user?.uid;
  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    if (profileUserId) {
      loadProfile();
      loadPosts();
      if (!isOwnProfile && user) {
        checkIsFollowing(profileUserId).then(setIsFollowing);
      }
    }
  }, [profileUserId, user]);

  const loadProfile = async () => {
    if (!profileUserId) return;
    
    try {
      const docRef = doc(db, 'users', profileUserId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setBio(data.bio || '');
          setWebsite(data.website || '');
          setLocation(data.location || '');
          setAvatarUrl(data.avatarUrl || '');
          setFollowersCount(data.followersCount || 0);
          setFollowingCount(data.followingCount || 0);
        } else if (isOwnProfile && user) {
          // Create user document if it doesn't exist
          const defaultData = {
            userId: user.uid,
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            bio: '',
            website: '',
            location: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            createdAt: new Date().toISOString(),
          };
          setDoc(docRef, defaultData);
          setUsername(defaultData.username);
          setAvatarUrl(defaultData.avatarUrl);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!profileUserId) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', profileUserId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setAvatarUrl(url);
      
      await setDoc(doc(db, 'users', user.uid), { avatarUrl: url }, { merge: true });
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been changed.",
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: error?.message || "Could not update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        username,
        bio,
        website,
        location,
      }, { merge: true });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error?.message || "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFollow = async () => {
    if (!profileUserId) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollow(profileUserId);
        setIsFollowing(false);
      } else {
        await follow(profileUserId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Profile Header */}
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                  {isOwnProfile && (
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="rounded-full"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold">{username}</h1>
                    
                    {!isOwnProfile && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleFollow}
                          disabled={followLoading}
                          variant={isFollowing ? 'outline' : 'default'}
                          className={!isFollowing ? 'gradient-primary text-primary-foreground' : ''}
                        >
                          {followLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isFollowing ? (
                            'Unfollow'
                          ) : (
                            'Follow'
                          )}
                        </Button>
                        <Button 
                          onClick={() => navigate('/messages')} 
                          variant="outline"
                        >
                          Message
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-center md:justify-start gap-8 mb-4">
                    <div className="text-center">
                      <p className="font-bold text-lg">{posts.length}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{followersCount}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{followingCount}</p>
                      <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                  </div>

                  {/* Bio & Details */}
                  {bio && <p className="text-sm mb-2">{bio}</p>}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    {website && (
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {website}
                      </a>
                    )}
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={isOwnProfile ? 'edit' : 'posts'} className="w-full">
              <TabsList className="w-full justify-center border-t border-border rounded-none h-12">
                <TabsTrigger value="posts" className="gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Posts
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger value="edit" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="posts" className="m-0">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No posts yet
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {posts.map((post) => (
                      <div key={post.id} className="aspect-square relative group cursor-pointer">
                        <img
                          src={post.mediaUrl}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                          <span className="flex items-center gap-1">
                            ❤️ {post.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {post.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {isOwnProfile && (
                <TabsContent value="edit" className="p-6">
                  <div className="max-w-md mx-auto space-y-6">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="yourUsername"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="gradient-primary text-primary-foreground w-full"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
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
