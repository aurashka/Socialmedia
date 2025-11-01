import React, { useEffect } from 'react';
import type { User, Notification, Post } from '../../types';
import { markNotificationsAsRead } from '../../services/firebase';
import NotificationItem from './NotificationItem';
import { BellIcon } from '../Icons';

interface NotificationsPageProps {
    currentUser: User;
    notifications: Notification[];
    users: Record<string, User>;
    posts: Post[];
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentUser, notifications, users, posts }) => {
    useEffect(() => {
        // Mark all unread notifications as read when the page is viewed
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            markNotificationsAsRead(currentUser.id, unreadIds);
        }
    }, [notifications, currentUser.id]);

    return (
        <div className="max-w-2xl mx-auto py-4 sm:py-6 px-2 sm:px-4">
            <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-4">Notifications</h1>
            <div className="bg-surface dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-divider dark:border-gray-700">
                <div className="divide-y divide-divider dark:divide-gray-700">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <NotificationItem 
                                key={notification.id}
                                notification={notification}
                                users={users}
                                posts={posts}
                                onClose={() => {}} // onClose is not needed here but prop is on component
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center text-secondary dark:text-gray-400 flex flex-col items-center justify-center">
                            <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <h4 className="font-bold text-primary dark:text-gray-200">No Notifications Yet</h4>
                            <p className="text-sm mt-1">When you get notifications, they'll show up here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
