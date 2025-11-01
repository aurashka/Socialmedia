import React, { useMemo, useState } from 'react';
import type { User } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import UserActionCard from './UserActionCard';

interface FriendsPageProps {
    currentUser: User;
    users: Record<string, User>;
    friendRequests: Record<string, any>;
}

const FriendsPage: React.FC<FriendsPageProps> = ({ currentUser, users, friendRequests }) => {
    
    const requestSenderIds = useMemo(() => Object.keys(friendRequests), [friendRequests]);
    const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

    const suggestedUsers = useMemo(() => {
        if (!users || !currentUser) return [];
        const currentUserFriendIds = currentUser.friends ? Object.keys(currentUser.friends) : [];
        const friendRequestSenderIds = Object.keys(friendRequests);
        return (Object.values(users) as User[])
            .filter(user => 
                user && user.id !== currentUser.id &&
                !currentUserFriendIds.includes(user.id) &&
                !friendRequestSenderIds.includes(user.id) &&
                user.isPublic
            )
            .sort(() => 0.5 - Math.random());
    }, [currentUser, users, friendRequests]);

    const handleSuggestionAction = (userId: string) => {
        setSentRequests(prev => ({ ...prev, [userId]: true }));
    }

    if (!users) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-2 sm:p-4 pb-4 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold mb-4 text-primary dark:text-gray-100">Friend Requests</h1>
                <div className="space-y-3">
                    {requestSenderIds.length > 0 ? (
                        requestSenderIds.map(senderId => (
                            <UserActionCard 
                                key={senderId} 
                                cardUser={users[senderId]} 
                                currentUser={currentUser} 
                                type="request" 
                                isVertical={false} 
                            />
                        ))
                    ) : (
                        <div className="bg-surface dark:bg-gray-900 rounded-lg p-6 text-center text-secondary dark:text-gray-400 border border-divider dark:border-gray-800">
                            <p>You have no new friend requests.</p>
                        </div>
                    )}
                </div>
            </div>

             <div>
                <h1 className="text-2xl font-bold mb-4 text-primary dark:text-gray-100">People You May Know</h1>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {suggestedUsers.slice(0, 15).map(user => (
                        <UserActionCard 
                            key={user.id} 
                            cardUser={user} 
                            currentUser={currentUser} 
                            type="suggestion" 
                            isVertical={true}
                            onAction={() => handleSuggestionAction(user.id)}
                            actionText={sentRequests[user.id] ? "Request Sent" : "Add Friend"}
                        />
                    ))}
                </div>
             </div>
        </div>
    );
};

export default FriendsPage;
