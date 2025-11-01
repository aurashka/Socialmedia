import React, { useMemo } from 'react';
import type { Message, User } from '../../types';
import AudioPlayer from './AudioPlayer';
import { LockClosedIcon } from '../Icons';

interface MessageBubbleProps {
    message: Message;
    currentUser: User;
    sender: User;
    showAvatar: boolean;
    onClick: () => void;
    repliedToMessage?: Message;
    repliedToUser?: User;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUser, sender, showAvatar, onClick, repliedToMessage, repliedToUser }) => {
    const isSentByCurrentUser = message.senderId === currentUser.id;

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!sender) return null;

    const reactions = useMemo(() => {
        if (!message.reactions) return [];
        return Object.entries(message.reactions).map(([reaction, users]) => ({
            emoji: reaction,
            count: Object.keys(users).length,
            isReactedByCurrentUser: !!users[currentUser.id]
        })).filter(r => r.count > 0);
    }, [message.reactions, currentUser.id]);

    const renderRepliedMessage = () => {
        if (!repliedToMessage || !repliedToUser) return null;
        
        let content: React.ReactNode = repliedToMessage.text;
        if(repliedToMessage.isDeleted) content = 'This message was deleted.';
        else if (repliedToMessage.mediaType === 'image') content = 'Photo';
        else if (repliedToMessage.mediaType === 'video') content = 'Video';
        else if (repliedToMessage.mediaType === 'audio') content = 'Voice message';

        return (
            <div className={`p-2 rounded-lg mb-1 text-sm ${isSentByCurrentUser ? 'bg-blue-400/50' : 'bg-gray-300/60 dark:bg-gray-600/60'}`}>
                <p className="font-bold text-xs">{repliedToUser.id === currentUser.id ? 'You' : repliedToUser.name}</p>
                <p className="opacity-80 truncate">{content}</p>
            </div>
        )
    }

    return (
        <div className={`flex items-end gap-2 ${isSentByCurrentUser ? 'justify-end' : ''}`}>
            {!isSentByCurrentUser && (
                <div className="w-8 flex-shrink-0">
                    {showAvatar && <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full" />}
                </div>
            )}
            <div className="max-w-[70%]">
                <div 
                    className={`relative rounded-2xl px-3 py-2 cursor-pointer transition-transform active:scale-95 ${isSentByCurrentUser ? 'bg-accent text-white rounded-br-md' : 'bg-gray-200 dark:bg-gray-700 text-primary dark:text-gray-100 rounded-bl-md'}`}
                    onClick={onClick}
                >
                    {renderRepliedMessage()}

                    {message.isDeleted ? (
                        <div className="flex items-center gap-2 italic text-sm opacity-70">
                            <LockClosedIcon className="w-4 h-4"/>
                            <span>This message was deleted.</span>
                        </div>
                    ) : (
                        <>
                            {message.postLink && (
                                <a href={`#/post/${message.postLink.postId}`} className="block my-1">
                                    <div className={`p-2 rounded-lg ${isSentByCurrentUser ? 'bg-blue-400/50' : 'bg-gray-300/60 dark:bg-gray-600/60'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={message.postLink.authorAvatar} alt={message.postLink.authorName} className="w-6 h-6 rounded-full" />
                                            <span className="font-semibold text-xs">{message.postLink.authorName}</span>
                                        </div>
                                        {message.postLink.imageUrl && (
                                            <img src={message.postLink.imageUrl} alt="Post preview" className="rounded-md max-h-40 w-full object-cover my-1" />
                                        )}
                                        <p className="text-xs opacity-80 mt-1 italic">
                                            "{message.postLink.textSnippet}"
                                        </p>
                                    </div>
                                </a>
                            )}
                            {message.text && <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>}
                            {message.mediaUrl && message.mediaType === 'image' && (
                                <img src={message.mediaUrl} alt="sent media" className="rounded-lg max-w-xs max-h-64 my-1" />
                            )}
                            {message.mediaUrl && message.mediaType === 'video' && (
                                <video src={message.mediaUrl} controls className="rounded-lg max-w-xs max-h-64 my-1" />
                            )}
                            {message.mediaUrl && message.mediaType === 'audio' && (
                                <div className="my-1">
                                    <AudioPlayer src={message.mediaUrl} />
                                </div>
                            )}
                        </>
                    )}
                    <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-blue-100/80' : 'text-secondary dark:text-gray-400'} ${isSentByCurrentUser ? 'text-right': ''}`}>
                        {time}
                    </p>
                </div>
                {reactions.length > 0 && !message.isDeleted && (
                    <div className={`flex gap-1 mt-1 px-2 ${isSentByCurrentUser ? 'justify-end' : ''}`}>
                        {reactions.map(r => (
                            <div key={r.emoji} className={`px-1.5 py-0.5 rounded-full text-xs ${r.isReactedByCurrentUser ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                {r.emoji} {r.count > 1 ? r.count : ''}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;