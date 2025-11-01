import React, { useState, useMemo } from 'react';
import type { User, Community, Channel, Post } from '../../types';
import { SearchIcon } from '../Icons';
import { UserResultCard, CommunityResultCard, ChannelResultCard } from './SearchResultCards';
import PostCard from '../PostCard';

interface SearchPageProps {
  query: string;
  currentUser: User;
  users: Record<string, User>;
  communities: Record<string, Community>;
  channels: Record<string, Channel>;
  posts: Post[];
}

type FilterType = 'all' | 'people' | 'posts' | 'communities' | 'channels';

const getScore = (text: string | undefined, query: string): number => {
    if (!text || !query) return 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (lowerText.startsWith(lowerQuery)) return 10;
    if (lowerText.includes(lowerQuery)) return 5;

    const textWords = lowerText.split(/\s+/);
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);
    let score = 0;
    
    queryWords.forEach(qWord => {
        if (textWords.some(tWord => tWord.startsWith(qWord))) {
            score += 2;
        }
    });

    return score;
};


const SearchPage: React.FC<SearchPageProps> = ({ query, currentUser, users, communities, channels, posts }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

    const searchResults = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.length < 2) return { people: [], communities: [], channels: [], posts: [] };

        const filteredPeople = (Object.values(users) as User[])
            .filter(u => u && u.id !== currentUser.id && u.isPublic && (!showVerifiedOnly || u.isVerified))
            .map(user => {
                const nameScore = getScore(user.name, lowerQuery);
                const handleScore = getScore(user.handle, lowerQuery);
                return { ...user, score: Math.max(nameScore, handleScore) };
            })
            .filter(user => user.score > 0)
            .sort((a, b) => b.score - a.score);

        const filteredCommunities = (Object.values(communities) as Community[])
            .filter(c => c && c.isPublic)
            .map(community => ({ ...community, score: getScore(community.name, lowerQuery) }))
            .filter(c => c.score > 0)
            .sort((a,b) => b.score - a.score);

        const filteredChannels = (Object.values(channels) as Channel[])
            .filter(c => c && (!showVerifiedOnly || c.isVerified))
            .map(channel => ({ ...channel, score: getScore(channel.name, lowerQuery) }))
            .filter(c => c.score > 0)
            .sort((a,b) => b.score - a.score);
        
        const filteredPosts = (posts as Post[])
            .filter(post => {
                const postUser = users[post.userId];
                if (!postUser) return false;
                
                if (post.userId === currentUser.id) return true; // Always include user's own posts

                const privacy = post.privacy || 'public';
                if (privacy === 'public') return true;
                if (privacy === 'friends' && currentUser.friends?.[post.userId]) return true;

                return false;
            })
            .map(post => {
                const contentScore = getScore(post.content, lowerQuery);
                const tagScore = getScore(post.tag, lowerQuery);
                const score = contentScore * 2 + tagScore * 5; // Tags are more heavily weighted
                return { ...post, score };
            })
            .filter(post => post.score > 0)
            .sort((a,b) => b.score - a.score);

        return {
            people: filteredPeople,
            communities: filteredCommunities,
            channels: filteredChannels,
            posts: filteredPosts,
        };
    }, [query, users, communities, channels, posts, currentUser, showVerifiedOnly]);

    const renderResults = () => {
        const noResults = searchResults.people.length === 0 && searchResults.communities.length === 0 && searchResults.channels.length === 0 && searchResults.posts.length === 0;
        if (noResults) {
            return (
                <div className="bg-surface dark:bg-gray-900 rounded-lg p-8 text-center text-secondary dark:text-gray-400 mt-4">
                    <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h2 className="font-bold text-lg text-primary dark:text-gray-100">No results for "{query}"</h2>
                    <p>Try searching for something else.</p>
                </div>
            )
        }
        
        return (
            <div className="space-y-6">
                {(activeFilter === 'all' || activeFilter === 'people') && searchResults.people.length > 0 && (
                    <ResultSection title="People">
                        {searchResults.people.map(user => <UserResultCard key={user.id} user={user} />)}
                    </ResultSection>
                )}
                 {(activeFilter === 'all' || activeFilter === 'posts') && searchResults.posts.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold mb-3 text-primary dark:text-gray-100">Posts</h3>
                        <div className="space-y-4">
                            {searchResults.posts.map(post => (
                                <PostCard key={post.id} post={post} user={users[post.userId]} currentUser={currentUser} users={users}/>
                            ))}
                        </div>
                    </section>
                )}
                 {(activeFilter === 'all' || activeFilter === 'communities') && searchResults.communities.length > 0 && (
                    <ResultSection title="Communities">
                        {searchResults.communities.map(community => <CommunityResultCard key={community.id} community={community} />)}
                    </ResultSection>
                )}
                 {(activeFilter === 'all' || activeFilter === 'channels') && searchResults.channels.length > 0 && (
                    <ResultSection title="Channels">
                        {searchResults.channels.map(channel => <ChannelResultCard key={channel.id} channel={channel} />)}
                    </ResultSection>
                )}
            </div>
        )
    }

  return (
    <div className="flex">
        <aside className="hidden md:block w-80 h-[calc(100vh-56px)] bg-surface dark:bg-gray-900 border-r border-divider dark:border-gray-800 p-4 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4 text-primary dark:text-gray-100">Search Results</h2>
            <ul className="space-y-1">
                <FilterButton label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                <FilterButton label="People" active={activeFilter === 'people'} onClick={() => setActiveFilter('people')} />
                <FilterButton label="Posts" active={activeFilter === 'posts'} onClick={() => setActiveFilter('posts')} />
                <FilterButton label="Communities" active={activeFilter === 'communities'} onClick={() => setActiveFilter('communities')} />
                <FilterButton label="Channels" active={activeFilter === 'channels'} onClick={() => setActiveFilter('channels')} />
            </ul>
            <hr className="my-4 border-divider dark:border-gray-700" />
            <h3 className="text-lg font-bold mb-2 text-primary dark:text-gray-100">Filters</h3>
            <label className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <input type="checkbox" checked={showVerifiedOnly} onChange={(e) => setShowVerifiedOnly(e.target.checked)} className="h-4 w-4 rounded text-accent focus:ring-accent" />
                <span className="font-semibold text-primary dark:text-gray-100">Verified Only</span>
            </label>
        </aside>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-56px)]">
            <h1 className="text-2xl font-bold mb-4 text-primary dark:text-gray-100">Results for "{query}"</h1>
            {renderResults()}
        </main>
    </div>
  );
};

// --- Sub-components for SearchPage ---

const FilterButton: React.FC<{label: string, active: boolean, onClick: () => void}> = ({ label, active, onClick }) => (
    <li>
        <button 
            onClick={onClick}
            className={`w-full text-left p-2 rounded-md font-semibold ${active ? 'bg-blue-100 dark:bg-accent/20 text-accent dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-primary dark:text-gray-100'}`}
        >
            {label}
        </button>
    </li>
);

const ResultSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <section>
        <h3 className="text-lg font-bold mb-3 text-primary dark:text-gray-100">{title}</h3>
        <div className="bg-surface dark:bg-gray-900 rounded-lg border border-divider dark:border-gray-800 divide-y divide-divider dark:divide-gray-800">
            {children}
        </div>
    </section>
);

export default SearchPage;
