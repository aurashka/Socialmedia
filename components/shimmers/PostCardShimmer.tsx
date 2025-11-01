import React from 'react';

const PostCardShimmer: React.FC = () => {
    return (
        <div className="bg-surface rounded-lg p-4 border border-divider">
            <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
            <div className="mt-4 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="mt-4 h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
    );
};

export default PostCardShimmer;
