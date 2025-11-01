import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, Post, Comment as CommentType } from '../../types';
import { fetchComments } from '../../services/firebase';
import { XIcon } from '../Icons';
import AddCommentForm from './AddCommentForm';
import Comment from './Comment';
import { parseContent } from '../../utils/textUtils';

interface CommentSheetProps {
    post: Post;
    currentUser: User;
    users: Record<string, User>;
    onClose: () => void;
}

const CommentSheet: React.FC<CommentSheetProps> = ({ post, currentUser, users, onClose }) => {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const postUser = users[post.userId];

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedComments = await fetchComments(post.id);
            setComments(fetchedComments);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    }, [post.id]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const commentTree = useMemo(() => {
        const commentMap: Record<string, CommentType & { replies: CommentType[] }> = {};
        comments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        const tree: (CommentType & { replies: CommentType[] })[] = [];
        comments.forEach(comment => {
            if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
                commentMap[comment.parentCommentId].replies.push(commentMap[comment.id]);
            } else {
                tree.push(commentMap[comment.id]);
            }
        });
        return tree;
    }, [comments]);
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 z-50 flex items-end md:items-center justify-center" aria-modal="true" role="dialog" onClick={onClose}>
            <style>{`
                @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
            <div 
                className="bg-surface dark:bg-[#1E1E1E] rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-lg flex flex-col h-[85vh] md:h-[70vh] text-primary dark:text-gray-100 animate-slide-up md:animate-fade-in" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-divider dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Comments</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                        <XIcon className="w-6 h-6 text-secondary dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto px-4">
                    {postUser && (
                         <div className="flex items-start space-x-3 text-sm py-3 my-2 border-b border-divider dark:border-gray-700">
                            <a href={`#/profile/${postUser.id}`}>
                                <img src={postUser.avatarUrl} alt={postUser.name} className="w-8 h-8 rounded-full mt-1" />
                            </a>
                            <div className="flex-1">
                                <p>
                                  <a href={`#/profile/${postUser.id}`} className="font-bold hover:underline mr-1.5">{postUser.name}</a>
                                  {parseContent(post.content, users)}
                                </p>
                            </div>
                        </div>
                    )}
                    {loading ? (
                       <div className="pt-4 space-y-4">
                           <CommentShimmer />
                           <CommentShimmer />
                           <CommentShimmer />
                       </div>
                    ) : commentTree.length > 0 ? (
                        commentTree.map(comment => (
                            <Comment 
                                key={comment.id} 
                                comment={comment} 
                                post={post}
                                currentUser={currentUser} 
                                users={users}
                                onCommentChange={loadComments}
                            />
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-secondary dark:text-gray-400 text-center py-10">
                            <h3 className="font-bold text-lg text-primary dark:text-gray-200">No Comments Yet</h3>
                            <p>Be the first to share what you think!</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-divider dark:border-gray-700 flex-shrink-0 bg-surface dark:bg-[#1E1E1E]">
                    <AddCommentForm 
                        postId={post.id} 
                        postOwnerId={post.userId}
                        currentUser={currentUser} 
                        allUsers={users}
                        onCommentAdded={loadComments} 
                    />
                </div>
            </div>
        </div>
    );
};

const CommentShimmer: React.FC = () => (
    <div className="flex items-start space-x-3 animate-pulse py-2">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    </div>
);


export default CommentSheet;
