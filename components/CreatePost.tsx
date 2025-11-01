
import React from 'react';
import type { User } from '../types';

interface CreatePostProps {
  currentUser: User;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-3">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
        <div className="flex-1 bg-background rounded-full px-4 py-2 text-text-secondary cursor-pointer hover:bg-gray-200">
          What is on your mind? #Hashtag.. @Mention.. Link..
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
