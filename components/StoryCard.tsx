
import React from 'react';
import type { User, Story } from '../types';
import { PlusIcon } from './Icons';

interface StoryCardProps {
  story?: Story;
  user?: User;
  isAddStory?: boolean;
  currentUser?: User;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, user, isAddStory, currentUser }) => {
  if (isAddStory && currentUser) {
    return (
      <div className="flex-shrink-0 w-28 h-48 rounded-lg shadow-md overflow-hidden relative cursor-pointer group">
        <img src={currentUser.avatarUrl} alt="Add Story" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-card flex flex-col items-center justify-end p-1">
          <span className="text-xs font-semibold text-center">Create Story</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full transform border-4 border-card rounded-full bg-primary text-white p-1">
          <PlusIcon className="w-6 h-6" />
        </div>
      </div>
    );
  }

  if (!story || !user) return null;

  return (
    <div className="flex-shrink-0 w-28 h-48 rounded-lg shadow-md overflow-hidden relative cursor-pointer group">
      <img src={story.imageUrl} alt={user.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <img src={user.avatarUrl} alt={user.name} className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-primary" />
      <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold truncate">{user.name}</p>
    </div>
  );
};

export default StoryCard;
