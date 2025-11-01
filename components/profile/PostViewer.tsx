import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Post } from '../../types';
import { DotsHorizontalIcon, ThumbUpIcon, ChatIcon, MessageIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, LockClosedIcon, XIcon } from '../Icons';
import { parseContent } from '../../utils/textUtils';
import { updatePost, deletePost, updatePostPrivacy, toggleReaction } from '../../services/firebase';
import { LikeReactionIcon, LoveReactionIcon, HahaReactionIcon, WowReactionIcon, SadReactionIcon, AngryReactionIcon } from '../ReactionIcons';
import AddCommentForm from '../comments/AddCommentForm';

interface PostViewerProps {
  post: Post;
  user?: User;
  currentUser: User;
  onClose: () => void;
  users: Record<string, User>;
  onOpenCommentSheet: (postId: string) => void;
}

const PostViewer: React.FC<PostViewerProps> = ({ post: initialPost, user, currentUser, onClose, users, onOpenCommentSheet }) => {
  const [post, setPost] = useState(initialPost);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUser?.id === post.userId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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
      
      <div className="bg-surface dark:bg-gray-900 text-primary dark:text-gray-100 w-full h-full md:max-w-5xl md:h-[90vh] rounded-none md:rounded-lg flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
          ) : <div className="p-4 flex items-center justify-center h-full"><p className="text-secondary dark:text-gray-400">No media for this post.</p></div>}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/5 flex flex-col flex-grow min-h-0">
          {/* Header */}
          <div className="p-4 border-b border-divider dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <a href={`#/profile/${user?.id}`} className="flex items-center space-x-3">
              <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-bold hover:underline">{user?.name}</p>
                <p className="text-xs text-secondary dark:text-gray-400">{timeAgo(post.timestamp)}</p>
              </div>
            </a>
            {isOwner && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-secondary dark:text-gray-400"><DotsHorizontalIcon className="w-5 h-5" /></button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-divider dark:border-gray-700">
                  <button onClick={handleEdit} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><PencilIcon className="w-4 h-4" /><span>Edit Post</span></button>
                  <button onClick={handleTogglePrivacy} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><LockClosedIcon className="w-4 h-4" /><span>Make {(post.privacy ?? 'public') === 'public' ? 'Private' : 'Public'}</span></button>
                  <button onClick={handleDeletePost} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"><TrashIcon className="w-4 h-4" /><span>Delete Post</span></button>
                </div>
              )}
            </div>
            )}
          </div>
          
          {/* Content & Comments */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {isEditing ? (
              <div>
                <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full p-2 border border-divider dark:border-gray-600 rounded resize-y bg-background dark:bg-gray-800" rows={4} autoFocus />
                <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 font-semibold rounded text-xs">Cancel</button>
                  <button onClick={handleUpdatePost} disabled={isSaving} className="px-3 py-1 bg-accent text-white font-semibold rounded disabled:bg-blue-300 text-xs">{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              post.content && <p className="whitespace-pre-wrap text-sm">{parseContent(post.content, users)}</p>
            )}
            
            <div className="border-t border-divider dark:border-gray-700 pt-4">
                 <button 
                    onClick={() => onOpenCommentSheet(post.id)} 
                    className="text-sm text-secondary dark:text-gray-400 hover:underline"
                >
                    View all {post.commentCount} comments...
                </button>
            </div>
          </div>
          
          {/* Actions & Stats */}
          <div className="p-4 border-t border-divider dark:border-gray-700 flex-shrink-0">
             <AddCommentForm postId={post.id} postOwnerId={post.userId} currentUser={currentUser} allUsers={users} onCommentAdded={() => onOpenCommentSheet(post.id)}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostViewer;