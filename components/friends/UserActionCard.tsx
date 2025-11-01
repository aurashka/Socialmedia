import React, { useState } from 'react';
import type { User } from '../../types';
import { handleFriendRequest, sendFriendRequest } from '../../services/firebase';

interface UserActionCardProps {
    cardUser: User;
    currentUser: User;
    type: 'request' | 'suggestion';
    onAction?: () => void;
    actionText?: string;
    isVertical?: boolean;
}

const UserActionCard: React.FC<UserActionCardProps> = ({ cardUser, currentUser, type, onAction, actionText, isVertical = false }) => {
    const [loading, setLoading] = useState(false);

    if (!cardUser) return null;

    const handleAccept = async () => {
        setLoading(true);
        await handleFriendRequest(currentUser.id, cardUser.id, true);
        setLoading(false);
        if(onAction) onAction();
    };

    const handleDecline = async () => {
        setLoading(true);
        await handleFriendRequest(currentUser.id, cardUser.id, false);
        setLoading(false);
        if(onAction) onAction();
    };
    
    const handleAddFriend = async () => {
        setLoading(true);
        await sendFriendRequest(currentUser.id, cardUser.id);
        if(onAction) onAction();
        setLoading(false);
    }
    
    if (isVertical) {
        return (
            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-divider">
                <a href={`#/profile/${cardUser.id}`} onClick={(e) => e.stopPropagation()}>
                    <img src={cardUser.avatarUrl} alt={cardUser.name} className="w-full h-40 object-cover"/>
                </a>
                <div className="p-3">
                    <a href={`#/profile/${cardUser.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-text-primary hover:underline truncate block">{cardUser.name}</a>
                    <div className="mt-3 flex flex-col gap-2">
                        <button onClick={handleAddFriend} disabled={loading || actionText === 'Request Sent'} className="w-full px-3 py-2 text-sm bg-primary text-white font-semibold rounded-md hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 whitespace-nowrap">
                            {loading ? '...' : actionText}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Horizontal card for requests/search results
    return (
        <div className="bg-surface rounded-lg p-3 flex items-center justify-between transition-shadow hover:bg-gray-50 w-full">
            <a href={`#/profile/${cardUser.id}`} className="flex items-center space-x-3 flex-grow min-w-0">
                <img src={cardUser.avatarUrl} alt={cardUser.name} className="w-12 h-12 rounded-full object-cover"/>
                <div>
                    <p className="font-bold text-primary hover:underline truncate">{cardUser.name}</p>
                    <p className="text-sm text-secondary truncate">@{cardUser.handle}</p>
                </div>
            </a>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 ml-2">
                {type === 'request' && (
                    <>
                        <button onClick={handleAccept} disabled={loading} className="px-4 py-1.5 text-sm bg-primary text-white font-semibold rounded-md hover:bg-black disabled:bg-opacity-50 whitespace-nowrap">Confirm</button>
                        <button onClick={handleDecline} disabled={loading} className="px-4 py-1.5 text-sm bg-gray-200 text-primary font-semibold rounded-md hover:bg-gray-300 disabled:opacity-50 whitespace-nowrap">Delete</button>
                    </>
                )}
                 {type === 'suggestion' && (
                     <button onClick={handleAddFriend} disabled={loading || actionText === 'Request Sent'} className="px-4 py-1.5 text-sm bg-blue-100 text-primary font-semibold rounded-md hover:bg-blue-200 disabled:bg-gray-200 disabled:text-secondary whitespace-nowrap">
                        {loading ? '...' : actionText}
                    </button>
                 )}
            </div>
        </div>
    );
};

export default UserActionCard;