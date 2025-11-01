import React from 'react';
import type { Message, User } from '../../types';
import AudioPlayer from './AudioPlayer';

interface MessageBubbleProps {
    message: Message;
    currentUser: User;
    sender: User;
    showAvatar: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser, sender, showAvatar }) => {
    const isSentByCurrentUser = message.senderId === currentUser.id;

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!sender) return null;

    return (
        <div className={`flex items-end gap-2 ${isSentByCurrentUser ? 'justify-end' : ''}`}>
            {!isSentByCurrentUser && (
                <div className="w-8 flex-shrink-0">
                    {showAvatar && <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full" />}
                </div>
            )}
            <div 
                className={`max-w-[70%] rounded-2xl px-3 py-2 ${isSentByCurrentUser ? 'bg-accent text-white rounded-br-md' : 'bg-gray-200 dark:bg-gray-700 text-primary dark:text-gray-100 rounded-bl-md'}`}
            >
                {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                {message.mediaUrl && message.mediaType === 'image' && (
                    <img src={message.mediaUrl} alt="sent media" className="rounded-lg max-w-xs max-h-64 my-1" />
                )}
                {message.mediaUrl && message.mediaType === 'audio' && (
                    <AudioPlayer src={message.mediaUrl} />
                )}
                <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-blue-100' : 'text-secondary dark:text-gray-400'} ${isSentByCurrentUser ? 'text-right': ''}`}>
                    {time}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
