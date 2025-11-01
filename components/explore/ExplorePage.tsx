import React, { useMemo, useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import PostViewerModal from './PostViewerModal';
import { SearchIcon } from '../Icons';
import { UserResultCard } from '../search/SearchResultCards';
import PostCard from '../PostCard';

interface ExplorePageProps {
    currentUser: User;
    users: Record<string, User>;
    posts: Post[];
}

const getScore = (text: string | undefined, query: string): number => {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (lowerText.startsWith(lowerQuery)) return 5;
    if (lowerText.includes(lowerQuery)) return 2;
    return 0;
};

const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, users, posts }) => {
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'users' | 'posts'>('users');

    const recommendedPosts = useMemo(() => {
        // ... (existing recommendation logic remains the same)
        const userTags = posts
        .filter(p => p.userId === currentUser.id && p.tag)
        .reduce((acc, p) => {
            if (p.tag) {
                const cleanTag = p.tag.replace('#', '');
                acc[cleanTag] = (acc[cleanTag] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const sortedUserTags = Object.keys(userTags).sort((a, b) => userTags[b] - userTags[a]);
        const topUserTags = new Set(sortedUserTags.slice(0, 3));

        const scoredPosts = posts
        .filter(post => {
            const postUser = users[post.userId];
            return postUser?.isPublic && post.userId !== currentUser.id && post.mediaUrls && post.mediaUrls.length > 0;
        })
        .map(post => {
            let score = 0;
            if (post.tag) {
                const cleanTag = post.tag.replace('#', '');
                if(topUserTags.has(cleanTag)) {
                    score = 3;
                } else {
                    score = 2;
                }
            } else {
                score = 1;
            }
            score += Math.random();
            return { ...post, score };
        })
        .sort((a, b) => b.score - a.score);

        return scoredPosts;
    }, [posts, users, currentUser.id]);

    const searchResults = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase().trim();
        if (lowerQuery.length < 2) return { users: [], posts: [] };

        const filteredUsers = (Object.values(users) as User[])
            .filter(u => u && u.id !== currentUser.id && u.isPublic)
            .map(user => {
                const nameScore = getScore(user.name, lowerQuery);
                const handleScore = getScore(user.handle, lowerQuery);
                return { ...user, score: Math.max(nameScore, handleScore) };
            })
            .filter(user => user.score > 0)
            .sort((a, b) => b.score - a.score);

        const filteredPosts = (posts as Post[])
            .filter(post => {
                const postUser = users[post.userId];
                return post.userId === currentUser.id || (postUser && postUser.isPublic && post.isPublic !== false);
            })
            .map(post => {
                const contentScore = getScore(post.content, lowerQuery);
                const tagScore = getScore(post.tag, lowerQuery);
                const score = contentScore * 2 + (tagScore * 5);
                return { ...post, score };
            })
            .filter(post => post.score > 0)
            .sort((a,b) => b.score - a.score);

        return { users: filteredUsers, posts: filteredPosts };
    }, [searchQuery, users, posts, currentUser.id]);

    const handlePostClick = (postToFind: Post) => {
        const index = recommendedPosts.findIndex(p => p.id === postToFind.id);
        if (index !== -1) {
            setSelectedPostIndex(index);
        }
    };

    const handleCloseModal = () => {
        setSelectedPostIndex(null);
    };
    
    useEffect(() => {
        if (selectedPostIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedPostIndex]);

    const showSearchResults = searchQuery.trim().length > 1;

    const renderSearchResults = () => {
      const noResults = searchResults.users.length === 0 && searchResults.posts.length === 0;
      return (
        <div className="p-2 sm:p-4 max-w-2xl mx-auto">
          <div className="flex border-b mb-4">
            <FilterTab label="Users" active={activeFilter === 'users'} onClick={() => setActiveFilter('users')} />
            <FilterTab label="Posts" active={activeFilter === 'posts'} onClick={() => setActiveFilter('posts')} />
          </div>
          {noResults ? (
            <p className="text-center text-secondary py-8">No results for "{searchQuery}"</p>
          ) : (
            <div className="space-y-4">
              {activeFilter === 'users' && (
                searchResults.users.length > 0 ? (
                  searchResults.users.map(user => <UserResultCard key={user.id} user={user} />)
                ) : (
                  <p className="text-center text-secondary py-8">No users found.</p>
                )
              )}
              {activeFilter === 'posts' && (
                searchResults.posts.length > 0 ? (
                  searchResults.posts.map(post => <PostCard key={post.id} post={post} user={users[post.userId]} currentUser={currentUser} />)
                ) : (
                  <p className="text-center text-secondary py-8">No posts found.</p>
                )
              )}
            </div>
          )}
        </div>
      );
    }

    return (
        <div className="h-screen w-screen bg-background flex flex-col">
            <header className="p-2 sm:p-4 bg-surface border-b border-divider z-10 flex-shrink-0">
                <div className="relative max-w-xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-secondary" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search users, posts, #tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto">
            {showSearchResults ? renderSearchResults() : (
              recommendedPosts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                      {recommendedPosts.map((post) => (
                          <div 
                              key={post.id} 
                              className="aspect-square bg-gray-200 cursor-pointer group relative"
                              onClick={() => handlePostClick(post)}
                          >
                              <img 
                                  src={post.mediaUrls![0]} 
                                  alt="explore post" 
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="flex items-center justify-center h-full text-secondary">
                      <p>No posts to explore right now.</p>
                  </div>
              )
            )}
            </main>
            
            {selectedPostIndex !== null && (
                <PostViewerModal
                    posts={recommendedPosts}
                    users={users}
                    currentUser={currentUser}
                    initialIndex={selectedPostIndex}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

const FilterTab: React.FC<{label: string; active: boolean; onClick: () => void}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold text-sm border-b-2 ${active ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
  >
    {label}
  </button>
);


export default ExplorePage;
