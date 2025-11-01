import React, { useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import ProfileHeader from './ProfileHeader';
import PostCard from '../PostCard';
import CreatePost from '../CreatePost';
import PostModal from '../PostModal';
import { onValue, ref } from 'firebase/database';
import { db, createPost, unblockUser } from '../../services/firebase';
import { uploadImage } from '../../services/imageUpload';

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
        <div className="p-8 text-center bg-card rounded-lg shadow-sm max-w-2xl mx-auto mt-4">
            <h2 className="text-xl font-bold">User Blocked</h2>
            <p className="text-text-secondary mt-2">You can't see this profile because you've blocked this user.</p>
            <button 
                onClick={handleUnblock} 
                className="mt-4 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
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

  return (
    <div className="space-y-4 pb-4">
      <ProfileHeader 
        profileUser={profileUser} 
        currentUser={currentUser}
        isFriendRequestSent={isFriendRequestSent}
        isFriendRequestReceived={!!isFriendRequestReceived}
      />
      
      <div className="p-2 sm:p-0">
          <div className="max-w-2xl mx-auto space-y-4">
              {isCurrentUser && <CreatePost currentUser={profileUser} onOpen={() => setIsPostModalOpen(true)} />}

              {userPosts.length > 0 ? (
                  userPosts.map(post => (
                    <PostCard key={post.id} post={post} user={profileUser} />
                  ))
              ) : (
                  <div className="bg-card rounded-lg shadow-sm p-8 text-center text-text-secondary">
                      <p>{isCurrentUser ? "You haven't" : `${profileUser.name} hasn't`} posted anything yet.</p>
                  </div>
              )}
          </div>
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

export default ProfilePage;
