import React, { useState, useRef, useCallback } from 'react';
import type { User, Post, Story } from '../types';
import StoryCard from './StoryCard';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import StoryViewer from './StoryViewer';
import PostCardShimmer from './shimmers/PostCardShimmer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface MainContentProps {
  currentUser: User;
  users: Record<string, User>;
  posts: Post[];
  stories: Story[];
  loading: boolean;
  onOpenPostModal: () => void;
  loadMorePosts: () => void;
  hasMorePosts: boolean;
  isFetchingPosts: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ 
  currentUser, 
  users, 
  posts, 
  stories, 
  loading, 
  onOpenPostModal,
  loadMorePosts,
  hasMorePosts,
  isFetchingPosts
}) => {
  const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<User | null>(null);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: loadMorePosts,
    enabled: hasMorePosts && !isFetchingPosts,
  });

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
      
      {/* Create Post */}
      <CreatePost currentUser={currentUser} onOpen={onOpenPostModal} />

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <>
            <PostCardShimmer />
            <PostCardShimmer />
          </>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} user={users[post.userId]} currentUser={currentUser} users={users} />
          ))
        )}
        <div ref={loadMoreRef} className="h-10">
          {isFetchingPosts && !loading && <PostCardShimmer />}
          {!hasMorePosts && posts.length > 0 && <p className="text-center text-secondary">You've reached the end.</p>}
        </div>
      </div>

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