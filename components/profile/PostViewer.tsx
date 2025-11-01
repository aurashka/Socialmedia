import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Post } from '../../types';
import { DotsHorizontalIcon, ThumbUpIcon, ChatIcon, MessageIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, LockClosedIcon, XIcon } from '../Icons';
import { parseContent } from '../../utils/textUtils';
// FIX: updatePostPrivacy was missing from firebase services.
import { updatePost, deletePost, updatePostPrivacy, toggleReaction } from '../../services/firebase';
import { LikeReactionIcon, LoveReactionIcon, HahaReactionIcon, WowReactionIcon, SadReactionIcon, AngryReactionIcon } from '../ReactionIcons';

interface PostViewerProps {
  post: Post;
  user?: User;
  currentUser: User;
  onClose: () => void;
  // FIX: Add 'users' to props to parse mentions in content.
  users: Record<string, User>;
}

const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

const ReactionComponents: { [key: string]: React.FC<any> } = {
  like: LikeReactionIcon,
  love: LoveReactionIcon,
  haha: HahaReactionIcon,
  wow: WowReactionIcon,
  sad: SadReactionIcon,
  angry: AngryReactionIcon,
};

const ReactionDisplayComponents: { [key: string]: React.FC<any> } = {
  like: (props) => <LikeReactionIcon {...props} className="w-5 h-5" />,
  love: (props) => <LoveReactionIcon {...props} className="w-5 h-5" />,
  haha: (props) => <HahaReactionIcon {...props} className="w-5 h-5" />,
  wow: (props) => <WowReactionIcon {...props} className="w-5 h-5" />,
  sad: (props) => <SadReactionIcon {...props} className="w-5 h-5" />,
  angry: (props) => <AngryReactionIcon {...props} className="w-5 h-5" />,
};

const ReactionTextColors: { [key: string]: string } = {
  like: 'text-blue-500',
  love: 'text-red-500',
  haha: 'text-yellow-500',
  wow: 'text-yellow-500',
  sad: 'text-yellow-500',
  angry: 'text-red-600',
};

