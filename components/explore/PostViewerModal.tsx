import React, { useState, useEffect } from 'react';
import type { Post, User } from '../../types';
import PostCard from '../PostCard';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface PostViewerModalProps {
    posts: Post[];
    users: Record<string, User>;
    currentUser: User;
    initialIndex: number;
    onClose: () => void;
}

const PostViewerModal: React.FC<PostViewerModalProps> = ({ posts, users, currentUser, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex < posts.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                if (currentIndex < posts.length - 1) setCurrentIndex(p => p + 1);
            } else if (e.key === 'ArrowLeft') {
                if (currentIndex > 0) setCurrentIndex(p => p - 1);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, posts.length, onClose]);

    const currentPost = posts[currentIndex];
    const postUser = users[currentPost.userId];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white z-[110]"
                aria-label="Close post viewer"
            >
                <XIcon className="w-8 h-8" />
            </button>
            
            {currentIndex > 0 && (
                 <button 
                    onClick={handlePrev} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full z-[110]"
                    aria-label="Previous post"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            )}
           
            {currentIndex < posts.length - 1 && (
                <button 
                    onClick={handleNext} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full z-[110]"
                    aria-label="Next post"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            )}

            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <PostCard post={currentPost} user={postUser} currentUser={currentUser} />
            </div>
        </div>
    );
};

export default PostViewerModal;
