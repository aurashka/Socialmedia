import React, { useMemo, useState } from 'react';
import type { User, Post, Community, Channel } from '../../types';
import PostViewerModal from './PostViewerModal';
import { SearchIcon } from '../Icons';
import UserActionCard from '../friends/UserActionCard';
import SearchOverlay from '../search/SearchOverlay';

interface ExplorePageProps {
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
    friendRequests: Record<string, any>;
    communities: Record<string, Community>;
    channels: Record<string, Channel>;
    onOpenCommentSheet: (postId: string) => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, users, posts, friendRequests, communities, channels, onOpenCommentSheet }) => {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

    const explorePosts = useMemo(() => {
        return posts
            .filter(post => {
                const privacy = post.privacy || 'public';
                // Show public posts from other users that have media
                return privacy === 'public' && post.userId !== currentUser.id && post.media && post.media.length > 0;
            })
            // Sort randomly to give a sense of discovery
            .sort(() => 0.5 - Math.random());
    }, [posts, currentUser.id]);

    const suggestedUsers = useMemo(() => {
        if (!users || !currentUser) return [];
        const currentUserFriendIds = currentUser.friends ? Object.keys(currentUser.friends) : [];
        const friendRequestSenderIds = Object.keys(friendRequests);
        return (Object.values(users) as User[])
            .filter(user => 
                user && user.id !== currentUser.id &&
                !currentUserFriendIds.includes(user.id) &&
                !friendRequestSenderIds.includes(user.id) &&
                user.isPublic
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
    }, [currentUser, users, friendRequests]);

    const handleSuggestionAction = (userId: string) => {
        setSentRequests(prev => ({ ...prev, [userId]: true }));
    };


    return (
        <div className="bg-background dark:bg-black min-h-screen">
            <main className="max-w-5xl mx-auto py-4 px-2 space-y-6">
                <div onClick={() => setIsSearchOpen(true)} className="flex items-center bg-gray-200 dark:bg-[#424242] rounded-md h-10 px-4 cursor-text">
                    <SearchIcon className="h-5 w-5 text-secondary dark:text-gray-400" />
                    <span className="ml-3 text-secondary dark:text-gray-400">Search</span>
                </div>

                {suggestedUsers.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-primary dark:text-gray-100 mb-3">Suggested for you</h2>
                        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-2 px-2">
                            {suggestedUsers.map(user => (
                                <div key={user.id} className="w-40 flex-shrink-0">
                                    <UserActionCard 
                                        cardUser={user} 
                                        currentUser={currentUser} 
                                        type="suggestion" 
                                        isVertical={true}
                                        onAction={() => handleSuggestionAction(user.id)}
                                        actionText={sentRequests[user.id] ? "Request Sent" : "Add Friend"}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-1">
                    {explorePosts.map((post) => (
                        <div 
                            key={post.id} 
                            className="aspect-square bg-divider dark:bg-[#424242] cursor-pointer group relative"
                            onClick={() => setSelectedPost(post)}
                        >
                            {post.media && post.media.length > 0 && (
                                <img 
                                    src={post.media[0].url} 
                                    alt="explore post" 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
            </main>
            
            {selectedPost && (
                <PostViewerModal
                    post={selectedPost}
                    user={users[selectedPost.userId]}
                    currentUser={currentUser}
                    users={users}
                    onClose={() => setSelectedPost(null)}
                    onOpenCommentSheet={onOpenCommentSheet}
                />
            )}
            {isSearchOpen && (
                <SearchOverlay 
                    onClose={() => setIsSearchOpen(false)}
                    currentUser={currentUser}
                    users={users}
                    friendRequests={friendRequests}
                    communities={communities}
                    channels={channels}
                />
            )}
        </div>
    );
};

export default ExplorePage;