import React, { useState, useMemo } from 'react';
import type { Post, User } from '../../types';
import { XIcon, SearchIcon, ShareIcon as ExternalShareIcon } from '../Icons';
import { getOrCreateConversation, sendMessage } from '../../services/firebase';

interface ShareModalProps {
    post: Post;
    postUser: User;
    currentUser: User;
    users: Record<string, User>;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, postUser, currentUser, users, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sentTo, setSentTo] = useState<Record<string, boolean>>({});

    const friends = useMemo(() => {
        const friendIds = Object.keys(currentUser.friends || {});
        return friendIds.map(id => users[id]).filter(Boolean);
    }, [currentUser.friends, users]);

    const filteredFriends = useMemo(() => {
        if (!searchQuery) return friends;
        const lowerQuery = searchQuery.toLowerCase();
        return friends.filter(friend => friend.name?.toLowerCase().includes(lowerQuery));
    }, [searchQuery, friends]);

    const handleExternalShare = async () => {
        const postUrl = `${window.location.origin}${window.location.pathname}#/post/${post.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by ${postUser?.name}`,
                    text: post.content,
                    url: postUrl,
                });
            } catch (error) {
                console.error('Error sharing post:', error);
            }
        } else {
            navigator.clipboard.writeText(postUrl).then(() => {
                alert('Post link copied to clipboard!');
            }, () => {
                alert('Could not copy link.');
            });
        }
        onClose();
    };

    const handleSendInternal = async (friend: User) => {
        if (!postUser || sentTo[friend.id]) return;
        
        setSentTo(prev => ({ ...prev, [friend.id]: true }));

        try {
            const conversationId = await getOrCreateConversation(currentUser.id, friend.id);
            const postLinkPayload = {
                postId: post.id,
                textSnippet: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
                imageUrl: post.media?.[0]?.type === 'image' ? post.media[0].url : undefined,
                authorName: postUser.name || '',
                authorAvatar: postUser.avatarUrl,
            };

            await sendMessage(conversationId, currentUser.id, {
                text: `Shared a post by ${postUser.name}`,
                postLink: postLinkPayload,
            });
        } catch (error) {
            console.error("Failed to send post:", error);
            alert(`Could not send post to ${friend.name}.`);
            setSentTo(prev => ({ ...prev, [friend.id]: false }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
            <div 
                className="bg-surface dark:bg-[#1E1E1E] rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-md flex flex-col h-[70vh] text-primary dark:text-gray-100" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-divider dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Share Post</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon className="w-6 h-6 text-secondary dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="p-4 flex-shrink-0">
                    <button onClick={handleExternalShare} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <ExternalShareIcon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">Share to other apps</span>
                    </button>
                    <div className="relative mt-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-secondary dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto px-4">
                    <p className="font-bold mb-2">Send to a friend</p>
                    <ul className="space-y-2">
                        {filteredFriends.map(friend => (
                            <li key={friend.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full" />
                                    <span className="font-semibold">{friend.name}</span>
                                </div>
                                <button
                                    onClick={() => handleSendInternal(friend)}
                                    disabled={!!sentTo[friend.id]}
                                    className="px-4 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:opacity-70 bg-accent text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                                >
                                    {sentTo[friend.id] ? 'Sent' : 'Send'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;