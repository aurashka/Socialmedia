import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { XIcon } from './Icons';

interface PostModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (content: string, imageFiles: File[]) => Promise<void>;
}

const PostModal: React.FC<PostModalProps> = ({ currentUser, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = [...imageFiles, ...files].slice(0, 5); // Limit to 5 images
      setImageFiles(newFiles);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && imageFiles.length === 0) return;

    setIsSubmitting(true);
    await onSubmit(content, imageFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-surface dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all text-primary dark:text-gray-100">
        <div className="p-4 border-b border-divider dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
            <XIcon className="w-6 h-6 text-secondary dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center space-x-3">
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
              <p className="font-semibold">{currentUser.name}</p>
            </div>
            <textarea
              className="w-full mt-4 text-lg placeholder-secondary dark:placeholder-gray-500 focus:outline-none resize-none bg-transparent"
              rows={5}
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 border border-divider dark:border-gray-700 rounded-lg p-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index}`} className="rounded-lg h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-0.5 rounded-full hover:bg-opacity-75"
                      aria-label="Remove image"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-divider dark:border-gray-700 flex justify-between items-center">
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageFiles.length >= 5}
                className="text-accent font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded-md disabled:opacity-50"
            >
                Add Photos
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageChange}
            />
            <button
              type="submit"
              disabled={(!content.trim() && imageFiles.length === 0) || isSubmitting}
              className="px-6 py-2 bg-accent text-white font-bold rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;