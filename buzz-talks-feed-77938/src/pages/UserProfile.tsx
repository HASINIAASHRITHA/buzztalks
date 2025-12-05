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
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-8 py-6">
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
