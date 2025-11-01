import React, { useState, useEffect } from 'react';
import type { User, Comment as CommentType } from '../../types';
import { fetchComments } from '../../services/firebase';
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

    useEffect(() => {
        const loadComments = async () => {
            setLoading(true);
            const allComments = await fetchComments(postId);
            setComments(allComments);
            setLoading(false);
        };
        loadComments();
    }, [postId]);

    const topLevelComments = comments.filter(c => !c.parentCommentId);

    return (
        <div className="pt-2 space-y-1">
            {loading ? (
                <>
                    <CommentShimmer />
                    <CommentShimmer />
                </>
            ) : (
                topLevelComments.map(comment => (
                    <Comment key={comment.id} comment={comment} currentUser={currentUser} users={users} />
                ))
            )}
        </div>
    );
};

export default CommentSection;