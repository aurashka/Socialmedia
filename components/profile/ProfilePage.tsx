import React, { useState, useEffect, useMemo } from 'react';
import type { User, Post, Story } from '../../types';
import ProfileHeader from './ProfileHeader';
import PostCard from '../PostCard';
import { onValue, ref } from 'firebase/database';
import { db, unblockUser } from '../../services/firebase';
import { GridIcon, VideoCameraIcon } from '../Icons';
import StoryViewer from '../StoryViewer';
import PostViewer from './PostViewer';

interface ProfilePageProps {
  currentUser: User;
  profileUserId?: string;
  users: Record<string, User>;
  posts: Post[];
  friendRequests: Record<string, any>;
  stories: Story[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, profileUserId, users, posts, friendRequests, stories }) => {
  const targetUserId = profileUserId || currentUser.id;
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'stories'>('posts');
  const [storyViewerState, setStoryViewerState] = useState<{ open: boolean, initialIndex: number }>({ open: false, initialIndex: 0 });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!users[targetUserId] || !currentUser || targetUserId === currentUser.id) return;
    
    const sentRequestRef = ref(db, `friendRequests/${targetUserId}/${currentUser.id}`);
    const unsubscribe = onValue(sentRequestRef, (snapshot) => {
        setIsFriendRequestSent(snapshot.exists());
    });
    return () => unsubscribe();
  }, [targetUserId, users, currentUser]);

  const profileUser = users[targetUserId];

  if (currentUser.blocked?.[targetUserId]) {
    const handleUnblock = async () => {
        await unblockUser(currentUser.id, targetUserId);
    };
    return (
        <div className="p-8 text-center bg-surface rounded-lg shadow-sm max-w-2xl mx-auto mt-4">
            <h2 className="text-xl font-bold">User Blocked</h2>
            <p className="text-secondary mt-2">You can't see this profile because you've blocked this user.</p>
            <button 
                onClick={handleUnblock} 
                className="mt-4 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-black transition-colors"
            >
                Unblock
            </button>
        </div>
    );
  }
  
  if (!profileUser) {
    return <div className="p-4"><p>User not found or still loading...</p></div>;
  }
  
  const isCurrentUser = targetUserId === currentUser.id;
  
  const userPosts = useMemo(() => {
    return posts
      .filter(post => post.userId === targetUserId)
      .filter(post => {
        if (isCurrentUser) return true; // Current user sees all their own posts
        return post.isPublic !== false; // Others only see public posts
      });
  }, [posts, targetUserId, isCurrentUser]);
  
  const profileUserStories = useMemo(() => {
    return stories.filter(story => story.userId === targetUserId).sort((a,b) => b.timestamp - a.timestamp);
  }, [stories, targetUserId]);

  const isFriendRequestReceived = friendRequests && friendRequests[profileUser.id];
  
  const renderContent = () => {
    if (activeTab === 'posts') {
      if (userPosts.length === 0) {
        return (
          <div className="bg-surface rounded-lg p-8 text-center text-secondary mt-1">
            <p>{isCurrentUser ? "You haven't" : `${profileUser.name} hasn't`} posted anything yet.</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-3 gap-1">
          {userPosts.map(post => (
            post.mediaUrls && post.mediaUrls.length > 0 ? (
              <div key={post.id} className="aspect-square bg-gray-200 cursor-pointer" onClick={() => setSelectedPost(post)}>
                <img src={post.mediaUrls[0]} alt="post" className="w-full h-full object-cover" />
              </div>
            ) : null
          ))}
        </div>
      );
    }
    
    if (activeTab === 'stories') {
        if (profileUserStories.length === 0) {
            return (
                <div className="bg-surface rounded-lg p-8 text-center text-secondary mt-1">
                    <p>{isCurrentUser ? "You don't" : `${profileUser.name} doesn't`} have any stories.</p>
                </div>
            )
        }
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 p-1">
                {profileUserStories.map((story, index) => (
                    <div key={story.id} className="aspect-square bg-gray-200 cursor-pointer group" onClick={() => setStoryViewerState({ open: true, initialIndex: index })}>
                        <img src={story.imageUrl} alt="story thumbnail" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    </div>
                ))}
            </div>
        )
    }

    return null;
  }

  return (
    <div className="pb-4 max-w-4xl mx-auto">
      <ProfileHeader 
        profileUser={profileUser} 
        currentUser={currentUser}
        users={users}
        isFriendRequestSent={isFriendRequestSent}
        isFriendRequestReceived={!!isFriendRequestReceived}
        postCount={userPosts.length}
        stories={profileUserStories}
        onViewStories={() => setStoryViewerState({ open: true, initialIndex: 0 })}
      />
      
      <div className="border-t border-b border-divider flex justify-center">
        <TabButton Icon={GridIcon} label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
        <TabButton Icon={VideoCameraIcon} label="Stories" active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} />
      </div>

      <div className="pt-1">
          {renderContent()}
      </div>

      {storyViewerState.open && profileUserStories.length > 0 && (
          <StoryViewer 
            user={profileUser}
            stories={profileUserStories}
            initialIndex={storyViewerState.initialIndex}
            onClose={() => setStoryViewerState({ open: false, initialIndex: 0 })}
          />
      )}
      {selectedPost && (
        <PostViewer
          post={selectedPost}
          user={users[selectedPost.userId]}
          currentUser={currentUser}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{Icon: React.ElementType, label: string, active: boolean, onClick: () => void}> = ({ Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 py-3 px-6 -mb-px border-b-2 ${active ? 'border-primary text-primary' : 'border-transparent text-secondary hover:bg-gray-100'}`}>
        <Icon className={`w-6 h-6`} />
        <span className="font-semibold uppercase text-xs hidden sm:inline">{label}</span>
    </button>
)

export default ProfilePage;