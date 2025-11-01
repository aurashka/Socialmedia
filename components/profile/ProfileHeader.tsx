import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { sendFriendRequest, cancelFriendRequest, removeFriend, handleFriendRequest, banUser, blockUser, unblockUser } from '../../services/firebase';
import { DotsHorizontalIcon } from '../Icons';

interface ProfileHeaderProps {
  profileUser: User;
  currentUser: User;
  isFriendRequestSent: boolean;
  isFriendRequestReceived: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileUser, currentUser, isFriendRequestSent, isFriendRequestReceived }) => {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isCurrentUser = profileUser.id === currentUser.id;
  const isFriend = currentUser.friends && currentUser.friends[profileUser.id];
  const isBlocked = currentUser.blocked && currentUser.blocked[profileUser.id];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddFriend = async () => {
    setLoading(true);
    await sendFriendRequest(currentUser.id, profileUser.id);
    setLoading(false);
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    await cancelFriendRequest(currentUser.id, profileUser.id);
    setLoading(false);
  };

  const handleRemoveFriend = async () => {
    if (window.confirm(`Are you sure you want to remove ${profileUser.name} as a friend?`)) {
      setLoading(true);
      await removeFriend(currentUser.id, profileUser.id);
      setLoading(false);
    }
  };
  
  const handleRequestResponse = async (accept: boolean) => {
      setLoading(true);
      await handleFriendRequest(currentUser.id, profileUser.id, accept);
      setLoading(false);
  }

  const handleBlock = async () => {
    if (window.confirm(`Are you sure you want to block ${profileUser.name}? You will no longer see their posts or profile.`)) {
        setLoading(true);
        setMenuOpen(false);
        await blockUser(currentUser.id, profileUser.id);
        setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    setMenuOpen(false);
    await unblockUser(currentUser.id, profileUser.id);
    setLoading(false);
  };
  
  const handleBanUser = async () => {
     if (window.confirm(`Are you sure you want to BAN ${profileUser.name}? This action is irreversible.`)) {
        try {
            await banUser(profileUser.id);
            alert(`${profileUser.name} has been banned.`);
        } catch(e) {
            alert('Failed to ban user.');
        }
     }
  }

  const renderActionButtons = () => {
    if (isCurrentUser) {
      return <button className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">Edit Profile</button>;
    }
    
    if (isFriendRequestReceived) {
        return (
            <div className="flex space-x-2">
                <button onClick={() => handleRequestResponse(true)} disabled={loading} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300">Accept</button>
                <button onClick={() => handleRequestResponse(false)} disabled={loading} className="px-4 py-2 bg-gray-200 text-text-primary font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100">Decline</button>
            </div>
        );
    }

    if (isFriend) {
      return <button onClick={handleRemoveFriend} disabled={loading} className="px-4 py-2 bg-gray-200 text-text-primary font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100">Friends</button>;
    }
    
    if (isFriendRequestSent) {
      return <button onClick={handleCancelRequest} disabled={loading} className="px-4 py-2 bg-gray-200 text-text-primary font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100">Request Sent</button>;
    }

    return <button onClick={handleAddFriend} disabled={loading} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300">Add Friend</button>;
  };

  return (
    <div className="bg-card rounded-b-lg shadow-sm -mx-2 sm:-mx-4">
      <div className="h-48 md:h-64 bg-gray-200 rounded-t-lg relative">
        {profileUser.coverPhotoUrl && (
          <img
            src={profileUser.coverPhotoUrl}
            alt={`${profileUser.name}'s cover`}
            className="w-full h-full object-cover rounded-t-lg"
          />
        )}
      </div>
      <div className="p-4 pt-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:space-x-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-card bg-gray-300 overflow-hidden flex-shrink-0">
             <img
                src={profileUser.avatarUrl}
                alt={profileUser.name}
                className="w-full h-full object-cover"
             />
          </div>
          <div className="flex-1 mt-4 sm:mt-0 w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:pb-4">
             <div className="text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-bold">{profileUser.name}</h2>
                <p className="text-text-secondary">@{profileUser.handle}</p>
             </div>
             <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                {!isBlocked && renderActionButtons()}
                 {!isCurrentUser && (
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-200" aria-label="More options">
                      <DotsHorizontalIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-20">
                        {isBlocked ? (
                          <button onClick={handleUnblock} disabled={loading} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100">Unblock @{profileUser.handle}</button>
                        ) : (
                          <button onClick={handleBlock} disabled={loading} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Block @{profileUser.handle}</button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {currentUser.role === 'admin' && !isCurrentUser && (
                    <button onClick={handleBanUser} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-700">Ban User</button>
                )}
             </div>
          </div>
        </div>
        
        {profileUser.bio && (
            <p className="mt-4 text-text-secondary text-center sm:text-left">{profileUser.bio}</p>
        )}
      </div>
       <div className="border-t mx-4">
            <nav className="flex space-x-4">
                <a href="#" className="py-3 px-2 font-semibold text-primary border-b-2 border-primary">Posts</a>
                <a href="#" className="py-3 px-2 font-semibold text-text-secondary hover:bg-gray-100 rounded-md">About</a>
                <a href="#" className="py-3 px-2 font-semibold text-text-secondary hover:bg-gray-100 rounded-md">Friends</a>
            </nav>
        </div>
    </div>
  );
};

export default ProfileHeader;
