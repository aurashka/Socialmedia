import React from 'react';
import type { Message, User } from '../../types';
import { deleteMessage, toggleMessageReaction } from '../../services/firebase';
import { TrashIcon } from '../Icons';

interface MessageActionSheetProps {
    message: Message;
    currentUser: User;
    onClose: () => void;
    onReply: (message: Message) => void;
}

const reactions = ['👍', '❤️', '😂', '😯', '😢', '😡'];

const MessageActionSheet: React.FC<MessageActionSheetProps> = ({ message, currentUser, onClose, onReply }) => {
    
    const isOwner = message.senderId === currentUser.id;
    
    const handleReaction = async (reaction: string) => {
        await toggleMessageReaction(message.conversationId, message.id, currentUser.id, reaction);
        onClose();
    };
    
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this message? This cannot be undone.')) {
            await deleteMessage(message.conversationId, message.id);
            onClose();
        }
    };
    
    const handleCopy = () => {
        if(message.text) {
            navigator.clipboard.writeText(message.text);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
            <div className="bg-surface dark:bg-[#1E1E1E] rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-divider dark:border-gray-700 flex justify-around">
                    {reactions.map(emoji => (
                        <button key={emoji} onClick={() => handleReaction(emoji)} className="text-3xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform transform hover:scale-125">
                            {emoji}
                        </button>
                    ))}
                </div>
                <div className="py-2">
                    <button onClick={() => onReply(message)} className="w-full text-left px-4 py-3 text-primary dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">
                        Reply
                    </button>
                    {message.text && (
                         <button onClick={handleCopy} className="w-full text-left px-4 py-3 text-primary dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">
                            Copy
                        </button>
                    )}
                    {isOwner && (
                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-red-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <TrashIcon className="w-5 h-5"/>
                            <span>Delete</span>
                        </button>
                    )}
                </div>
                 <div className="p-2">
                    <button onClick={onClose} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold">
                        Cancel
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default MessageActionSheet;