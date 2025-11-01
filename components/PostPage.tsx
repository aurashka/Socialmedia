import React from 'react';
import type { User, Post } from '../../types';
import PostCard from './PostCard';
import LoadingSpinner from './LoadingSpinner';

interface PostPageProps {
  postId?: string;
  currentUser: User;
  users: Record<string, User>;
  posts: Post[];
  onOpenCommentSheet: (postId: string) => void;
}

const PostPage: React.FC<PostPageProps> = ({ postId, currentUser, users, posts, onOpenCommentSheet }) => {
    if (!postId) {
        return <div className="p-4 text-center text-red-500">Post ID is missing.</div>;
    }

    const post = posts.find(p => p.id === postId);

    if (!post) {
        // This could also be a loading state if posts are fetched individually
        return (
            <div className="p-8 text-center">
                <p>Post not found or is no longer available.</p>
            </div>
        );
    }
    
    const user = users[post.userId];

    return (
        <div className="max-w-lg mx-auto py-4">
            <PostCard 
                post={post} 
                user={user} 
                currentUser={currentUser} 
                users={users}
                onOpenCommentSheet={onOpenCommentSheet} 
            />
        </div>
    );
};

export default PostPage;