import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Story } from '../../types';
import { sendFriendRequest, cancelFriendRequest, removeFriend, handleFriendRequest, banUser, blockUser, unblockUser, getOrCreateConversation } from '../../services/firebase';
import { DotsHorizontalIcon } from '../Icons';

interface ProfileHeaderProps {
  profileUser: User;
  currentUser: User;
  users: Record<string, User>;
  isFriendRequestSent: boolean;
  isFriendRequestReceived: boolean;
  postCount: number;
  stories: Story[];
  onViewStories: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileUser, currentUser, users, isFriendRequestSent, isFriendRequestReceived, postCount, stories, onViewStories }) => {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isCurrentUser = profileUser.id === currentUser.id;
  const isFriend = currentUser.friends && currentUser.friends[profileUser.id];
  const isBlocked = currentUser.blocked && currentUser.blocked[profileUser.id];
  const hasStories = stories.length > 0;

  const followerCount = useMemo(() => {
    // In this data model, friends are reciprocal, so followers and following are the same.
    return profileUser.friends ? Object.keys(profileUser.friends).length : 0;
  }, [profileUser.friends]);

  const followingCount = useMemo(() => {
    return profileUser.friends ? Object.keys(profileUser.friends).length : 0;
  }, [profileUser.friends]);


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

  const handleMessage = async () => {
    setLoading(true);
    try {
        const conversationId = await getOrCreateConversation(currentUser.id, profileUser.id);
        window.location.hash = `#/messages/${conversationId}`;
    } catch (error) {
        console.error("Failed to start conversation:", error);
        alert("Could not start conversation. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (isCurrentUser) {
      return (
        <>
            <ActionButton>Edit Profile</ActionButton>
            <ActionButton>Insights</ActionButton>
        </>
      )
    }
    
    if (isFriendRequestReceived) {
        return (
            <>
                <ActionButton primary onClick={() => handleRequestResponse(true)} disabled={loading}>Accept</ActionButton>
                <ActionButton onClick={() => handleRequestResponse(false)} disabled={loading}>Decline</ActionButton>
            </>
        );
    }

    if (isFriend) {
      return (
        <>
            <ActionButton primary onClick={handleRemoveFriend} disabled={loading}>Following</ActionButton>
            <ActionButton onClick={handleMessage} disabled={loading}>Message</ActionButton>
        </>
      )
    }
    
    if (isFriendRequestSent) {
      return (
        <>
            <ActionButton primary onClick={handleCancelRequest} disabled={loading}>Request Sent</ActionButton>
            <ActionButton onClick={handleMessage} disabled={loading}>Message</ActionButton>
        </>
      )
    }

    return (
        <>
            <ActionButton primary onClick={handleAddFriend} disabled={loading}>Follow</ActionButton>
            <ActionButton onClick={handleMessage} disabled={loading}>Message</ActionButton>
        </>
    );
  };

  return (
    <div className="bg-surface dark:bg-[#1E1E1E] text-primary dark:text-gray-100">
      <div className="h-40 md:h-52 bg-gray-200 dark:bg-gray-700 relative">
        <img
          src={profileUser.coverPhotoUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1121&q=80'}
          alt={`${profileUser.name}'s cover`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 pt-0">
        <div className="flex flex-col items-center -mt-16 relative">
          <div className="relative">
             <button 
                className="w-32 h-32 rounded-full border-4 border-surface dark:border-[#1E1E1E] bg-gray-300 overflow-hidden flex-shrink-0 group disabled:cursor-default"
                onClick={onViewStories}
                disabled={!hasStories}
                aria-label={hasStories ? "View stories" : `${profileUser.name}'s profile picture`}
             >
                <img
                    src={profileUser.avatarUrl}
                    alt={profileUser.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
             </button>
             {hasStories && (
                <div className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-pink-500 ring-offset-surface dark:ring-offset-[#1E1E1E] pointer-events-none"></div>
             )}
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <span>{profileUser.name}</span>
              {profileUser.badgeUrl && <img src={profileUser.badgeUrl} alt="badge" className="w-6 h-6" />}
            </h2>
            <p className="text-secondary dark:text-gray-400 text-sm">{profileUser.bio || 'Professional Model'}</p>
          </div>
          
          <div className="flex justify-around w-full max-w-sm my-6 text-center">
            <Stat value={postCount} label="Posts"/>
            <Stat value={followerCount} label="Followers"/>
            <Stat value={followingCount} label="Following"/>
          </div>

          <div className="flex items-center space-x-2 w-full max-w-sm">
             {isBlocked ? (
                <ActionButton danger fullWidth onClick={handleUnblock} disabled={loading}>Unblock</ActionButton>
             ) : (
                <>
                {renderActionButtons()}
                 {!isCurrentUser && (
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 h-10 w-10 flex items-center justify-center rounded-md border border-divider dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="More options">
                      <DotsHorizontalIcon className="w-5 h-5 text-secondary dark:text-gray-400" />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-[#262626] rounded-md shadow-lg py-1 z-20 border border-divider dark:border-gray-700">
                        <button onClick={handleBlock} disabled={loading} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Block @{profileUser.handle}</button>
                      </div>
                    )}
                  </div>
                 )}
                </>
             )}
          </div>
           {currentUser.role === 'admin' && !isCurrentUser && (
                <button onClick={handleBanUser} className="mt-2 text-xs text-red-500 hover:underline">Ban User</button>
            )}
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{value: number; label: string}> = ({value, label}) => (
    <div>
        <p className="font-bold text-lg text-primary dark:text-gray-100">{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}</p>
        <p className="text-sm text-secondary dark:text-gray-400">{label}</p>
    </div>
);

const ActionButton: React.FC<{primary?: boolean, danger?: boolean, fullWidth?: boolean, children: React.ReactNode, onClick?: () => void, disabled?: boolean}> = ({primary, danger, fullWidth, children, ...props}) => {
    const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors text-sm h-10 flex-grow disabled:opacity-50";
    const primaryClasses = "bg-accent text-white hover:bg-blue-700";
    const secondaryClasses = "bg-gray-200 dark:bg-gray-500 text-primary dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600";
    const dangerClasses = "bg-red-500 text-white hover:bg-red-600";
    
    const classes = `${baseClasses} ${fullWidth ? 'w-full' : ''} ${primary ? primaryClasses : (danger ? dangerClasses : secondaryClasses)}`;

    return <button className={classes} {...props}>{children}</button>
}

export default ProfileHeader;