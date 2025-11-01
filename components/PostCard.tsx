import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Post } from '../types';
import { DotsHorizontalIcon, HeartIcon, HeartIconFilled, ChatIcon, MessageIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, BookmarkIcon, BookmarkIconFilled, GlobeIcon, UsersIcon, LockClosedIcon } from './Icons';
import { parseContent } from '../utils/textUtils';
import { updatePost, deletePost, toggleReaction, toggleBookmark } from '../services/firebase';
import AddCommentForm from './comments/AddCommentForm';
import PostCardShimmer from './shimmers/PostCardShimmer';

interface PostCardProps {
  post: Post;
  user?: User;
  currentUser: User;
  users: Record<string, User>;
  onOpenCommentSheet: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, currentUser, users, onOpenCommentSheet }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUser?.id === post.userId;
  const isBookmarked = !!currentUser.bookmarkedPosts?.[post.id];

  const reactionsSummary = useMemo(() => {
    if (!post.reactions || !post.reactions.like) {
        return { total: 0, userReaction: null };
    }
    const likers = Object.keys(post.reactions.like);
    const total = likers.length;
    const userReaction = likers.includes(currentUser.id) ? 'like' : null;
    return { total, userReaction };
  }, [post.reactions, currentUser.id]);

  useEffect(() => {
    setIsLiked(!!reactionsSummary.userReaction);
  }, [reactionsSummary.userReaction]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReactionClick = async (reactionType: string) => {
    if (reactionType === 'like' && !isLiked) {
      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 600);
    }
    try {
        await toggleReaction(post, currentUser.id, reactionType);
    } catch (error) {
        console.error("Failed to react:", error);
    }
  };
  
  const handleToggleBookmark = async () => {
      try {
          await toggleBookmark(currentUser.id, post.id);
      } catch (error) {
          console.error("Failed to toggle bookmark:", error);
      }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(post.content);
    setIsMenuOpen(false);
  };
  
  const handleUpdatePost = async () => {
    if (editedContent.trim() === post.content.trim()) { setIsEditing(false); return; }
    setIsSaving(true);
    try {
        await updatePost(post.id, editedContent);
        setIsEditing(false);
    } catch (error) {
        console.error("Failed to update post:", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeletePost = async () => {
    setIsMenuOpen(false);
    if (window.confirm("Are you sure you want to delete this post?")) {
        try {
            await deletePost(post.id);
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    }
  };
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? post.mediaUrls!.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === post.mediaUrls!.length - 1 ? 0 : prev + 1));
  };
  
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString("en-US");
  };

  const PrivacyIcon = useMemo(() => {
    switch(post.privacy) {
        case 'friends': return UsersIcon;
        case 'private': return LockClosedIcon;
        case 'public':
        default:
            return GlobeIcon;
    }
  }, [post.privacy]);

  if (!user) {
    return <PostCardShimmer />;
  }
  
  return (
    <div className="bg-surface dark:bg-gray-900 md:border-y border-divider dark:border-gray-700">
      {/* Post Header */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <a href={`#/profile/${user.id}`}>
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
          </a>
          <div>
            <a href={`#/profile/${user.id}`} className="font-bold hover:underline text-sm text-primary dark:text-gray-100">{user.name}</a>
             <div className="flex items-center space-x-1.5 text-xs text-secondary dark:text-gray-400">
                <span>{timeAgo(post.timestamp)}</span>
                <PrivacyIcon className="w-3 h-3" strokeWidth={2}/>
             </div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-gray-100 p-1">
                <DotsHorizontalIcon className="w-5 h-5" />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-divider dark:border-gray-700">
                    {isOwner && (
                        <>
                        <button onClick={handleEdit} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-primary dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit Post</span>
                        </button>
                        <button onClick={handleDeletePost} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete Post</span>
                        </button>
                        </>
                    )}
                    {!isOwner && <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Report</button>}
                </div>
            )}
        </div>
      </div>

      {/* Post Media */}
      <div className="relative group bg-gray-100 dark:bg-black">
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="relative aspect-square overflow-hidden">
            <img src={post.mediaUrls[currentImageIndex]} alt={`Post media ${currentImageIndex + 1}`} className="w-full h-full object-contain" onDoubleClick={() => handleReactionClick('like')} />
            {animateLike && (
                 <HeartIconFilled className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/90 drop-shadow-lg animate-heart-pop-large" style={{ width: '100px', height: '100px' }}/>
            )}
          </div>
        )}
        {post.mediaUrls && post.mediaUrls.length > 1 && (
            <>
                <button onClick={handlePrevImage} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={handleNextImage} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    {post.mediaUrls.map((_, index) => (
                        <div key={index} className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-primary dark:bg-white' : 'bg-gray-500'}`}></div>
                    ))}
                </div>
            </>
        )}
      </div>
      
      {/* Post Actions */}
       <div className="p-3 flex justify-between items-center text-primary dark:text-gray-100">
          <div className="flex space-x-4">
            <button onClick={() => handleReactionClick('like')}>
                <HeartIconFilled className={`w-7 h-7 text-red-500 transition-transform ${animateLike ? 'animate-heart-pop' : ''} ${!isLiked && 'hidden'}`} />
                <HeartIcon className={`w-7 h-7 ${isLiked && 'hidden'}`} />
            </button>
            <button onClick={() => onOpenCommentSheet(post.id)}><ChatIcon className="w-7 h-7"/></button>
            <button><MessageIcon className="w-7 h-7"/></button>
          </div>
          <button onClick={handleToggleBookmark}>
              {isBookmarked ? (
                  <BookmarkIconFilled className="w-7 h-7"/>
              ) : (
                  <BookmarkIcon className="w-7 h-7"/>
              )}
          </button>
       </div>

      {/* Post Stats & Content */}
      <div className="px-3 pb-3 space-y-1.5 text-sm text-primary dark:text-gray-100">
        {reactionsSummary.total > 0 && (
            <p className="font-bold">{reactionsSummary.total.toLocaleString()} {reactionsSummary.total === 1 ? 'like' : 'likes'}</p>
        )}
        
        {post.content && (
            <p className="whitespace-pre-wrap">
                <a href={`#/profile/${user.id}`} className="font-bold hover:underline mr-1.5">{user.handle}</a>
                {parseContent(post.content, users)}
            </p>
        )}
        {post.commentCount > 0 && !post.areCommentsDisabled && (
          <button onClick={() => onOpenCommentSheet(post.id)} className="text-sm text-secondary dark:text-gray-400 cursor-pointer hover:underline">
            View all {post.commentCount} comments
          </button>
        )}
      </div>
      
      {post.areCommentsDisabled ? (
        <div className="px-3 pb-3 text-sm text-secondary dark:text-gray-400">
            Comments are turned off for this post.
        </div>
      ) : (
       <div className="border-t border-divider dark:border-gray-700 px-3 py-2">
            <AddCommentForm postId={post.id} postOwnerId={post.userId} currentUser={currentUser} allUsers={users} onCommentAdded={() => onOpenCommentSheet(post.id)} />
       </div>
      )}
       <style>{`
            @keyframes heart-pop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
            .animate-heart-pop { animation: heart-pop 0.3s ease-out; }
            @keyframes heart-pop-large { 0% { opacity: 0.9; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0; transform: scale(1.2); } }
            .animate-heart-pop-large { animation: heart-pop-large 0.6s ease-in-out; }
        `}</style>
    </div>
  );
};

export default PostCard;