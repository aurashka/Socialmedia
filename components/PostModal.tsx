import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { XIcon } from './Icons';

interface PostModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (content: string, imageFile?: File) => Promise<void>;
}

const PostModal: React.FC<PostModalProps> = ({ currentUser, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(undefined);
    setImagePreview(undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    await onSubmit(content, imageFile);
    // Don't set isSubmitting to false here, as the component will unmount
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" aria-label="Close">
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center space-x-3">
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
              <p className="font-semibold">{currentUser.name}</p>
            </div>
            <textarea
              className="w-full mt-4 text-lg placeholder-text-secondary focus:outline-none resize-none bg-transparent"
              rows={5}
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            {imagePreview && (
              <div className="mt-4 relative border rounded-lg p-2">
                <img src={imagePreview} alt="Preview" className="rounded-lg max-h-80 w-full object-contain" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                  aria-label="Remove image"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="p-4 border-t flex justify-between items-center">
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary font-semibold hover:bg-blue-50 p-2 rounded-md"
            >
                Add Photo
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
            />
            <button
              type="submit"
              disabled={(!content.trim() && !imageFile) || isSubmitting}
              className="px-6 py-2 bg-primary text-white font-bold rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
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
