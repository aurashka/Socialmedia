import React, { useMemo, useState } from 'react';
import type { User, Post } from '../../types';
import PostDetailModal from './PostDetailModal';

interface ExplorePageProps {
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
}

const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, users, posts }) => {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const recommendedPosts = useMemo(() => {
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
        const topUserTags = new Set(sortedUserTags.slice(0, 3));

        const scoredPosts = posts
        .filter(post => {
            const postUser = users[post.userId];
            return postUser?.isPublic && post.userId !== currentUser.id && post.mediaUrls && post.mediaUrls.length > 0;
        })
        .map(post => {
            let score = 0;
            if (post.tag) {
                const cleanTag = post.tag.replace('#', '');
                if(topUserTags.has(cleanTag)) score = 3;
                else score = 2;
            } else {
                score = 1;
            }
            score += Math.random();
            return { ...post, score };
        })
        .sort((a, b) => b.score - a.score);

        return scoredPosts;
    }, [posts, users, currentUser.id]);

    return (
        <div className="bg-background">
            <main className="max-w-5xl mx-auto py-1">
                <div className="grid grid-cols-3 gap-1">
                    {recommendedPosts.map((post) => (
                        <div 
                            key={post.id} 
                            className="aspect-square bg-divider cursor-pointer group relative"
                            onClick={() => setSelectedPost(post)}
                        >
                            {post.mediaUrls && post.mediaUrls.length > 0 && (
                                <img 
                                    src={post.mediaUrls[0]} 
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
                <PostDetailModal
                    post={selectedPost}
                    user={users[selectedPost.userId]}
                    currentUser={currentUser}
                    users={users}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};

export default ExplorePage;