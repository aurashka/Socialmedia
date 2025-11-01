import React, { useState } from 'react';
import type { User, Comment as CommentType } from '../../types';
import { parseContent } from '../../utils/textUtils';
import AddCommentForm from './AddCommentForm';
import { fetchReplies } from '../../services/firebase';
import { HeartIcon } from '../Icons';

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
        const minutes = Math.floor(seconds / 60);
        if (minutes < 1) return `now`;
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w`;
    };

    if (!user) return null;

    const topLevelComment = (
        <div className="flex items-start space-x-3 text-sm py-2">
            <a href={`#/profile/${user.id}`}>
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
            </a>
            <div className="flex-1">
                <p>
                    <a href={`#/profile/${user.id}`} className="font-bold hover:underline mr-1.5">{user.name}</a>
                    {parseContent(comment.content, users)}
                </p>
                <div className="flex items-center space-x-3 text-xs text-secondary pt-1">
                    <span>{timeAgo(comment.timestamp)}</span>
                    <button className="font-semibold hover:underline" onClick={() => setShowReplyForm(!showReplyForm)}>Reply</button>
                </div>
            </div>
            <button className="flex-shrink-0 mt-1">
                <HeartIcon className="w-4 h-4 text-secondary" />
            </button>
        </div>
    );
    
    return (
        <div>
            {topLevelComment}
            
            <div className="pl-8">
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
                    <button onClick={loadReplies} className="text-xs font-semibold text-secondary px-2 py-1 hover:underline">
                        {loadingReplies ? 'Loading...' : `— View ${comment.replyCount} ${comment.replyCount > 1 ? 'replies' : 'reply'}`}
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