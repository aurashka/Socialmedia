import React, { useState, useEffect, useRef } from 'react';
import type { User, Conversation, Message } from '../../types';
import { onValue, ref, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../../services/firebase';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { ChevronLeftIcon } from '../Icons';

interface ChatWindowProps {
    currentUser: User;
    conversation: Conversation;
    users: Record<string, User>;
    isOnline: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, conversation, users, isOnline }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const otherParticipantId = Object.keys(conversation.participants).find(id => id !== currentUser.id);
    const otherUser = otherParticipantId ? users[otherParticipantId] : null;

    useEffect(() => {
        const messagesRef = ref(db, `messages/${conversation.id}`);
        const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

        const unsubscribe = onValue(messagesQuery, (snapshot) => {
            if (snapshot.exists()) {
                const messagesData = snapshot.val();
                const messagesArray = Object.values(messagesData) as Message[];
                setMessages(messagesArray.sort((a, b) => a.timestamp - b.timestamp));
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [conversation.id]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!otherUser) {
        return <div className="flex-1 flex items-center justify-center text-secondary dark:text-gray-400">User not found</div>;
    }

    return (
        <div className="flex flex-col h-full w-full bg-surface dark:bg-[#121212]">
            {/* Header */}
            <div className="flex items-center p-3 border-b border-divider dark:border-gray-700 flex-shrink-0">
                <a href="#/messages" className="md:hidden p-2 -ml-2 mr-2">
                    <ChevronLeftIcon className="w-6 h-6"/>
                </a>
                <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <p className="font-bold text-primary dark:text-gray-100">{otherUser.name}</p>
                    <p className="text-xs text-secondary dark:text-gray-400">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                    return (
                        <MessageBubble key={msg.id} message={msg} currentUser={currentUser} sender={users[msg.senderId]} showAvatar={showAvatar} />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-divider dark:border-gray-700 flex-shrink-0">
                <MessageInput currentUser={currentUser} conversation={conversation} />
            </div>
        </div>
    );
};

export default ChatWindow;