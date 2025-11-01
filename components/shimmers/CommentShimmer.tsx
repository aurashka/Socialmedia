import React from 'react';

const CommentShimmer: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 animate-pulse py-2">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default CommentShimmer;
