import React, { useState, useEffect } from 'react';
import type { User, Story } from '../types';
import { XIcon, HeartIcon, HeartIconFilled } from './Icons';
import { viewStory, toggleStoryLike, getOrCreateConversation, sendMessage } from '../services/firebase';

interface StoryViewerProps {
  user: User;
  stories: Story[];
  onClose: () => void;
  currentUser: User;
  initialIndex?: number;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer: React.FC<StoryViewerProps> = ({ user, stories, onClose, currentUser, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const currentStory = stories[currentIndex];

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

  useEffect(() => {
    if (currentStory && currentUser.id !== user.id) {
        viewStory(currentStory.id, currentUser.id);
    }
  }, [currentStory, currentUser.id, user.id]);

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

  const handleLike = () => {
      if (currentStory) {
          toggleStoryLike(currentStory.id, currentUser.id);
      }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentStory) return;

    setIsSending(true);
    try {
        const conversationId = await getOrCreateConversation(currentUser.id, currentStory.userId);
        await sendMessage(conversationId, currentUser.id, { text: message.trim() });
        setMessage('');
        // Show a temporary "Sent!" message or animation if desired
    } catch (error) {
        console.error("Failed to send message from story:", error);
        alert("Could not send message.");
    } finally {
        setIsSending(false);
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

  if (!currentStory) return null;

  const isLiked = !!currentStory.likes?.[currentUser.id];
  const likeCount = Object.keys(currentStory.likes || {}).length;
  const viewCount = Object.keys(currentStory.views || {}).length;

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
        <span className="text-gray-300 text-sm">{timeAgo(currentStory.timestamp)}</span>
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
          src={currentStory.imageUrl} 
          alt={`Story by ${user.name}`} 
          className="w-full h-auto max-h-[85vh] object-contain rounded-md" 
        />
        {/* Navigation Overlays */}
        <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full" onClick={handlePrev}></div>
            <div className="w-2/3 h-full" onClick={handleNext}></div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        {currentUser.id === user.id ? (
            <div className="flex items-center gap-4 p-2 bg-black/30 rounded-full w-fit">
                <div className="flex items-center gap-1.5 text-white text-sm font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{viewCount}</span>
                </div>
                 <div className="flex items-center gap-1.5 text-white text-sm font-semibold">
                    <HeartIconFilled className="w-5 h-5 text-red-500"/>
                    <span>{likeCount}</span>
                </div>
            </div>
        ) : (
             <div className="flex items-center gap-2">
                 <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Send a message..."
                        className="w-full bg-black/50 border border-white/30 rounded-full px-4 py-2 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={e => e.stopPropagation()} // Prevent story navigation
                    />
                     <button type="submit" disabled={isSending || !message.trim()} className="p-2 bg-white/30 rounded-full text-white disabled:opacity-50 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                     </button>
                 </form>
                 <button onClick={handleLike} className="p-2 rounded-full text-white flex-shrink-0">
                     {isLiked ? <HeartIconFilled className="w-7 h-7 text-red-500"/> : <HeartIcon className="w-7 h-7"/>}
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;