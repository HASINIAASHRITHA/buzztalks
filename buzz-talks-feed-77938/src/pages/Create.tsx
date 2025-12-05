import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { CreatePostModal } from '@/components/CreatePostModal';

export default function Create() {
  const [createPostOpen, setCreatePostOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Open the create modal automatically when this page loads
    setCreatePostOpen(true);
  }, []);

  const handleClose = () => {
    setCreatePostOpen(false);
    // Navigate back to home when modal closes
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <Sidebar />
      
      <div className="ml-64 min-h-screen">
        <HeaderBar onCreatePost={() => setCreatePostOpen(true)} />
        
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="bg-card rounded-2xl shadow-card p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
            <p className="text-muted-foreground">
              Share your moments with the world
            </p>
          </div>
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onClose={handleClose}
      />
    </div>
  );
}
