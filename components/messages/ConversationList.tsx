import React from 'react';
import type { User, Conversation } from '../../types';
import { VideoCameraIcon } from '../Icons';

interface ConversationListProps {
    currentUser: User;
    conversations: Conversation[];
    users: Record<string, User>;
    onlineStatuses: Record<string, any>;
    activeConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ currentUser, conversations, users, onlineStatuses, activeConversationId }) => {
    
    const timeSince = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `Just now`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w`;
    };

    return (
        <div className="h-full w-full border-r border-divider dark:border-gray-700 bg-surface dark:bg-[#424242] flex flex-col">
             <div className="p-4 border-b border-divider dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-primary dark:text-gray-100">Chats</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                {conversations.map(convo => {
                    const otherParticipantId = Object.keys(convo.participants).find(id => id !== currentUser.id);
                    if (!otherParticipantId) return null;

                    const otherUser = users[otherParticipantId];
                    if (!otherUser) return null;

                    const isActive = convo.id === activeConversationId;
                    const isOnline = onlineStatuses[otherUser.id]?.state === 'online';
                    const lastMessageText = convo.lastMessage.mediaType === 'image' 
                        ? 'Sent an image' 
                        : convo.lastMessage.mediaType === 'audio'
                        ? 'Sent a voice message'
                        : convo.lastMessage.text;

                    return (
                        <a 
                            key={convo.id} 
                            href={`#/messages/${convo.id}`}
                            className={`flex items-center p-3 text-left w-full transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <div className="relative mr-3 flex-shrink-0">
                                <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full" />
                                {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface dark:border-[#424242]"></div>
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-primary dark:text-gray-100 truncate">{otherUser.name}</p>
                                <p className="text-sm text-secondary dark:text-gray-400 truncate">
                                    {convo.lastMessage.senderId === currentUser.id && 'You: '}
                                    {lastMessageText}
                                </p>
                            </div>
                             <div className="text-xs text-secondary dark:text-gray-500 ml-2 flex-shrink-0">
                                {timeSince(convo.lastMessage.timestamp)}
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;
