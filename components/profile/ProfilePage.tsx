import React from 'react';
import type { User, Post } from '../../types';
import ProfileHeader from './ProfileHeader';
import PostCard from '../PostCard';
import CreatePost from '../CreatePost';
import LoadingSpinner from '../LoadingSpinner';

interface ProfilePageProps {
  currentUserId: string;
  profileUserId?: string;
  users: Record<string, User>;
  posts: Post[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUserId, profileUserId, users, posts }) => {
  const targetUserId = profileUserId || currentUserId;
  const profileUser = users[targetUserId];

  if (!profileUser) {
    // A simple loading/not found state
    return (
      <div className="p-4">
        <p>User not found or still loading...</p>
      </div>
    );
  }

  const isCurrentUser = targetUserId === currentUserId;
  const userPosts = posts.filter(post => post.userId === targetUserId);

  return (
    <div className="space-y-4 pb-16 md:pb-4">
      <ProfileHeader user={profileUser} isCurrentUser={isCurrentUser} />
      
      <div className="p-2 sm:p-0">
          <div className="max-w-2xl mx-auto space-y-4">
              {isCurrentUser && <CreatePost currentUser={profileUser} onOpen={() => { /* Implement modal opening */ }} />}

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
    </div>
  );
};

export default ProfilePage;
