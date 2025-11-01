import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User } from '../../types';
import { sendFriendRequest, cancelFriendRequest, removeFriend, handleFriendRequest, banUser, blockUser, unblockUser } from '../../services/firebase';
import { DotsHorizontalIcon } from '../Icons';

interface ProfileHeaderProps {
  profileUser: User;
  currentUser: User;
  users: Record<string, User>;
  isFriendRequestSent: boolean;
  isFriendRequestReceived: boolean;
  postCount: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileUser, currentUser, users, isFriendRequestSent, isFriendRequestReceived, postCount }) => {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isCurrentUser = profileUser.id === currentUser.id;
  const isFriend = currentUser.friends && currentUser.friends[profileUser.id];
  const isBlocked = currentUser.blocked && currentUser.blocked[profileUser.id];

  const followerCount = useMemo(() => {
    // This is a mock value. A real implementation would need a different DB structure.
    return 567000;
  }, [profileUser.id]);

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

  const renderActionButtons = () => {
    if (isCurrentUser) {
      return (
        <>
            <ActionButton primary>Edit Profile</ActionButton>
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
            <ActionButton>Message</ActionButton>
        </>
      )
    }
    
    if (isFriendRequestSent) {
      return (
        <>
            <ActionButton primary onClick={handleCancelRequest} disabled={loading}>Request Sent</ActionButton>
            <ActionButton>Message</ActionButton>
        </>
      )
    }

    return (
        <>
            <ActionButton primary onClick={handleAddFriend} disabled={loading}>Follow</ActionButton>
            <ActionButton>Message</ActionButton>
        </>
    );
  };

  return (
    <div className="bg-surface">
      <div className="h-40 md:h-52 bg-gray-200 relative">
        <img
          src={profileUser.coverPhotoUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1121&q=80'}
          alt={`${profileUser.name}'s cover`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 pt-0">
        <div className="flex flex-col items-center -mt-16 relative">
          <div className="w-32 h-32 rounded-full border-4 border-surface bg-gray-300 overflow-hidden flex-shrink-0">
             <img
                src={profileUser.avatarUrl}
                alt={profileUser.name}
                className="w-full h-full object-cover"
             />
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold">{profileUser.name}</h2>
            <p className="text-secondary text-sm">{profileUser.bio || 'Professional Model'}</p>
          </div>
          
          <div className="flex justify-around w-full max-w-sm my-6 text-center">
            <Stat value={followerCount} label="Followers"/>
            <Stat value={followingCount} label="Following"/>
            <Stat value={postCount} label="Posts"/>
          </div>

          <div className="flex items-center space-x-2 w-full max-w-sm">
             {isBlocked ? (
                <ActionButton danger fullWidth onClick={handleUnblock} disabled={loading}>Unblock</ActionButton>
             ) : (
                <>
                {renderActionButtons()}
                 {!isCurrentUser && (
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 h-10 w-10 flex items-center justify-center rounded-md border border-divider hover:bg-gray-100" aria-label="More options">
                      <DotsHorizontalIcon className="w-5 h-5 text-secondary" />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-20 border border-divider">
                        <button onClick={handleBlock} disabled={loading} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Block @{profileUser.handle}</button>
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
        <p className="font-bold text-lg">{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}</p>
        <p className="text-sm text-secondary">{label}</p>
    </div>
);

const ActionButton: React.FC<{primary?: boolean, danger?: boolean, fullWidth?: boolean, children: React.ReactNode, onClick?: () => void, disabled?: boolean}> = ({primary, danger, fullWidth, children, ...props}) => {
    const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors text-sm h-10 flex-grow";
    const primaryClasses = "bg-primary text-white hover:bg-black";
    const secondaryClasses = "bg-gray-200 text-primary hover:bg-gray-300";
    const dangerClasses = "bg-red-500 text-white hover:bg-red-600";
    
    const classes = `${baseClasses} ${fullWidth ? 'w-full' : ''} ${primary ? primaryClasses : (danger ? dangerClasses : secondaryClasses)}`;

    return <button className={classes} {...props}>{children}</button>
}

export default ProfileHeader;