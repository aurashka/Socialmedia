import React, { useState, useEffect } from 'react';
import type { User, Story } from '../types';
import { XIcon } from './Icons';

interface StoryViewerProps {
  user: User;
  stories: Story[];
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer: React.FC<StoryViewerProps> = ({ user, stories, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0); // Reset progress when story changes
    const timer = setTimeout(() => {
      handleNext();
    }, STORY_DURATION);

    const interval = setInterval(() => {
      setProgress(p => p + 100 / (STORY_DURATION / 100));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentIndex, stories]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };
  
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };


  if (!stories || stories.length === 0) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center select-none"
        role="dialog"
        aria-modal="true"
    >
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 linear"
              style={{ width: `${index < currentIndex ? 100 : (index === currentIndex ? progress : 0)}%`}}
            ></div>
          </div>
        ))}
      </div>
      <div className="absolute top-8 left-4 flex items-center space-x-2 z-20">
        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
        <span className="text-white font-semibold text-sm">{user.name}</span>
        <span className="text-gray-300 text-sm">{timeAgo(stories[currentIndex].timestamp)}</span>
      </div>

      <button 
        onClick={onClose} 
        className="absolute top-6 right-4 text-white z-20"
        aria-label="Close story view"
      >
        <XIcon className="w-8 h-8" />
      </button>

      <div className="relative w-full max-w-md h-full flex items-center">
        <img 
          src={stories[currentIndex].imageUrl} 
          alt={`Story by ${user.name}`} 
          className="w-full h-auto max-h-[85vh] object-contain rounded-md" 
        />
        {/* Navigation Overlays */}
        <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full" onClick={handlePrev}></div>
            <div className="w-2/3 h-full" onClick={handleNext}></div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;