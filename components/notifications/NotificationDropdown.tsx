import React, { useEffect } from 'react';
import type { User, Notification, Post } from '../../types';
import { markNotificationsAsRead } from '../../services/firebase';
import NotificationItem from './NotificationItem';
import { HeartIcon } from '../Icons';

interface NotificationDropdownProps {
    currentUser: User;
    notifications: Notification[];
    users: Record<string, User>;
    posts: Post[];
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ currentUser, notifications, users, posts, onClose }) => {

    useEffect(() => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            markNotificationsAsRead(currentUser.id, unreadIds);
        }
    }, [notifications, currentUser.id]);

    return (
        <div className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-surface dark:bg-[#424242] rounded-lg shadow-lg z-50 border border-divider dark:border-gray-700 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-divider dark:border-gray-700">
                <h3 className="font-bold text-xl text-primary dark:text-gray-100">Notifications</h3>
            </div>
            <div className="flex-grow overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem 
                            key={notification.id}
                            notification={notification}
                            users={users}
                            posts={posts}
                            onClose={onClose}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-secondary dark:text-gray-400 flex flex-col items-center justify-center h-full">
                        <HeartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1}/>
                        <h4 className="font-bold text-primary dark:text-gray-200">Activity On Your Posts</h4>
                        <p className="text-sm mt-1">When someone likes or comments on one of your posts, you'll see it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;