import React, { useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import ProfileHeader from './ProfileHeader';
import PostCard from '../PostCard';
import CreatePost from '../CreatePost';
import PostModal from '../PostModal';
import { onValue, ref } from 'firebase/database';
// FIX: The 'uploadImage' function is exported from 'imageUpload.ts', not 'firebase.ts'.
import { db, createPost } from '../../services/firebase';
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
  const profileUser = users[targetUserId];
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);

  useEffect(() => {
    if (!profileUser || !currentUser || profileUser.id === currentUser.id) return;
    
    // Check if the current user has sent a request to the profile user
    const sentRequestRef = ref(db, `friendRequests/${profileUser.id}/${currentUser.id}`);
    const unsubscribe = onValue(sentRequestRef, (snapshot) => {
        setIsFriendRequestSent(snapshot.exists());
    });
    return () => unsubscribe();
  }, [profileUser, currentUser]);

  if (!profileUser) {
    return <div className="p-4"><p>User not found or still loading...</p></div>;
  }
  
  const isCurrentUser = targetUserId === currentUser.id;
  const userPosts = posts.filter(post => post.userId === targetUserId);
  const isFriendRequestReceived = friendRequests && friendRequests[profileUser.id];
  
  const handleCreatePost = async (content: string, imageFiles: File[]) => {
    let mediaUrls: string[] = [];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(file => uploadImage(file));
      mediaUrls = await Promise.all(uploadPromises);
    }
    await createPost({ userId: currentUser.id, content, mediaUrls });
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