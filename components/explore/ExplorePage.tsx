import React, { useMemo, useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import PostViewerModal from './PostViewerModal';

interface ExplorePageProps {
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
}

const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, users, posts }) => {
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);

    const shuffledPublicPosts = useMemo(() => {
        const publicPosts = posts.filter(post => {
            const postUser = users[post.userId];
            return postUser?.isPublic && post.userId !== currentUser.id;
        });

        // Shuffle the array
        for (let i = publicPosts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [publicPosts[i], publicPosts[j]] = [publicPosts[j], publicPosts[i]];
        }
        return publicPosts;
    }, [posts, users, currentUser.id]);

    const handlePostClick = (index: number) => {
        setSelectedPostIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedPostIndex(null);
    };
    
    // Prevent body scroll when modal is open
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
        <div className="p-1 sm:p-2">
            <h1 className="text-2xl font-bold p-2 mb-2">Explore</h1>
            <div className="grid grid-cols-3 gap-1">
                {shuffledPublicPosts.map((post, index) => (
                    post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div 
                            key={post.id} 
                            className="aspect-square bg-gray-200 cursor-pointer"
                            onClick={() => handlePostClick(index)}
                        >
                            <img 
                                src={post.mediaUrls[0]} 
                                alt="explore post" 
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    )
                ))}
            </div>
            
            {selectedPostIndex !== null && (
                <PostViewerModal
                    posts={shuffledPublicPosts}
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
