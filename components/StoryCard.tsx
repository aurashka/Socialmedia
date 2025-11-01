import React, { useRef, useState } from 'react';
import type { User, Story } from '../types';
import { PlusIcon } from './Icons';
import { uploadMedia } from '../services/mediaUpload';
import { createStory } from '../services/firebase';

interface StoryCardProps {
  story?: Story;
  user?: User;
  isAddStory?: boolean;
  currentUser?: User;
  onViewStories?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, user, isAddStory, currentUser, onViewStories }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const imageUrl = await uploadMedia(file, 'image');
        await createStory({
          userId: currentUser.id,
          imageUrl,
        });
      } catch (error) {
        console.error('Failed to create story:', error);
        alert('Could not create story. Please try again.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  if (isAddStory && currentUser) {
    return (
      <div
        className="flex-shrink-0 w-28 h-48 rounded-lg shadow-md overflow-hidden relative cursor-pointer group"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        aria-label="Create a new story"
        role="button"
        tabIndex={0}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <img src={currentUser.avatarUrl} alt="Add Story" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-surface dark:bg-[#1E1E1E] flex flex-col items-center justify-end p-1">
          <span className="text-xs font-semibold text-center text-primary dark:text-gray-100">Create Story</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full transform border-4 border-surface dark:border-[#1E1E1E] rounded-full bg-accent text-white p-1">
          <PlusIcon className="w-6 h-6" />
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  if (!story || !user) return null;

  return (
    <div 
        className="flex-shrink-0 w-28 h-48 rounded-lg shadow-md overflow-hidden relative cursor-pointer group"
        onClick={onViewStories}
    >
      <img src={story.imageUrl} alt={user.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <img src={user.avatarUrl} alt={user.name} className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-accent" />
      <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold truncate">{user.name}</p>
    </div>
  );
};

export default StoryCard;