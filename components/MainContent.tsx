import React, { useState } from 'react';
import type { User, Post, Story } from '../types';
import StoryCard from './StoryCard';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { SunIcon, XIcon, FilterIcon } from './Icons';
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
  const [showWelcome, setShowWelcome] = useState(true);
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

  return (
    <div className="p-2 sm:p-4 pb-16 md:pb-4 space-y-4 max-w-2xl mx-auto">
      {/* Stories */}
      <div className="bg-card rounded-lg shadow-sm p-4">
        <h2 className="font-bold text-lg mb-2">Stories</h2>
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          <StoryCard isAddStory currentUser={currentUser} />
          {Object.keys(userStoriesMap).map(userId => (
            <StoryCard 
                key={userId} 
                story={userStoriesMap[userId][0]} 
                user={users[userId]} 
                onViewStories={() => setViewingStoriesOfUser(users[userId])}
            />
          ))}
        </div>
      </div>
      
      {/* Create Post */}
      <CreatePost currentUser={currentUser} onOpen={() => setIsPostModalOpen(true)} />

      {/* Welcome Card */}
      {showWelcome && (
        <div className="bg-card rounded-lg shadow-sm p-4 flex items-start space-x-3 border-l-4 border-yellow-400">
            <div className="bg-yellow-100 p-2 rounded-full">
                <SunIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold">Good Afternoon, {currentUser.name?.split(' ')[0]}</h3>
                <p className="text-sm text-text-secondary">May Your Good Afternoon Be Light, Blessed, Productive And Happy</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-text-secondary hover:text-text-primary">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
      )}

      {/* Recent Updates Feed */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Recent Updates</h2>
            <div className="flex items-center space-x-2">
                <button className="text-sm font-semibold flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300">
                    <span>All Countries</span>
                </button>
                 <button className="text-sm font-semibold flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300">
                    <FilterIcon className="w-4 h-4" />
                    <span>All</span>
                </button>
            </div>
        </div>

        {loading ? (
            <p>Loading posts...</p>
        ) : (
            posts.map(post => (
                <PostCard key={post.id} post={post} user={users[post.userId]} />
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