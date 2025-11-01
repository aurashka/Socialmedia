import React, { useState, useEffect } from 'react';
import type { User, Comment as CommentType } from '../../types';
import { parseContent } from '../../utils/textUtils';
import AddCommentForm from './AddCommentForm';
import { fetchReplies } from '../../services/firebase';

interface CommentProps {
    comment: CommentType;
    currentUser: User;
    users: Record<string, User>;
}

const Comment: React.FC<CommentProps> = ({ comment, currentUser, users }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const user = users[comment.userId];

    const loadReplies = async () => {
        if (loadingReplies) return;
        setLoadingReplies(true);
        const fetchedReplies = await fetchReplies(comment.id);
        setReplies(fetchedReplies);
        setShowReplies(true);
        setLoadingReplies(false);
    };

    const timeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `Just now`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    if (!user) return null;

    return (
        <div className="flex items-start space-x-3 text-sm">
            <a href={`#/profile/${user.id}`}>
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
            </a>
            <div className="flex-1">
                <div className="bg-background rounded-xl p-2">
                    <a href={`#/profile/${user.id}`} className="font-bold hover:underline">{user.name}</a>
                    <p className="whitespace-pre-wrap">{parseContent(comment.content, users)}</p>
                </div>
                <div className="flex items-center space-x-3 text-xs text-secondary px-2 pt-1">
                    <span>{timeAgo(comment.timestamp)}</span>
                    <button className="font-semibold hover:underline" onClick={() => setShowReplyForm(!showReplyForm)}>Reply</button>
                </div>
                
                {showReplyForm && (
                    <div className="pt-2">
                        <AddCommentForm 
                            currentUser={currentUser}
                            postId={comment.postId}
                            parentCommentId={comment.id}
                            users={users}
                            onCommentAdded={() => {
                                setShowReplyForm(false);
                                loadReplies();
                            }}
                        />
                    </div>
                )}

                {comment.replyCount > 0 && !showReplies && (
                    <button onClick={loadReplies} className="text-xs font-semibold text-secondary px-2 pt-1 hover:underline">
                        {loadingReplies ? 'Loading...' : `View ${comment.replyCount} ${comment.replyCount > 1 ? 'replies' : 'reply'}`}
                    </button>
                )}

                {showReplies && replies.length > 0 && (
                    <div className="pt-2 space-y-2">
                        {replies.map(reply => (
                           <Comment key={reply.id} comment={reply} currentUser={currentUser} users={users} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;
