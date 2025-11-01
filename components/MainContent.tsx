import React, { useState } from 'react';
import type { User, Post, Story } from '../types';
import StoryCard from './StoryCard';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import PostModal from './PostModal';
import StoryViewer from './StoryViewer';
import { uploadImage } from '../services/imageUpload';
import { createPost } from '../services/firebase';

interface MainContentProps {
  currentUser: User;
  users: Record<string, User>;
  posts: Post[];
  stories: Story[];
  loading: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ currentUser, users, posts, stories, loading }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<User | null>(null);

  const handleCreatePost = async (content: string, imageFiles: File[]) => {
    let mediaUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        const uploadPromises = imageFiles.map(file => uploadImage(file));
        mediaUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Failed to upload one or more images:", error);
        alert("Error uploading images. Please try again.");
        return;
      }
    }

    const newPost: Omit<Post, 'id' | 'likes' | 'comments' | 'timestamp'> = {
      userId: currentUser.id,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    };

    try {
      await createPost(newPost);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Error creating post. Please try again.");
    }
  };
  
  const userStoriesMap = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
        acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    // Sort stories by newest first
    acc[story.userId].sort((a,b) => b.timestamp - a.timestamp);
    return acc;
  }, {} as Record<string, Story[]>);

  const storyUsers = Object.keys(userStoriesMap)
    .map(userId => users[userId])
    .filter(Boolean)
    .sort((a,b) => {
      // Prioritize current user's story if it exists
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      return 0; // or some other logic
    });

  return (
    <div className="p-2 sm:p-4 pb-4 space-y-4 max-w-xl mx-auto">
      {/* Stories */}
      <div className="bg-transparent py-2">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <StoryCard isAddStory currentUser={currentUser} />
          {storyUsers.map(user => (
            <StoryCard 
                key={user.id} 
                story={userStoriesMap[user.id][0]} 
                user={user} 
                onViewStories={() => setViewingStoriesOfUser(user)}
            />
          ))}
        </div>
      </div>
      
      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading posts...</p>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} user={users[post.userId]} currentUser={currentUser} />
          ))
        )}
      </div>

      {isPostModalOpen && (
        <PostModal
          currentUser={currentUser}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
      {viewingStoriesOfUser && (
        <StoryViewer
          user={viewingStoriesOfUser}
          stories={userStoriesMap[viewingStoriesOfUser.id]}
          onClose={() => setViewingStoriesOfUser(null)}
        />
      )}
    </div>
  );
};

export default MainContent;