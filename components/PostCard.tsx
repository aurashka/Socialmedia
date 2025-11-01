import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Post } from '../types';
import { DotsHorizontalIcon, HeartIcon, HeartIconFilled, ChatIcon, MessageIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, LockClosedIcon } from './Icons';
import { parseContent } from '../utils/textUtils';
import ImageLightbox from './ImageLightbox';
import { updatePost, deletePost, updatePostPrivacy, toggleReaction } from '../services/firebase';
import { LikeReactionIcon, LoveReactionIcon, HahaReactionIcon, WowReactionIcon, SadReactionIcon, AngryReactionIcon } from './ReactionIcons';
import CommentSection from './comments/CommentSection';
import AddCommentForm from './comments/AddCommentForm';

interface PostCardProps {
  post: Post;
  user?: User;
  currentUser: User;
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
  like: 'text-red-500',
  love: 'text-red-500',
  haha: 'text-yellow-500',
  wow: 'text-yellow-500',
  sad: 'text-yellow-500',
  angry: 'text-red-600',
};


const PostCard: React.FC<PostCardProps> = ({ post, user, currentUser, users }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
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
    setIsLiked(reactionsSummary.userReaction === 'like');
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
    setShowReactions(false);
    if (reactionType === 'like') {
        const currentlyLiked = reactionsSummary.userReaction === 'like';
        if (!currentlyLiked) {
          setAnimateLike(true);
          setTimeout(() => setAnimateLike(false), 300);
        }
    }
    try {
        await toggleReaction(post.id, currentUser.id, reactionType);
    } catch (error) {
        console.error("Failed to react:", error);
        alert("Could not save reaction. Please try again.");
    }
  };

  const handleShowReactions = () => {
    clearTimeout(reactionTimerRef.current);
    setShowReactions(true);
  };
  
  const handleHideReactions = () => {
    reactionTimerRef.current = window.setTimeout(() => {
        setShowReactions(false);
    }, 300);
  };
  
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

  const handleTogglePrivacy = async () => {
    setIsMenuOpen(false);
    try {
        await updatePostPrivacy(post.id, !(post.isPublic ?? true));
    } catch (error) {
        console.error("Failed to update post privacy:", error);
        alert("Could not update post privacy. Please try again.");
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
      <div className="bg-surface rounded-lg p-4 animate-pulse border border-divider">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
        <div className="mt-4 h-64 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `Just now`;
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
    
    return (
        <div className="relative group bg-gray-100 mt-3 rounded-lg overflow-hidden border-b border-divider">
            <div className="relative aspect-square overflow-hidden flex justify-center items-center">
                 <img src={images[currentImageIndex]} alt={`Post media ${currentImageIndex + 1}`} className="max-h-full max-w-full object-contain transition-transform duration-300" onDoubleClick={() => handleReactionClick('like')} />
            </div>
            
            {images.length > 1 && (
                <>
                    <button onClick={handlePrevImage} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextImage} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
                        {images.map((_, index) => (
                            <div key={index} className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-400'}`}></div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
  };

  return (
    <>
    <div className="bg-surface rounded-lg">
      {/* Post Header */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <a href={`#/profile/${user.id}`}>
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
          </a>
          <div>
            <div className="flex items-center space-x-1.5">
                <a href={`#/profile/${user.id}`} className="font-bold hover:underline text-sm">{user.name}</a>
                {user.badgeUrl && <img src={user.badgeUrl} alt="badge" className="w-4 h-4" />}
                {isOwner && (post.isPublic === false) && (
                    <div title="This post is private">
                        <LockClosedIcon className="w-3 h-3 text-secondary" />
                    </div>
                )}
            </div>
             <p className="text-xs text-secondary">{timeAgo(post.timestamp)}</p>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary hover:text-primary p-1">
            <DotsHorizontalIcon className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-10 border border-divider">
                {isOwner && (
                    <>
                    <button onClick={handleEdit} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-primary hover:bg-gray-100">
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit Post</span>
                    </button>
                     <button onClick={handleTogglePrivacy} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-primary hover:bg-gray-100">
                        <LockClosedIcon className="w-4 h-4" />
                        <span>Make {(post.isPublic ?? true) ? 'Private' : 'Public'}</span>
                    </button>
                    <button onClick={handleDeletePost} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete Post</span>
                    </button>
                    </>
                )}
                {!isOwner && (
                    <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Report</button>
                )}
            </div>
          )}
        </div>
        
      </div>

      {/* Post Media */}
      {renderMedia()}
      
      {/* Post Actions */}
       <div className="p-2 flex justify-between items-center">
          <div className="flex space-x-2">
            <div className="relative" onMouseEnter={handleShowReactions} onMouseLeave={handleHideReactions}>
                {showReactions && (
                    <div className="absolute bottom-full mb-2 flex space-x-1 bg-white shadow-lg rounded-full p-1 border">
                        {REACTION_TYPES.map(type => {
                            const Icon = ReactionComponents[type];
                            return (
                                <button key={type} onClick={() => handleReactionClick(type)} className="transform hover:scale-125 transition-transform duration-150">
                                    <Icon />
                                </button>
                            )
                        })}
                    </div>
                )}
                <button
                  className={`flex justify-center items-center p-2 rounded-md transition-colors duration-200 font-semibold space-x-2 ${reactionsSummary.userReaction === 'like' ? ReactionTextColors['like'] : 'text-primary hover:bg-gray-100'}`}
                  onClick={() => handleReactionClick('like')}
                >
                    {isLiked 
                        ? <HeartIconFilled className={`w-6 h-6 transition-transform ${animateLike ? 'animate-heart-pop' : ''}`} />
                        : <HeartIcon className="w-6 h-6" />
                    }
                  <span className={`${isLiked ? 'text-red-500' : ''} capitalize`}>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
            </div>
            <button onClick={() => setShowComments(true)} className="flex justify-center items-center p-2 text-primary hover:bg-gray-100 rounded-md transition-colors duration-200 font-semibold space-x-2">
                <ChatIcon className="w-6 h-6" />
                <span>Comment</span>
            </button>
            <ActionButton Icon={MessageIcon} text="Share" />
          </div>
       </div>

      {/* Post Stats & Content */}
      <div className="px-4 pb-4 space-y-2">
        {reactionsSummary.total > 0 && (
            <div className="flex items-center space-x-2">
                <div className="flex items-center">
                    {reactionsSummary.top.map(type => {
                        const Icon = ReactionDisplayComponents[type];
                        return <Icon key={type} className="w-5 h-5 -mr-1" />;
                    })}
                </div>
                <span className="text-sm text-secondary hover:underline cursor-pointer">{reactionsSummary.total}</span>
            </div>
        )}
        
        {isEditing ? (
            <div>
              <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded-md resize-y bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  rows={2}
                  autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 text-primary font-semibold rounded-md hover:bg-gray-300 text-xs">Cancel</button>
                  <button onClick={handleUpdatePost} disabled={isSaving} className="px-3 py-1 bg-accent text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-xs">
                      {isSaving ? 'Saving...' : 'Save'}
                  </button>
              </div>
            </div>
        ) : (
            post.content && (
              <p className="whitespace-pre-wrap text-primary text-sm">
                <a href={`#/profile/${user.id}`} className="font-bold hover:underline mr-1.5">{user.handle}</a>
                {parseContent(post.content, users)}
              </p>
            )
        )}
        {post.commentCount > 0 && (
          <button onClick={() => setShowComments(true)} className="text-sm text-secondary cursor-pointer hover:underline">
            View all {post.commentCount} comments
          </button>
        )}

        {showComments && <CommentSection postId={post.id} currentUser={currentUser} users={users} />}

        <AddCommentForm postId={post.id} currentUser={currentUser} users={users} />
      </div>
    </div>
    {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
    <style>{`
      @keyframes heart-pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      .animate-heart-pop {
        animation: heart-pop 0.3s ease-out;
      }
    `}</style>
    </>
  );
};

interface ActionButtonProps {
    Icon: React.ElementType;
    text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ Icon, text }) => (
    <button className="flex justify-center items-center p-2 text-primary hover:bg-gray-100 rounded-md transition-colors duration-200 font-semibold space-x-2">
        <Icon className="w-6 h-6" />
        <span>{text}</span>
    </button>
)

export default PostCard;