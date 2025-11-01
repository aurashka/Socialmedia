import React, { useMemo } from 'react';
import type { User, Conversation } from '../../types';
import { getOrCreateConversation } from '../../services/firebase';

interface ConversationListProps {
    currentUser: User;
    conversations: Conversation[];
    users: Record<string, User>;
    onlineStatuses: Record<string, any>;
    activeConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ currentUser, conversations, users, onlineStatuses, activeConversationId }) => {
    
    const handleStartChat = async (friendId: string) => {
        try {
            const conversationId = await getOrCreateConversation(currentUser.id, friendId);
            window.location.hash = `#/messages/${conversationId}`;
        } catch (error) {
            console.error("Failed to start or get conversation:", error);
            alert("Could not start chat. Please try again.");
        }
    };
    
    const combinedList = useMemo(() => {
        const friendIds = Object.keys(currentUser.friends || {});
        
        const convoMap = conversations.reduce((acc, convo) => {
            const otherId = Object.keys(convo.participants).find(id => id !== currentUser.id);
            if(otherId) {
                acc[otherId] = convo;
            }
            return acc;
        }, {} as Record<string, Conversation>);

        const list = friendIds.map(friendId => {
            const user = users[friendId];
            if (!user) return null;
            const conversation = convoMap[friendId];
            return {
                user,
                conversation,
                lastActivity: conversation ? conversation.lastMessage.timestamp : 0,
            }
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        list.sort((a, b) => b.lastActivity - a.lastActivity);

        return list;
    }, [currentUser.friends, conversations, users]);

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
        <div className="h-full w-full border-r border-divider dark:border-gray-700 bg-surface dark:bg-[#1E1E1E] flex flex-col">
             <div className="p-4 border-b border-divider dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-primary dark:text-gray-100">Chats</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                {combinedList.map(({ user, conversation }) => {
                    const otherUser = user;
                    const convo = conversation;

                    const isActive = convo?.id === activeConversationId;
                    const isOnline = onlineStatuses[otherUser.id]?.state === 'online';
                    
                    const lastMessageText = convo 
                        ? (convo.lastMessage.mediaType === 'image' 
                            ? 'Sent an image' 
                            : convo.lastMessage.mediaType === 'audio'
                            ? 'Sent a voice message'
                            : convo.lastMessage.text)
                        : `Start a conversation`;

                    const lastMessageSender = convo ? (convo.lastMessage.senderId === currentUser.id ? 'You: ' : '') : '';

                    const href = convo ? `#/messages/${convo.id}` : '#';
                    const onClick = convo ? undefined : (e: React.MouseEvent) => {
                        e.preventDefault();
                        handleStartChat(otherUser.id);
                    };

                    return (
                        <a 
                            key={otherUser.id} 
                            href={href}
                            onClick={onClick}
                            className={`flex items-center p-3 text-left w-full transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <div className="relative mr-3 flex-shrink-0">
                                <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full" />
                                {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface dark:border-[#1E1E1E]"></div>
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold text-primary dark:text-gray-100 truncate">{otherUser.name}</p>
                                <p className="text-sm text-secondary dark:text-gray-400 truncate">
                                    {lastMessageSender}
                                    {lastMessageText}
                                </p>
                            </div>
                            {convo && (
                                <div className="text-xs text-secondary dark:text-gray-500 ml-2 flex-shrink-0">
                                    {timeSince(convo.lastMessage.timestamp)}
                                </div>
                            )}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;