import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { UserProfileCard } from '@/components/UserProfileCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { useState } from 'react';

export default function UserProfile() {
  const { userId } = useParams();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  if (!userId) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">User not found</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-0 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <UserProfileCard userId={userId} />
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />
    </div>
  );
}
