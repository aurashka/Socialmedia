import React from 'react';
import { XIcon } from './Icons';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        aria-label="Close image view"
      >
        <XIcon className="w-6 h-6" />
      </button>
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Lightbox view" className="max-w-full max-h-[90vh] object-contain rounded-md" />
      </div>
    </div>
  );
};

export default ImageLightbox;