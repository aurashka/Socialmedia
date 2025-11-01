import React, { useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import ProfileHeader from './ProfileHeader';
import PostCard from '../PostCard';
import CreatePost from '../CreatePost';
import PostModal from '../PostModal';
import { onValue, ref } from 'firebase/database';
import { db, createPost, unblockUser } from '../../services/firebase';
import { uploadImage } from '../../services/imageUpload';
import { GridIcon } from '../Icons';

interface ProfilePageProps {
  currentUser: User;
  profileUserId?: string;
  users: Record<string, User>;
  posts: Post[];
  friendRequests: Record<string, any>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, profileUserId, users, posts, friendRequests }) => {
  const targetUserId = profileUserId || currentUser.id;
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (!users[targetUserId] || !currentUser || targetUserId === currentUser.id) return;
    
    // Check if the current user has sent a request to the profile user
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
  const userPosts = posts.filter(post => post.userId === targetUserId);
  const isFriendRequestReceived = friendRequests && friendRequests[profileUser.id];
  
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
  
  const renderContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map(post => (
              post.mediaUrls && post.mediaUrls.length > 0 ? (
                <div key={post.id} className="aspect-square bg-gray-200">
                  <img src={post.mediaUrls[0]} alt="post" className="w-full h-full object-cover" />
                </div>
              ) : null
            ))}
          </div>
        );
      default:
        return (
          <div className="bg-surface rounded-lg p-8 text-center text-secondary">
            <p>Content not available.</p>
          </div>
        )
    }
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
      />
      
      <div className="border-t border-b border-divider flex justify-center">
        <TabButton Icon={GridIcon} active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
      </div>

      <div className="pt-1">
          {userPosts.length > 0 ? (
              renderContent()
          ) : (
              <div className="bg-surface rounded-lg p-8 text-center text-secondary">
                  <p>{isCurrentUser ? "You haven't" : `${profileUser.name} hasn't`} posted anything yet.</p>
              </div>
          )}
      </div>

      {isPostModalOpen && (
        <PostModal
          currentUser={currentUser}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{Icon: React.ElementType, active: boolean, onClick: () => void}> = ({ Icon, active, onClick }) => (
    <button onClick={onClick} className={`py-3 px-6 -mb-px border-b-2 ${active ? 'border-primary' : 'border-transparent'}`}>
        <Icon className={`w-6 h-6 ${active ? 'text-primary' : 'text-secondary'}`} />
    </button>
)

export default ProfilePage;