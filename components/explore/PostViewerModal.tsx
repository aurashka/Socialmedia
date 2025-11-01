import React, { useEffect } from 'react';
import type { Post, User } from '../../types';
import PostCard from '../PostCard';
import { XIcon } from '../Icons';

interface PostDetailModalProps {
    post: Post;
    user?: User;
    currentUser: User;
    users: Record<string, User>;
    onClose: () => void;
    onOpenCommentSheet: (postId: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, user, currentUser, users, onClose, onOpenCommentSheet }) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!post || !user) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4" 
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
            
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <PostCard post={post} user={user} currentUser={currentUser} users={users} onOpenCommentSheet={onOpenCommentSheet} />
            </div>
        </div>
    );
};

export default PostDetailModal;