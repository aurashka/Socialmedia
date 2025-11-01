import React from 'react';

const PostCardShimmer: React.FC = () => {
    return (
        <div className="bg-surface dark:bg-[#1E1E1E] md:border-y border-divider dark:border-gray-700 animate-pulse">
            <div className="p-3 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-divider dark:bg-gray-700"></div>
                <div className="h-4 bg-divider dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            
            <div className="aspect-square bg-divider dark:bg-gray-700"></div>
            
            <div className="p-3 flex justify-between items-center">
                <div className="flex space-x-4">
                    <div className="w-7 h-7 rounded bg-divider dark:bg-gray-700"></div>
                    <div className="w-7 h-7 rounded bg-divider dark:bg-gray-700"></div>
                    <div className="w-7 h-7 rounded bg-divider dark:bg-gray-700"></div>
                </div>
                <div className="w-7 h-7 rounded bg-divider dark:bg-gray-700"></div>
            </div>

            <div className="px-3 pb-3 space-y-2">
                <div className="h-4 bg-divider dark:bg-gray-700 rounded w-1/5"></div>
                <div className="h-4 bg-divider dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-divider dark:bg-gray-700 rounded w-1/4"></div>
            </div>
        </div>
    );
};

export default PostCardShimmer;