const PostViewer: React.FC<PostViewerProps> = ({ post: initialPost, user, currentUser, onClose, users }) => {
  const [post, setPost] = useState(initialPost);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const reactionTimerRef = useRef<number>();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUser?.id === post.userId;

  const reactionsSummary = useMemo(() => {
    if (!post.reactions) {
        return { total: 0, top: [], userReaction: null };
    }
    
    let total = 0;
    const counts: { [key: string]: number } = {};
    let userReaction: string | null = null;

    for (const type in post.reactions) {
        const reactors = post.reactions[type];
        if (reactors) {
            const count = Object.keys(reactors).length;
            if (count > 0) {
                counts[type] = count;
                total += count;
                if (!userReaction && reactors[currentUser.id]) {
                    userReaction = type;
                }
            }
        }
    }
    
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
    
    return { total, top, userReaction };
  }, [post.reactions, currentUser.id]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleReactionClick = async (reactionType: string) => {
    setShowReactions(false);
    await toggleReaction(post.id, currentUser.id, reactionType);
    // Note: We are not updating state locally for reactions as the main app's onValue listener will handle it.
  };

  const handleShowReactions = () => {
    clearTimeout(reactionTimerRef.current);
    setShowReactions(true);
  };
  
  const handleHideReactions = () => {
    reactionTimerRef.current = window.setTimeout(() => setShowReactions(false), 300);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(post.content);
    setIsMenuOpen(false);
  };
  
  const handleUpdatePost = async () => {
    if (editedContent.trim() === post.content.trim()) {
        setIsEditing(false);
        return;
    }
    setIsSaving(true);
    await updatePost(post.id, editedContent);
    setPost(p => ({...p, content: editedContent}));
    setIsEditing(false);
    setIsSaving(false);
  };
  
  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post.id);
      onClose();
    }
  };

  const handleTogglePrivacy = async () => {
    // FIX: Use `privacy` field from Post type instead of non-existent `isPublic`.
    const newPrivacy = (post.privacy ?? 'public') === 'public' ? 'private' : 'public';
    await updatePostPrivacy(post.id, newPrivacy);
    setPost(p => ({...p, privacy: newPrivacy}));
    setIsMenuOpen(false);
  };
  
  const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? post.mediaUrls!.length - 1 : prev - 1)); };
  const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === post.mediaUrls!.length - 1 ? 0 : prev + 1)); };

  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-0 md:p-4" onClick={onClose} role="dialog">
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-[110]"><XIcon className="w-8 h-8" /></button>
      
      <div className="bg-surface w-full h-full md:max-w-5xl md:h-[90vh] rounded-none md:rounded-lg flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Media Section */}
        <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative group aspect-square md:aspect-auto">
          {post.mediaUrls && post.mediaUrls.length > 0 ? (
            <>
              <img src={post.mediaUrls[currentImageIndex]} alt="Post media" className="max-h-full max-w-full object-contain" />
              {post.mediaUrls.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeftIcon className="w-6 h-6" /></button>
                  <button onClick={handleNextImage} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRightIcon className="w-6 h-6" /></button>
                </>
              )}
            </>
          ) : <p className="text-white">No media for this post.</p>}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/5 flex flex-col flex-grow min-h-0">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <a href={`#/profile/${user?.id}`} className="flex items-center space-x-3">
              <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-bold hover:underline">{user?.name}</p>
                <p className="text-xs text-secondary">{timeAgo(post.timestamp)}</p>
              </div>
            </a>
            {isOwner && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1"><DotsHorizontalIcon className="w-5 h-5" /></button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-10 border">
                  <button onClick={handleEdit} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100"><PencilIcon className="w-4 h-4" /><span>Edit Post</span></button>
                  {/* FIX: Use `privacy` field from Post type instead of non-existent `isPublic`. */}
                  <button onClick={handleTogglePrivacy} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100"><LockClosedIcon className="w-4 h-4" /><span>Make {(post.privacy ?? 'public') === 'public' ? 'Private' : 'Public'}</span></button>
                  <button onClick={handleDeletePost} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100"><TrashIcon className="w-4 h-4" /><span>Delete Post</span></button>
                </div>
              )}
            </div>
            )}
          </div>
          
          {/* Content & Comments */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {isEditing ? (
              <div>
                <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full p-2 border rounded resize-y bg-background" rows={4} autoFocus />
                <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 font-semibold rounded text-xs">Cancel</button>
                  <button onClick={handleUpdatePost} disabled={isSaving} className="px-3 py-1 bg-primary text-white font-semibold rounded disabled:bg-blue-300 text-xs">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              post.content && <p className="whitespace-pre-wrap text-sm">{parseContent(post.content, users)}</p>
            )}
             {/* Placeholder for comments */}
            <div className="text-center text-secondary py-10">Comments section coming soon.</div>
          </div>
          
          {/* Actions & Stats */}
          <div className="p-4 border-t flex-shrink-0 space-y-3">
             {reactionsSummary.total > 0 && (
                <div className="flex items-center space-x-2">
                    <div className="flex items-center">
{/* FIX: Correctly render dynamic components from the ReactionDisplayComponents object. */}
                        {reactionsSummary.top.map(type => {
                            const Icon = ReactionDisplayComponents[type];
                            return <Icon key={type} className="w-5 h-5 -mr-1" />;
                        })}
                    </div>
                    <span className="text-sm text-secondary hover:underline cursor-pointer">{reactionsSummary.total} people reacted</span>
                </div>
            )}
            <div className="border-t border-b py-1 flex justify-around items-center">
                <div className="relative" onMouseEnter={handleShowReactions} onMouseLeave={handleHideReactions}>
                    {showReactions && (
                        <div className="absolute bottom-full mb-2 flex space-x-1 bg-white shadow-lg rounded-full p-1 border">
{/* FIX: Correctly render dynamic components from the ReactionComponents object. */}
                            {REACTION_TYPES.map(type => {
                                const Icon = ReactionComponents[type];
                                return (
                                    <button key={type} onClick={() => handleReactionClick(type)} className="transform hover:scale-125 transition-transform">
                                        <Icon />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <button className={`flex-1 flex justify-center items-center p-2 font-semibold space-x-2 rounded-md ${reactionsSummary.userReaction ? ReactionTextColors[reactionsSummary.userReaction] : 'text-primary hover:bg-gray-100'}`} onClick={() => handleReactionClick(reactionsSummary.userReaction || 'like')}>
                        {reactionsSummary.userReaction ? React.createElement(ReactionDisplayComponents[reactionsSummary.userReaction], {className: 'w-6 h-6 !bg-transparent !border-none !p-0'}) : <ThumbUpIcon className="w-6 h-6" />}
                        <span className="capitalize">{reactionsSummary.userReaction || 'Like'}</span>
                    </button>
                </div>
                <button className="flex-1 flex justify-center items-center p-2 text-primary hover:bg-gray-100 rounded-md font-semibold space-x-2"><ChatIcon className="w-6 h-6" /><span>Comment</span></button>
                <button className="flex-1 flex justify-center items-center p-2 text-primary hover:bg-gray-100 rounded-md font-semibold space-x-2"><MessageIcon className="w-6 h-6" /><span>Share</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostViewer;
