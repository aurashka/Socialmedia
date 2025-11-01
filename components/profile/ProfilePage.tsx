import React, { useState, useEffect, useMemo } from 'react';
import type { User, Post, Story } from '../../types';
import ProfileHeader from './ProfileHeader';
import PostCard from '../PostCard';
import { onValue, ref } from 'firebase/database';
import { db, unblockUser } from '../../services/firebase';
import { GridIcon, VideoCameraIcon, BookmarkIcon } from '../Icons';
import StoryViewer from '../StoryViewer';
import PostViewer from './PostViewer';

interface ProfilePageProps {
  currentUser: User;
  profileUserId?: string;
  users: Record<string, User>;
  posts: Post[];
  friendRequests: Record<string, any>;
  stories: Story[];
  onOpenCommentSheet: (postId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, profileUserId, users, posts, friendRequests, stories, onOpenCommentSheet }) => {
  const targetUserId = profileUserId || currentUser.id;
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'stories' | 'bookmarked'>('posts');
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
        <div className="p-8 text-center bg-surface dark:bg-[#1E1E1E] rounded-lg shadow-sm max-w-2xl mx-auto mt-4">
            <h2 className="text-xl font-bold text-primary dark:text-gray-100">User Blocked</h2>
            <p className="text-secondary dark:text-gray-400 mt-2">You can't see this profile because you've blocked this user.</p>
            <button 
                onClick={handleUnblock} 
                className="mt-4 px-4 py-2 bg-accent text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
                Unblock
            </button>
        </div>
    );
  }
  
  if (!profileUser) {
    return <div className="p-4 text-primary dark:text-gray-100"><p>User not found or still loading...</p></div>;
  }
  
  const isCurrentUser = targetUserId === currentUser.id;
  
  const userPosts = useMemo(() => {
    return posts
      .filter(post => post.userId === targetUserId)
      .filter(post => {
        if (isCurrentUser) return true; // Current user sees all their own posts
        
        const privacy = post.privacy || 'public';
        if (privacy === 'public') return true;
        if (privacy === 'friends') {
            const isFriend = currentUser.friends && currentUser.friends[targetUserId];
            return isFriend;
        }
        return false; // Private posts only visible to owner
      });
  }, [posts, targetUserId, isCurrentUser, currentUser.friends]);

  const bookmarkedPosts = useMemo(() => {
    if (!currentUser.bookmarkedPosts) return [];
    const bookmarkedIds = Object.keys(currentUser.bookmarkedPosts);
    return posts.filter(post => bookmarkedIds.includes(post.id)).sort((a,b) => b.timestamp - a.timestamp);
  }, [posts, currentUser.bookmarkedPosts]);
  
  const profileUserStories = useMemo(() => {
    return stories.filter(story => story.userId === targetUserId).sort((a,b) => b.timestamp - a.timestamp);
  }, [stories, targetUserId]);

  const isFriendRequestReceived = friendRequests && friendRequests[profileUser.id];
  
  const renderContent = () => {
    if (activeTab === 'posts') {
      if (userPosts.length === 0) {
        return (
          <div className="bg-surface dark:bg-[#1E1E1E] rounded-lg p-8 text-center text-secondary dark:text-gray-400 mt-1">
            <p>{isCurrentUser ? "You haven't" : `${profileUser.name} hasn't`} posted anything yet.</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-3 gap-1">
          {userPosts.map(post => (
            post.media && post.media.length > 0 ? (
              <div key={post.id} className="aspect-square bg-gray-200 dark:bg-[#262626] cursor-pointer relative" onClick={() => setSelectedPost(post)}>
                <img src={post.media[0].url} alt="post" className="w-full h-full object-cover" />
                {post.media[0].type === 'video' && (
                    <VideoCameraIcon className="absolute top-2 right-2 w-5 h-5 text-white drop-shadow-lg" strokeWidth={2.5} />
                )}
              </div>
            ) : null
          ))}
        </div>
      );
    }
    
    if (activeTab === 'stories') {
        if (profileUserStories.length === 0) {
            return (
                <div className="bg-surface dark:bg-[#1E1E1E] rounded-lg p-8 text-center text-secondary dark:text-gray-400 mt-1">
                    <p>{isCurrentUser ? "You don't" : `${profileUser.name} doesn't`} have any stories.</p>
                </div>
            )
        }
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 p-1">
                {profileUserStories.map((story, index) => (
                    <div key={story.id} className="aspect-square bg-gray-200 dark:bg-[#262626] cursor-pointer group" onClick={() => setStoryViewerState({ open: true, initialIndex: index })}>
                        <img src={story.imageUrl} alt="story thumbnail" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    </div>
                ))}
            </div>
        )
    }

    if (activeTab === 'bookmarked') {
      if (bookmarkedPosts.length === 0) {
        return (
          <div className="bg-surface dark:bg-[#1E1E1E] rounded-lg p-8 text-center text-secondary dark:text-gray-400 mt-1">
            <p>You haven't saved any posts yet.</p>
            <p className="text-xs mt-1">Only you can see what you've saved.</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-3 gap-1">
          {bookmarkedPosts.map(post => (
            post.media && post.media.length > 0 ? (
              <div key={post.id} className="aspect-square bg-gray-200 dark:bg-[#262626] cursor-pointer relative" onClick={() => setSelectedPost(post)}>
                <img src={post.media[0].url} alt="post" className="w-full h-full object-cover" />
                 {post.media[0].type === 'video' && (
                    <VideoCameraIcon className="absolute top-2 right-2 w-5 h-5 text-white drop-shadow-lg" strokeWidth={2.5} />
                )}
              </div>
            ) : null
          ))}
        </div>
      );
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
      
      <div className="border-t border-b border-divider dark:border-gray-700 flex justify-center bg-surface dark:bg-[#1E1E1E]">
        <TabButton Icon={GridIcon} label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
        <TabButton Icon={VideoCameraIcon} label="Stories" active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} />
        {isCurrentUser && (
          <TabButton Icon={BookmarkIcon} label="Saved" active={activeTab === 'bookmarked'} onClick={() => setActiveTab('bookmarked')} />
        )}
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
          users={users}
          onClose={() => setSelectedPost(null)}
          onOpenCommentSheet={onOpenCommentSheet}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{Icon: React.ElementType, label: string, active: boolean, onClick: () => void}> = ({ Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 py-3 px-6 -mb-px border-b-2 ${active ? 'border-primary dark:border-gray-100 text-primary dark:text-gray-100' : 'border-transparent text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
        <Icon className={`w-6 h-6`} />
        <span className="font-semibold uppercase text-xs hidden sm:inline">{label}</span>
    </button>
)

export default ProfilePage;