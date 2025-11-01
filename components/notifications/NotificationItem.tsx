import React from 'react';
import type { Notification, User, Post } from '../../types';

interface NotificationItemProps {
    notification: Notification;
    users: Record<string, User>;
    posts: Post[];
    onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, users, posts, onClose }) => {
    const sender = users[notification.senderId];
    const post = notification.postId ? posts.find(p => p.id === notification.postId) : null;

    if (!sender) return null; // Don't render if sender doesn't exist

    const timeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${Math.max(1, seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w`;
    };

    const getNotificationText = () => {
        switch (notification.type) {
            case 'like':
                return <>liked your post.</>;
            case 'comment':
                return <>commented on your post.</>;
            case 'mention':
                return <>mentioned you in a post.</>;
            case 'friend_request':
                return <>sent you a friend request.</>;
            case 'friend_accept':
                return <>accepted your friend request.</>;
            default:
                return <>interacted with you.</>;
        }
    };

    const getLink = () => {
        switch (notification.type) {
            case 'like':
            case 'comment':
            case 'mention':
                return `#/profile/${post?.userId}`; // Simplified for now, could link directly to post modal
            case 'friend_request':
                 return `#/friends`;
            case 'friend_accept':
                return `#/profile/${sender.id}`;
            default:
                return '#';
        }
    };
    
    const handleNavigate = () => {
        window.location.hash = getLink();
        onClose();
    }

    return (
        <a 
            href={getLink()} 
            onClick={handleNavigate}
            className={`flex items-center p-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        >
            <img src={sender.avatarUrl} alt={sender.name} className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
            <div className="flex-grow">
                <p className="text-primary dark:text-gray-100">
                    <span className="font-bold">{sender.name}</span> {getNotificationText()}
                </p>
                <p className="text-xs text-secondary dark:text-gray-400">{timeAgo(notification.timestamp)}</p>
            </div>
            {post?.media?.[0] && (
                <img src={post.media[0].url} alt="post media" className="w-10 h-10 object-cover rounded-md ml-2 flex-shrink-0" />
            )}
             {!notification.read && (
                <div className="w-2 h-2 bg-accent rounded-full ml-3 flex-shrink-0"></div>
             )}
        </a>
    );
};

export default NotificationItem;