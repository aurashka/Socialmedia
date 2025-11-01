import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { User, Post, Comment as CommentType } from '../../types';
import { parseContent } from '../../utils/textUtils';
import AddCommentForm from './AddCommentForm';
import { fetchReplies, toggleCommentReaction, updateComment, deleteComment } from '../../services/firebase';
import { HeartIcon, HeartIconFilled, DotsHorizontalIcon, PencilIcon, TrashIcon } from '../Icons';

interface CommentProps {
    comment: CommentType;
    post: Post;
    currentUser: User;
    users: Record<string, User>;
    onCommentChange: () => void; // To trigger re-fetch in sheet
}

const Comment: React.FC<CommentProps> = ({ comment, post, currentUser, users, onCommentChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const user = users[comment.userId];

    const isLiked = useMemo(() => {
        return !!comment.reactions?.like?.[currentUser.id];
    }, [comment.reactions, currentUser.id]);

    const isOwner = comment.userId === currentUser.id;
    const isPostOwner = post.userId === currentUser.id;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleLike = async () => {
        await toggleCommentReaction(comment.id, currentUser.id, 'like');
        onCommentChange(); // Refresh comments to show updated like state
    };
    
    const handleUpdateComment = async () => {
        if (!editedContent.trim() || editedContent.trim() === comment.content) {
            setIsEditing(false);
            return;
        }
        await updateComment(comment.id, editedContent.trim());
        setIsEditing(false);
        onCommentChange();
    }
    
    const handleDeleteComment = async () => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            await deleteComment(comment);
            onCommentChange();
        }
    }

    const loadReplies = async () => {
        if (loadingReplies) return;
        setLoadingReplies(true);
        const fetchedReplies = await fetchReplies(comment.id);
        setReplies(fetchedReplies);
        setShowReplies(true);
        setLoadingReplies(false);
    };

    const timeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes < 1) return `now`;
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w`;
    };

    if (!user) return null;

    return (
        <div className="flex items-start space-x-3 text-sm py-1 group">
            <a href={`#/profile/${user.id}`}>
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mt-1" />
            </a>
            <div className="flex-1">
                {!isEditing ? (
                    <>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
                            <a href={`#/profile/${user.id}`} className="font-bold hover:underline mr-1.5">{user.name}</a>
                            {parseContent(comment.content, users)}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-secondary dark:text-gray-400 px-3 pt-1">
                            <span>{timeAgo(comment.timestamp)}</span>
                             <button className="font-semibold hover:underline" onClick={handleToggleLike}>
                                {isLiked ? 'Unlike' : 'Like'}
                            </button>
                            <button className="font-semibold hover:underline" onClick={() => setShowReplyForm(!showReplyForm)}>Reply</button>
                        </div>
                    </>
                ) : (
                    <div className="w-full">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full text-sm p-2 border border-divider dark:border-gray-600 rounded-md bg-background dark:bg-gray-800 focus:outline-none focus:border-accent"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex items-center space-x-2 mt-1">
                             <button onClick={handleUpdateComment} className="text-xs font-semibold text-accent">Save</button>
                             <button onClick={() => setIsEditing(false)} className="text-xs text-secondary">Cancel</button>
                        </div>
                    </div>
                )}
                 {comment.replyCount > 0 && !showReplies && (
                    <button onClick={loadReplies} className="text-xs font-semibold text-secondary px-2 py-1 hover:underline">
                        {loadingReplies ? 'Loading...' : `— View ${comment.replyCount} ${comment.replyCount > 1 ? 'replies' : 'reply'}`}
                    </button>
                )}
            </div>
            <div className="relative flex-shrink-0 mt-1">
                <button onClick={handleToggleLike}>
                    {isLiked ? <HeartIconFilled className="w-4 h-4 text-red-500"/> : <HeartIcon className="w-4 h-4 text-secondary" />}
                </button>
                 {(isOwner || isPostOwner) && (
                     <div ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 -m-1 ml-1 opacity-0 group-hover:opacity-100">
                            <DotsHorizontalIcon className="w-4 h-4 text-secondary"/>
                        </button>
                        {isMenuOpen && (
                             <div className="absolute right-0 mt-2 w-32 bg-surface dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-divider dark:border-gray-700">
                                {isOwner && (
                                    <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center space-x-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <PencilIcon className="w-4 h-4"/><span>Edit</span>
                                    </button>
                                )}
                                 <button onClick={handleDeleteComment} className="w-full text-left flex items-center space-x-2 px-3 py-1.5 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <TrashIcon className="w-4 h-4"/><span>Delete</span>
                                </button>
                             </div>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default Comment;