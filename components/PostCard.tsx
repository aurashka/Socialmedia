import React, { useState, useEffect, useRef } from 'react';
import type { User, Post } from '../types';
import { DotsHorizontalIcon, ThumbUpIcon, ChatAltIcon, ShareIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
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
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? post.mediaUrls!.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === post.mediaUrls!.length - 1 ? 0 : prev + 1));
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
    if (!post.mediaUrls || post.mediaUrls.length === 0) return null;

    const images = post.mediaUrls;
    
    if (images.length === 1) {
        return (
            <div className="bg-black flex justify-center items-center">
                <img src={images[0]} alt="Post media" className="max-h-[70vh] w-auto object-contain cursor-pointer" onClick={() => setLightboxImage(images[0])}/>
            </div>
        )
    }

    return (
        <div className="relative group bg-black">
            <div className="relative aspect-square overflow-hidden flex justify-center items-center">
                 <img src={images[currentImageIndex]} alt={`Post media ${currentImageIndex + 1}`} className="max-h-full max-w-full object-contain transition-transform duration-300" />
            </div>
            
            <button onClick={handlePrevImage} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={handleNextImage} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ChevronRightIcon className="w-6 h-6" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
                {images.map((_, index) => (
                    <div key={index} className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-400'}`}></div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <>
    <div className="bg-card rounded-lg shadow-sm border border-divider">
      {/* Post Header */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <a href={`#/profile/${user.id}`}>
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
          </a>
          <div>
            <a href={`#/profile/${user.id}`} className="font-bold hover:underline text-sm">{user.name}</a>
             {post.tag && <p className="text-xs text-text-secondary">{post.tag}</p>}
          </div>
        </div>
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-secondary hover:text-text-primary p-1">
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

      {/* Post Media */}
      {renderMedia()}
      
      {/* Post Actions */}
       <div className="p-2 flex justify-between items-center">
          <div className="flex space-x-1">
              <ActionButton Icon={ThumbUpIcon} />
              <ActionButton Icon={ChatAltIcon} />
              <ActionButton Icon={ShareIcon} />
          </div>
       </div>

      {/* Post Stats */}
      <div className="px-4 pb-1 text-sm">
        <span className="font-semibold text-text-primary">{post.likes} likes</span>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        {isEditing ? (
          <div>
              <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded-md resize-y bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  rows={3}
                  autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 text-text-primary font-semibold rounded-md hover:bg-gray-300 text-xs">Cancel</button>
                  <button onClick={handleUpdatePost} disabled={isSaving} className="px-3 py-1 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-xs">
                      {isSaving ? 'Saving...' : 'Save'}
                  </button>
              </div>
          </div>
        ) : (
          post.content && (
            <p className="whitespace-pre-wrap text-text-primary text-sm">
              <a href={`#/profile/${user.id}`} className="font-bold hover:underline mr-1.5">{user.handle}</a>
              {parseContent(post.content)}
            </p>
          )
        )}
      </div>

      {/* Comments and Timestamp */}
      {post.comments > 0 && (
        <a href="#" className="px-4 pb-2 text-sm text-text-secondary cursor-pointer hover:underline">
          View all {post.comments} comments
        </a>
      )}
      <p className="px-4 pb-3 text-xs text-text-secondary uppercase">{timeAgo(post.timestamp)}</p>

    </div>
    {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </>
  );
};

interface ActionButtonProps {
    Icon: React.ElementType;
}

const ActionButton: React.FC<ActionButtonProps> = ({ Icon }) => (
    <button className="flex justify-center items-center p-2 text-text-secondary hover:text-text-primary rounded-md transition-colors duration-200">
        <Icon className="w-6 h-6" />
    </button>
)

export default PostCard;