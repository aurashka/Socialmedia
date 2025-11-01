import React, { useState, useRef } from 'react';
import type { User, Post } from '../types';
import { XIcon, GlobeIcon, UsersIcon, LockClosedIcon, ChevronDownIcon, VideoCameraIcon } from './Icons';

interface PostModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (content: string, mediaFiles: File[], privacy: Post['privacy'], areCommentsDisabled: boolean) => Promise<void>;
}

type PrivacyOption = {
  value: Post['privacy'];
  label: string;
  Icon: React.FC<{className?: string}>;
  description: string;
}

const privacyOptions: PrivacyOption[] = [
    { value: 'public', label: 'Public', Icon: GlobeIcon, description: 'Anyone on or off ConnectSphere' },
    { value: 'friends', label: 'Friends', Icon: UsersIcon, description: 'Your friends on ConnectSphere' },
    { value: 'private', label: 'Only me', Icon: LockClosedIcon, description: 'Only you can see this post' }
];

type MediaFile = {
    file: File;
    preview: string;
    type: 'image' | 'video';
};

const PostModal: React.FC<PostModalProps> = ({ currentUser, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacy, setPrivacy] = useState<Post['privacy']>('public');
  const [areCommentsDisabled, setAreCommentsDisabled] = useState(false);
  const [isPrivacyMenuOpen, setIsPrivacyMenuOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const privacyMenuRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // FIX: Explicitly type `file` as File to resolve type inference issue.
      const newMediaFiles: MediaFile[] = files.map((file: File) => ({
          file,
          preview: URL.createObjectURL(file),
          type: file.type.startsWith('video') ? 'video' : 'image',
      }));

      setMediaFiles(prev => [...prev, ...newMediaFiles].slice(0, 5));
    }
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsSubmitting(true);
    await onSubmit(content, mediaFiles.map(mf => mf.file), privacy, areCommentsDisabled);
    onClose();
  };
  
  if (!currentUser) {
    return null;
  }
  
  const selectedPrivacy = privacyOptions.find(opt => opt.value === privacy)!;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 z-50 flex items-center md:items-center justify-center p-0 md:p-4 animate-fade-in" aria-modal="true" role="dialog" onClick={onClose}>
        <style>{`
            @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
      <div className="bg-surface dark:bg-[#1E1E1E] rounded-t-2xl md:rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-full md:max-h-[90vh] transform transition-all text-primary dark:text-gray-100 absolute bottom-0 md:relative animate-slide-up md:animate-none" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-divider dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
            <XIcon className="w-6 h-6 text-secondary dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="p-4 overflow-y-auto flex-grow">
            <div className="flex items-center space-x-3">
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold">{currentUser.name}</p>
                <div className="relative" ref={privacyMenuRef}>
                    <button type="button" onClick={() => setIsPrivacyMenuOpen(!isPrivacyMenuOpen)} className="flex items-center space-x-1 text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                        <selectedPrivacy.Icon className="w-3 h-3"/>
                        <span>{selectedPrivacy.label}</span>
                        <ChevronDownIcon className="w-4 h-4"/>
                    </button>
                    {isPrivacyMenuOpen && (
                        <div className="absolute top-full mt-2 w-48 bg-surface dark:bg-[#262626] rounded-lg shadow-lg border border-divider dark:border-gray-700 z-10">
                            {privacyOptions.map(opt => (
                                <button key={opt.value} type="button" onClick={() => { setPrivacy(opt.value); setIsPrivacyMenuOpen(false); }} className="w-full text-left flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full"><opt.Icon className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-sm font-semibold">{opt.label}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            </div>
            <textarea
              className="w-full mt-4 text-lg placeholder-secondary dark:placeholder-gray-500 focus:outline-none resize-none bg-transparent"
              rows={5}
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 border border-divider dark:border-gray-700 rounded-lg p-2">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative">
                    {media.type === 'image' ? (
                        <img src={media.preview} alt={`Preview ${index}`} className="rounded-lg h-24 w-full object-cover" />
                    ) : (
                        <video src={media.preview} className="rounded-lg h-24 w-full object-cover" muted autoPlay loop playsInline />
                    )}
                    <button type="button" onClick={() => handleRemoveMedia(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-0.5 rounded-full hover:bg-opacity-75" aria-label="Remove media">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
             <div className="mt-4 border border-divider dark:border-gray-700 rounded-lg">
                <div className="p-3 flex justify-between items-center">
                    <span className="font-semibold text-sm">Add to your post</span>
                     <div className="flex items-center space-x-2">
                         <button type="button" onClick={() => fileInputRef.current?.click()} disabled={mediaFiles.length >= 5} className="text-green-500 font-semibold hover:bg-green-50 dark:hover:bg-gray-700 p-2 rounded-full disabled:opacity-50" aria-label="Add photos or videos">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                     </div>
                </div>
                <div className="p-3 border-t border-divider dark:border-gray-700">
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex justify-between items-center">
                        <span className="font-semibold text-sm">Advanced settings</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}/>
                    </button>
                    {showAdvanced && (
                        <div className="mt-3 pt-3 border-t border-divider dark:border-gray-600">
                             <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm">Turn off commenting</p>
                                    <p className="text-xs text-secondary dark:text-gray-400">You can change this later</p>
                                </div>
                                <button type="button" onClick={() => setAreCommentsDisabled(!areCommentsDisabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${areCommentsDisabled ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${areCommentsDisabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                             </div>
                        </div>
                    )}
                </div>
             </div>
          </div>
          <div className="p-4 border-t border-divider dark:border-gray-700 flex-shrink-0">
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange}/>
            <button
              type="submit"
              disabled={(!content.trim() && mediaFiles.length === 0) || isSubmitting}
              className="w-full px-6 py-2.5 bg-accent text-white font-bold rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
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