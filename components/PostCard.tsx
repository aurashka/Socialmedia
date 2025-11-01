import React, { useState, useEffect, useRef } from 'react';
import type { User, Post } from '../types';
import { DotsHorizontalIcon, ThumbUpIcon, ChatAltIcon, ShareIcon, PencilIcon, TrashIcon } from './Icons';
import { parseContent } from '../utils/textUtils';
import ImageLightbox from './ImageLightbox';
import { updatePost, deletePost } from '../services/firebase';

interface PostCardProps {
  post: Post;
  user?: User;
  currentUser: User;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, currentUser }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUser?.id === post.userId;

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
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(post.content);
    setIsMenuOpen(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleUpdatePost = async () => {
    if (editedContent.trim() === post.content.trim()) {
        setIsEditing(false);
        return;
    }
    setIsSaving(true);
    try {
        await updatePost(post.id, editedContent);
        setIsEditing(false);
    } catch (error) {
        console.error("Failed to update post:", error);
        alert("Could not update post. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeletePost = async () => {
    setIsMenuOpen(false);
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
        try {
            await deletePost(post.id);
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Could not delete post. Please try again.");
        }
    }
  };

  if (!user) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const renderMedia = () => {
    if (post.mediaType === 'video') {
      return (
         <div className="relative aspect-video cursor-pointer" onClick={() => alert('Video player not implemented yet!')}>
             <img src={post.mediaUrls?.[0]} alt="Post media" className="w-full h-full object-cover" />
             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="w-16 h-16 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-75 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                </div>
             </div>
         </div>
      )
    }

    if (!post.mediaUrls || post.mediaUrls.length === 0) return null;

    const images = post.mediaUrls;
    const gridClasses = [
        "", // 0 images
        "grid-cols-1", // 1 image
        "grid-cols-2", // 2 images
        "grid-cols-2", // 3 images
        "grid-cols-2", // 4 images
        "grid-cols-2" // 5 images
    ];

    return (
        <div className={`grid ${gridClasses[images.length]} gap-1`}>
            {images.map((url, index) => {
                let spanClass = "";
                if (images.length === 3 && index === 0) spanClass = "row-span-2";
                if (images.length === 5 && index < 2) spanClass = "col-span-1";
                if (images.length === 5 && index >= 2) spanClass = "col-span-2";

                return (
                    <div key={index} className={`relative cursor-pointer ${spanClass}`} onClick={() => setLightboxImage(url)}>
                         <img src={url} alt={`Post media ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                )
            })}
        </div>
    );
  };

  return (
    <>
    <div className="bg-card rounded-lg shadow-sm">
      {/* Post Header */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <a href={`#/profile/${user.id}`}>
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
          </a>
          <div>
            <a href={`#/profile/${user.id}`} className="font-bold hover:underline">{user.name}</a>
            <div className="flex items-center space-x-2 text-xs text-text-secondary">
              <span>{timeAgo(post.timestamp)}</span>
              {post.tag && (
                <>
                  <span>·</span>
                  <span className="bg-blue-100 text-primary font-semibold px-2 py-0.5 rounded-full">{post.tag}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-gray-100">
              <DotsHorizontalIcon className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10">
                  <button onClick={handleEdit} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100">
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit Post</span>
                  </button>
                  <button onClick={handleDeletePost} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete Post</span>
                  </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="px-4 pb-2">
            <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border rounded-md resize-y bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                autoFocus
            />
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={handleCancelEdit} className="px-4 py-1.5 bg-gray-200 text-text-primary font-semibold rounded-md hover:bg-gray-300 text-sm">Cancel</button>
                <button onClick={handleUpdatePost} disabled={isSaving} className="px-4 py-1.5 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
      ) : (
        <p className="px-4 pb-2 whitespace-pre-wrap text-text-primary">{parseContent(post.content)}</p>
      )}


      {/* Post Media */}
      <div className="bg-gray-100 max-h-[600px] overflow-hidden">
        {renderMedia()}
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 flex justify-between items-center text-sm text-text-secondary">
        <div className="flex items-center space-x-1">
          <span className="bg-primary p-1 rounded-full">
            <ThumbUpIcon className="w-3 h-3 text-white" />
          </span>
          <span>{post.likes}</span>
        </div>
        <span>{post.comments} comments</span>
      </div>

      {/* Post Actions */}
      <div className="border-t mx-4 flex justify-around">
        <ActionButton Icon={ThumbUpIcon} text="Like" />
        <ActionButton Icon={ChatAltIcon} text="Comment" />
        <ActionButton Icon={ShareIcon} text="Share" />
      </div>
    </div>
    {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </>
  );
};

interface ActionButtonProps {
    Icon: React.ElementType;
    text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ Icon, text }) => (
    <button className="flex-1 flex justify-center items-center space-x-2 py-2 text-text-secondary font-semibold hover:bg-gray-100 rounded-md transition-colors duration-200">
        <Icon className="w-5 h-5" />
        <span>{text}</span>
    </button>
)

export default PostCard;