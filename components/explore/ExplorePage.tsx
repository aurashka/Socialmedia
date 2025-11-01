import React, { useMemo, useState } from 'react';
import type { User, Post } from '../../types';
import PostViewerModal from './PostViewerModal';

interface ExplorePageProps {
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
}

const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, users, posts }) => {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const explorePosts = useMemo(() => {
        return posts
            .filter(post => {
                const postUser = users[post.userId];
                // Show public posts from other users that have media
                return postUser?.isPublic && post.userId !== currentUser.id && post.mediaUrls && post.mediaUrls.length > 0;
            })
            // Sort randomly to give a sense of discovery
            .sort(() => 0.5 - Math.random());
    }, [posts, users, currentUser.id]);


    return (
        <div className="bg-background">
            <main className="max-w-5xl mx-auto py-1">
                <div className="grid grid-cols-3 gap-1">
                    {explorePosts.map((post) => (
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
                <PostViewerModal
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
