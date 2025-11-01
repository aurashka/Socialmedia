import React from 'react';
import type { User, Conversation } from '../../types';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { MessageIcon } from '../Icons';

interface MessagesPageProps {
    currentUser: User;
    users: Record<string, User>;
    onlineStatuses: Record<string, any>;
    conversations: Conversation[];
    activeConversationId?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ currentUser, users, onlineStatuses, conversations, activeConversationId }) => {
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <div className="flex h-full">
            {/* Desktop: Always show conversation list */}
            <div className="hidden md:block w-80 lg:w-96 flex-shrink-0 h-full">
                <ConversationList
                    currentUser={currentUser}
                    conversations={conversations}
                    users={users}
                    onlineStatuses={onlineStatuses}
                    activeConversationId={activeConversationId}
                />
            </div>
            
            <div className="flex-1 h-full">
                 {/* Mobile: Show list only if no active chat */}
                {!activeConversationId && (
                    <div className="md:hidden h-full">
                         <ConversationList
                            currentUser={currentUser}
                            conversations={conversations}
                            users={users}
                            onlineStatuses={onlineStatuses}
                        />
                    </div>
                )}
                
                {activeConversation ? (
                    <ChatWindow
                        currentUser={currentUser}
                        conversation={activeConversation}
                        users={users}
                        isOnline={onlineStatuses[Object.keys(activeConversation.participants).find(id => id !== currentUser.id)!]?.state === 'online'}
                    />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-secondary dark:text-gray-400 bg-surface dark:bg-[#303030]">
                       <MessageIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1} />
                       <h2 className="text-2xl font-semibold text-primary dark:text-gray-100">Your Messages</h2>
                       <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
