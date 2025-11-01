import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Post } from '../types';
import { DotsHorizontalIcon, HeartIcon, HeartIconFilled, ChatIcon, MessageIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, LockClosedIcon, BookmarkIcon, BookmarkIconFilled } from './Icons';
import { parseContent } from '../utils/textUtils';
import { updatePost, deletePost, updatePostPrivacy, toggleReaction, toggleBookmark } from '../services/firebase';
import CommentSection from './comments/CommentSection';
import AddCommentForm from './comments/AddCommentForm';
// FIX: Import PostCardShimmer component.
import PostCardShimmer from './shimmers/PostCardShimmer';

interface PostCardProps {
  post: Post;
  user?: User;
  currentUser: User;
  users: Record<string, User>;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, currentUser, users }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllComments, setShowAllComments] = useState(false);
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
        await toggleReaction(post.id, currentUser.id, reactionType);
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

  const handleTogglePrivacy = async () => {
    setIsMenuOpen(false);
    try {
        await updatePostPrivacy(post.id, !(post.isPublic ?? true));
    } catch (error) {
        console.error("Failed to update post privacy:", error);
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
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString("en-US");
  };

  if (!user) {
    return <PostCardShimmer />;
  }
  
  return (
    <div className="bg-surface md:border-y border-divider">
      {/* Post Header */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <a href={`#/profile/${user.id}`}>
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
          </a>
          <div>
            <a href={`#/profile/${user.id}`} className="font-bold hover:underline text-sm">{user.name}</a>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary hover:text-primary p-1">
                <DotsHorizontalIcon className="w-5 h-5" />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black rounded-md shadow-lg py-1 z-10 border border-divider">
                    {isOwner && (
                        <>
                        <button onClick={handleEdit} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-primary hover:bg-gray-800">
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit Post</span>
                        </button>
                        <button onClick={handleTogglePrivacy} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-primary hover:bg-gray-800">
                            <LockClosedIcon className="w-4 h-4" />
                            <span>Make {(post.isPublic ?? true) ? 'Private' : 'Public'}</span>
                        </button>
                        <button onClick={handleDeletePost} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-800">
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete Post</span>
                        </button>
                        </>
                    )}
                    {!isOwner && <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800">Report</button>}
                </div>
            )}
        </div>
      </div>

      {/* Post Media */}
      <div className="relative group bg-black">
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="relative aspect-square overflow-hidden">
            <img src={post.mediaUrls[currentImageIndex]} alt={`Post media ${currentImageIndex + 1}`} className="w-full h-full object-contain" onDoubleClick={() => handleReactionClick('like')} />
            {animateLike && (
                 <HeartIconFilled className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 animate-heart-pop-large" style={{ width: '100px', height: '100px' }}/>
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
                        <div key={index} className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-500'}`}></div>
                    ))}
                </div>
            </>
        )}
      </div>
      
      {/* Post Actions */}
       <div className="p-3 flex justify-between items-center">
          <div className="flex space-x-4">
            <button onClick={() => handleReactionClick('like')}>
                <HeartIconFilled className={`w-7 h-7 text-red-500 transition-transform ${animateLike ? 'animate-heart-pop' : ''} ${!isLiked && 'hidden'}`} />
                <HeartIcon className={`w-7 h-7 text-primary ${isLiked && 'hidden'}`} />
            </button>
            <button><ChatIcon className="w-7 h-7 text-primary"/></button>
            <button><MessageIcon className="w-7 h-7 text-primary"/></button>
          </div>
          <button onClick={handleToggleBookmark}>
              {isBookmarked ? (
                  <BookmarkIconFilled className="w-7 h-7 text-primary"/>
              ) : (
                  <BookmarkIcon className="w-7 h-7 text-primary"/>
              )}
          </button>
       </div>

      {/* Post Stats & Content */}
      <div className="px-3 pb-3 space-y-1.5 text-sm">
        {reactionsSummary.total > 0 && (
            <p className="font-bold">{reactionsSummary.total.toLocaleString()} {reactionsSummary.total === 1 ? 'like' : 'likes'}</p>
        )}
        
        {post.content && (
            <p className="whitespace-pre-wrap">
                <a href={`#/profile/${user.id}`} className="font-bold hover:underline mr-1.5">{user.handle}</a>
                {parseContent(post.content, users)}
            </p>
        )}
        {post.commentCount > 0 && (
          <button onClick={() => setShowAllComments(prev => !prev)} className="text-sm text-secondary cursor-pointer hover:underline">
            {showAllComments ? 'Hide comments' : `View all ${post.commentCount} comments`}
          </button>
        )}

        {showAllComments && <CommentSection postId={post.id} currentUser={currentUser} users={users} />}
        
        <p className="text-xs text-secondary uppercase">{timeAgo(post.timestamp)}</p>
      </div>

       <div className="border-t border-divider px-3 py-2">
            <AddCommentForm postId={post.id} currentUser={currentUser} users={users} />
       </div>
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
