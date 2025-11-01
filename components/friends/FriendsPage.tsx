import React, { useMemo, useState } from 'react';
import type { User } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import UserActionCard from './UserActionCard';
import FriendList from './FriendList';

interface FriendsPageProps {
    currentUser: User;
    users: Record<string, User>;
    friendRequests: Record<string, any>;
    onlineStatuses: Record<string, any>;
}

type Tab = 'friends' | 'requests' | 'suggestions';

const FriendsPage: React.FC<FriendsPageProps> = ({ currentUser, users, friendRequests, onlineStatuses }) => {
    const [activeTab, setActiveTab] = useState<Tab>('friends');
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
    
    const renderContent = () => {
        switch(activeTab) {
            case 'friends':
                return <FriendList currentUser={currentUser} users={users} onlineStatuses={onlineStatuses} />;
            case 'requests':
                return (
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
                );
            case 'suggestions':
                 return (
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
                 );
        }
    }

    return (
        <div className="p-2 sm:p-4 pb-4 space-y-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-primary dark:text-gray-100">Friends</h1>
            <div className="border-b border-divider dark:border-gray-700 flex space-x-2">
                <TabButton label="Your Friends" active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} />
                <TabButton label="Requests" count={requestSenderIds.length} active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
                <TabButton label="Suggestions" active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} />
            </div>
            <div className="pt-2">
                {renderContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, count?: number, active: boolean, onClick: () => void}> = ({ label, count, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-semibold text-sm rounded-t-lg border-b-2 flex items-center gap-2 ${active ? 'border-accent text-accent' : 'border-transparent text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
        <span>{label}</span>
        {count > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
    </button>
)

export default FriendsPage;