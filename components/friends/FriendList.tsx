import React, { useMemo } from 'react';
import type { User } from '../../types';
import { getOrCreateConversation } from '../../services/firebase';

interface FriendListProps {
    currentUser: User;
    users: Record<string, User>;
    onlineStatuses: Record<string, any>;
}

const FriendList: React.FC<FriendListProps> = ({ currentUser, users, onlineStatuses }) => {
    
    const friendIds = useMemo(() => {
        return currentUser.friends ? Object.keys(currentUser.friends) : [];
    }, [currentUser.friends]);
    
    const friends = useMemo(() => {
        return friendIds.map(id => users[id]).filter(Boolean);
    }, [friendIds, users]);
    
    const handleMessage = async (friendId: string) => {
        try {
            const conversationId = await getOrCreateConversation(currentUser.id, friendId);
            window.location.hash = `#/messages/${conversationId}`;
        } catch (error) {
            console.error("Failed to start conversation:", error);
            alert("Could not start conversation.");
        }
    };

    if (friends.length === 0) {
        return (
            <div className="bg-surface dark:bg-gray-900 rounded-lg p-6 text-center text-secondary dark:text-gray-400 border border-divider dark:border-gray-800">
                <p>You haven't added any friends yet. Find people to connect with!</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {friends.map(friend => {
                const isOnline = onlineStatuses[friend.id]?.state === 'online';
                return (
                    <div key={friend.id} className="bg-surface dark:bg-gray-800 rounded-lg shadow-sm border border-divider dark:border-gray-700 p-4 flex items-center justify-between">
                        <a href={`#/profile/${friend.id}`} className="flex items-center space-x-3">
                            <div className="relative">
                                <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full"/>
                                {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface dark:border-gray-800"></div>}
                            </div>
                            <div>
                                <p className="font-bold text-primary dark:text-gray-100 hover:underline">{friend.name}</p>
                                <p className="text-sm text-secondary dark:text-gray-400">@{friend.handle}</p>
                            </div>
                        </a>
                        <button onClick={() => handleMessage(friend.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default FriendList;