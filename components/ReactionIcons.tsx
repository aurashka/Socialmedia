import React from 'react';

type ReactionIconProps = {
    className?: string;
};

export const LikeReactionIcon: React.FC<ReactionIconProps> = ({ className }) => (
    <div className={`w-10 h-10 rounded-full bg-red-500 flex items-center justify-center border-2 border-white ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
    </div>
);

export const LoveReactionIcon: React.FC<ReactionIconProps> = ({ className }) => (
    <div className={`w-10 h-10 rounded-full bg-red-500 flex items-center justify-center border-2 border-white ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
    </div>
);

export const HahaReactionIcon: React.FC<ReactionIconProps> = ({ className }) => (
    <div className={`w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M14.5 14c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.5 1.5-1.5-.671-1.5-1.5.671-1.5 1.5-1.5zm-5 0c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.5 1.5-1.5-.671-1.5-1.5.671-1.5 1.5-1.5z" /><path d="M12 6.5c-2.206 0-4 1.794-4 4h2c0-1.103.897-2 2-2s2 .897 2 2h2c0-2.206-1.794-4-4-4z" />
        </svg>
    </div>
);

export const WowReactionIcon: React.FC<ReactionIconProps> = ({ className }) => (
    <div className={`w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white ${className}`}>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M12 9a1.5 1.5 0 10.001 3.001A1.5 1.5 0 0012 9z" /><path d="M11 14h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1z" />
        </svg>
    </div>
);

export const SadReactionIcon: React.FC<ReactionIconProps> = ({ className }) => (
    <div className={`w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M9 13h2a1 1 0 010 2H9a1 1 0 010-2zm4 0h2a1 1 0 010 2h-2a1 1 0 010-2z" /><path d="M15.5 8C14.119 8 13 9.119 13 10.5S14.119 13 15.5 13 18 11.881 18 10.5 16.881 8 15.5 8zM8.5 8C7.119 8 6 9.119 6 10.5S7.119 13 8.5 13 11 11.881 11 10.5 9.881 8 8.5 8z" />
        </svg>
    </div>
);

export const AngryReactionIcon: React.FC<ReactionIconProps> = ({ className }) => (
    <div className={`w-10 h-10 rounded-full bg-red-600 flex items-center justify-center border-2 border-white ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M15.5 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8.5 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /><path d="M16 15H8a1 1 0 000 2h8a1 1 0 000-2z" />
        </svg>
    </div>
);