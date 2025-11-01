import React, { useState } from 'react';
import type { User } from '../../types';
import { addComment } from '../../services/firebase';

interface AddCommentFormProps {
  currentUser: User;
  postId: string;
  parentCommentId?: string;
  onCommentAdded?: () => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ currentUser, postId, parentCommentId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({
        postId,
        userId: currentUser.id,
        content: content.trim(),
        parentCommentId,
      });
      setContent('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Could not post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <img src={currentUser.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full" />
      <div className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full bg-transparent placeholder-secondary dark:placeholder-gray-400 focus:outline-none text-sm"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-semibold text-accent disabled:text-secondary/50 dark:disabled:text-gray-600"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default AddCommentForm;