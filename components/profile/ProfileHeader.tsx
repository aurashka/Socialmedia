import React from 'react';
import type { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isCurrentUser }) => {
  return (
    <div className="bg-card rounded-b-lg shadow-sm -mx-2 sm:-mx-4">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-gray-200 rounded-t-lg relative">
        {user.coverPhotoUrl && (
          <img
            src={user.coverPhotoUrl}
            alt={`${user.name}'s cover`}
            className="w-full h-full object-cover rounded-t-lg"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4 pt-0">
        <div className="flex items-end -mt-16 space-x-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-card bg-gray-300 overflow-hidden">
             <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
             />
          </div>
          <div className="flex-1 pb-4 flex justify-between items-center">
             <div>
                <h2 className="text-2xl md:text-3xl font-bold">{user.name}</h2>
                <p className="text-text-secondary">@{user.handle}</p>
             </div>
             {isCurrentUser && (
                <button className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                    Edit Profile
                </button>
             )}
          </div>
        </div>
        
        {user.bio && (
            <p className="mt-4 text-text-secondary">{user.bio}</p>
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
