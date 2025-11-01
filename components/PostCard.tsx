
import React from 'react';
import type { User, Post } from '../types';
import { ChevronDownIcon, ThumbUpIcon, ChatAltIcon, ShareIcon } from './Icons';

interface PostCardProps {
  post: Post;
  user?: User;
}

const PostCard: React.FC<PostCardProps> = ({ post, user }) => {
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

  return (
    <div className="bg-card rounded-lg shadow-sm">
      {/* Post Header */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold">{user.name} {post.userId === 'user2' && "added video"}</p>
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
        <button className="text-text-secondary hover:text-text-primary">
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <p className="px-4 pb-2">{post.content}</p>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="bg-black">
          {post.mediaType === 'video' ? (
             <div className="relative aspect-video">
                 <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <button className="w-16 h-16 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    </button>
                 </div>
             </div>
          ) : (
            <img src={post.mediaUrl} alt="Post media" className="w-full max-h-[500px] object-cover" />
          )}
        </div>
      )}

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
