import React, { useMemo, useState } from 'react';
import type { User } from '../../types';
import { handleFriendRequest, sendFriendRequest } from '../../services/firebase';
import LoadingSpinner from '../LoadingSpinner';

interface FriendsPageProps {
    currentUser: User;
    users: Record<string, User>;
    friendRequests: Record<string, any>;
}

const UserActionCard: React.FC<{
    cardUser: User;
    currentUser: User;
    type: 'request' | 'suggestion';
    onAction: () => void;
    actionText?: string;
    isVertical?: boolean;
}> = ({ cardUser, currentUser, type, onAction, actionText, isVertical = false }) => {
    const [loading, setLoading] = useState(false);

    if (!cardUser) return null;

    const handleAccept = async () => {
        setLoading(true);
        await handleFriendRequest(currentUser.id, cardUser.id, true);
        setLoading(false);
    };

    const handleDecline = async () => {
        setLoading(true);
        await handleFriendRequest(currentUser.id, cardUser.id, false);
        setLoading(false);
    };
    
    const handleAddFriend = async () => {
        setLoading(true);
        await sendFriendRequest(currentUser.id, cardUser.id);
        onAction();
        setLoading(false);
    }
    
    if (isVertical) {
        return (
            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-divider">
                <a href={`#/profile/${cardUser.id}`}>
                    <img src={cardUser.avatarUrl} alt={cardUser.name} className="w-full h-40 object-cover"/>
                </a>
                <div className="p-3">
                    <a href={`#/profile/${cardUser.id}`} className="font-bold text-text-primary hover:underline truncate block">{cardUser.name}</a>
                    <div className="mt-3 flex flex-col gap-2">
                        <button onClick={handleAddFriend} disabled={loading || actionText === 'Request Sent'} className="w-full px-3 py-2 text-sm bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:text-white/80 whitespace-nowrap">
                            {loading ? '...' : actionText}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-lg p-3 flex items-center justify-between transition-shadow hover:shadow-md border border-divider">
            <a href={`#/profile/${cardUser.id}`} className="flex items-center space-x-4">
                <img src={cardUser.avatarUrl} alt={cardUser.name} className="w-14 h-14 rounded-lg object-cover"/>
                <div>
                    <p className="font-bold text-text-primary hover:underline">{cardUser.name}</p>
                </div>
            </a>
            <div className="flex flex-col sm:flex-row gap-2">
                {type === 'request' && (
                    <>
                        <button onClick={handleAccept} disabled={loading} className="px-4 py-2 text-sm bg-primary text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 whitespace-nowrap">Confirm</button>
                        <button onClick={handleDecline} disabled={loading} className="px-4 py-2 text-sm bg-gray-200 text-text-primary font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100 whitespace-nowrap">Delete</button>
                    </>
                )}
            </div>
        </div>
    );
};


const FriendsPage: React.FC<FriendsPageProps> = ({ currentUser, users, friendRequests }) => {
    
    const requestSenderIds = useMemo(() => Object.keys(friendRequests), [friendRequests]);
    const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

    const suggestedUsers = useMemo(() => {
        if (!users || !currentUser) return [];
        const currentUserFriendIds = currentUser.friends ? Object.keys(currentUser.friends) : [];
        const friendRequestSenderIds = Object.keys(friendRequests);
        // FIX: Cast Object.values(users) to User[] to resolve TypeScript errors.
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
                <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>
                <div className="space-y-3">
                    {requestSenderIds.length > 0 ? (
                        requestSenderIds.map(senderId => (
                            <UserActionCard key={senderId} cardUser={users[senderId]} currentUser={currentUser} type="request" onAction={() => {}} />
                        ))
                    ) : (
                        <div className="bg-card rounded-lg p-6 text-center text-text-secondary border border-divider">
                            <p>You have no new friend requests.</p>
                        </div>
                    )}
                </div>
            </div>

             <div>
                <h1 className="text-2xl font-bold mb-4">People You May Know</h1>
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