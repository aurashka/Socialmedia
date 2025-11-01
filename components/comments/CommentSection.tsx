import React, { useState, useEffect, useCallback } from 'react';
import type { User, Comment as CommentType } from '../../types';
import { fetchComments, COMMENTS_PER_PAGE } from '../../services/firebase';
import Comment from './Comment';
import CommentShimmer from '../shimmers/CommentShimmer';

interface CommentSectionProps {
    postId: string;
    currentUser: User;
    users: Record<string, User>;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUser, users }) => {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const loadInitialComments = useCallback(async () => {
        setLoading(true);
        const initialComments = await fetchComments(postId);
        setComments(initialComments);
        setHasMore(initialComments.length === COMMENTS_PER_PAGE);
        setLoading(false);
    }, [postId]);

    useEffect(() => {
        loadInitialComments();
    }, [loadInitialComments]);

    const loadMoreComments = async () => {
        if (isFetchingMore || !hasMore || comments.length === 0) return;
        setIsFetchingMore(true);
        const lastComment = comments[comments.length - 1];
        const newComments = await fetchComments(postId, lastComment.timestamp);
        setComments(prev => [...prev, ...newComments]);
        setHasMore(newComments.length === COMMENTS_PER_PAGE);
        setIsFetchingMore(false);
    };

    return (
        <div className="pt-2 space-y-2">
            {loading ? (
                <>
                    <CommentShimmer />
                    <CommentShimmer />
                </>
            ) : (
                comments.map(comment => (
                    <Comment key={comment.id} comment={comment} currentUser={currentUser} users={users} />
                ))
            )}

            {hasMore && !loading && (
                <button onClick={loadMoreComments} disabled={isFetchingMore} className="text-sm font-semibold text-secondary hover:underline">
                    {isFetchingMore ? 'Loading...' : 'View more comments'}
                </button>
            )}
        </div>
    );
};

export default CommentSection;
