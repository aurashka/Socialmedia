import React, { useState } from 'react';
import type { User, Post, Story } from '../types';
import StoryCard from './StoryCard';
import PostCard from './PostCard';
import StoryViewer from './StoryViewer';
import PostCardShimmer from './shimmers/PostCardShimmer';

interface MainContentProps {
  currentUser: User;
  users: Record<string, User>;
  posts: Post[];
  stories: Story[];
  loading: boolean;
  onOpenPostModal: () => void;
  onOpenCommentSheet: (postId: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  currentUser, 
  users, 
  posts, 
  stories, 
  loading,
  onOpenCommentSheet,
}) => {
  const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<User | null>(null);
  
  const userStoriesMap = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
        acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    acc[story.userId].sort((a,b) => b.timestamp - a.timestamp);
    return acc;
  }, {} as Record<string, Story[]>);

  const storyUsers = Object.keys(userStoriesMap)
    .map(userId => users[userId])
    .filter(Boolean)
    .sort((a,b) => {
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      return 0;
    });

  return (
    <div className="space-y-4 max-w-lg mx-auto py-4">
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
      <div className="space-y-8">
        {posts.map(post => (
          <PostCard key={post.id} post={post} user={users[post.userId]} currentUser={currentUser} users={users} onOpenCommentSheet={onOpenCommentSheet} />
        ))}
      </div>

      {viewingStoriesOfUser && (
        <StoryViewer
          user={viewingStoriesOfUser}
          stories={userStoriesMap[viewingStoriesOfUser.id]}
          onClose={() => setViewingStoriesOfUser(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default MainContent;