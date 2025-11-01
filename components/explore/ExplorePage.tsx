import React, { useMemo, useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import PostViewerModal from './PostViewerModal';
import { SearchIcon } from '../Icons';

interface ExplorePageProps {
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
}

const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, users, posts }) => {
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const recommendedPosts = useMemo(() => {
        // 1. Find current user's favorite tags from their own posts
        const userTags = posts
        .filter(p => p.userId === currentUser.id && p.tag)
        .reduce((acc, p) => {
            if (p.tag) {
                const cleanTag = p.tag.replace('#', '');
                acc[cleanTag] = (acc[cleanTag] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const sortedUserTags = Object.keys(userTags).sort((a, b) => userTags[b] - userTags[a]);
        const topUserTags = new Set(sortedUserTags.slice(0, 3)); // Use top 3 tags for personalization

        // 2. Score and sort all other public posts
        const scoredPosts = posts
        .filter(post => {
            const postUser = users[post.userId];
            // Post must be public, not by current user, and have media to be shown in explore
            return postUser?.isPublic && post.userId !== currentUser.id && post.mediaUrls && post.mediaUrls.length > 0;
        })
        .map(post => {
            let score = 0;
            if (post.tag) {
                const cleanTag = post.tag.replace('#', '');
                if(topUserTags.has(cleanTag)) {
                    score = 3; // High score for matching a favorite tag
                } else {
                    score = 2; // Medium score for having any tag
                }
            } else {
                score = 1; // Low score for no tag
            }
            score += Math.random(); // Add randomness to shuffle similarly scored items
            return { ...post, score };
        })
        .sort((a, b) => b.score - a.score); // Sort by highest score

        return scoredPosts;
    }, [posts, users, currentUser.id]);
    
    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) {
            return recommendedPosts;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();
        return recommendedPosts.filter(post => 
            post.content.toLowerCase().includes(lowerCaseQuery) ||
            (post.tag && post.tag.toLowerCase().includes(lowerCaseQuery))
        );
    }, [searchQuery, recommendedPosts]);

    const handlePostClick = (postToFind: Post) => {
        const index = filteredPosts.findIndex(p => p.id === postToFind.id);
        if (index !== -1) {
            setSelectedPostIndex(index);
        }
    };

    const handleCloseModal = () => {
        setSelectedPostIndex(null);
    };
    
    useEffect(() => {
        if (selectedPostIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedPostIndex]);

    return (
        <div className="h-screen w-screen bg-background flex flex-col">
            <header className="p-2 sm:p-4 bg-surface border-b border-divider z-10 flex-shrink-0">
                <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-secondary" />
                </div>
                <input
                    type="text"
                    placeholder="Search posts by content or #tag"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto">
            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                    {filteredPosts.map((post) => (
                        <div 
                            key={post.id} 
                            className="aspect-square bg-gray-200 cursor-pointer group relative"
                            onClick={() => handlePostClick(post)}
                        >
                            <img 
                                src={post.mediaUrls![0]} 
                                alt="explore post" 
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-secondary">
                    <p>No posts found {searchQuery && `for "${searchQuery}"`}.</p>
                </div>
            )}
            </main>
            
            {selectedPostIndex !== null && (
                <PostViewerModal
                    posts={filteredPosts}
                    users={users}
                    currentUser={currentUser}
                    initialIndex={selectedPostIndex}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ExplorePage;