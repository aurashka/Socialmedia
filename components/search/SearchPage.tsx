import React, { useState, useMemo } from 'react';
import type { User, Community, Channel } from '../../types';
import { SearchIcon } from '../Icons';

interface SearchPageProps {
  query: string;
  currentUser: User;
  users: Record<string, User>;
  communities: Record<string, Community>;
  channels: Record<string, Channel>;
}

type FilterType = 'all' | 'people' | 'communities' | 'channels';

const getScore = (text: string | undefined, query: string): number => {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (lowerText.startsWith(lowerQuery)) return 5;
    if (lowerText.includes(lowerQuery)) return 2;
    return 0;
};


const SearchPage: React.FC<SearchPageProps> = ({ query, currentUser, users, communities, channels }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

    const searchResults = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.length < 2) return { people: [], communities: [], channels: [] };

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

        return {
            people: filteredPeople,
            communities: filteredCommunities,
            channels: filteredChannels
        };
    }, [query, users, communities, channels, currentUser.id, showVerifiedOnly]);

    const renderResults = () => {
        const noResults = searchResults.people.length === 0 && searchResults.communities.length === 0 && searchResults.channels.length === 0;
        if (noResults) {
            return (
                <div className="bg-surface rounded-lg p-8 text-center text-secondary mt-4">
                    <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="font-bold text-lg">No results for "{query}"</h2>
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
        <aside className="hidden md:block w-80 h-[calc(100vh-56px)] bg-surface border-r p-4 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            <ul className="space-y-1">
                <FilterButton label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                <FilterButton label="People" active={activeFilter === 'people'} onClick={() => setActiveFilter('people')} />
                <FilterButton label="Communities" active={activeFilter === 'communities'} onClick={() => setActiveFilter('communities')} />
                <FilterButton label="Channels" active={activeFilter === 'channels'} onClick={() => setActiveFilter('channels')} />
            </ul>
            <hr className="my-4" />
            <h3 className="text-lg font-bold mb-2">Filters</h3>
            <label className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <input type="checkbox" checked={showVerifiedOnly} onChange={(e) => setShowVerifiedOnly(e.target.checked)} className="h-4 w-4 rounded text-primary focus:ring-primary" />
                <span className="font-semibold">Verified Only</span>
            </label>
        </aside>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-56px)]">
            <h1 className="text-2xl font-bold mb-4">Results for "{query}"</h1>
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
            className={`w-full text-left p-2 rounded-md font-semibold ${active ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100'}`}
        >
            {label}
        </button>
    </li>
);

const ResultSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <section>
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        <div className="bg-surface rounded-lg border divide-y">
            {children}
        </div>
    </section>
);

const UserResultCard: React.FC<{user: User}> = ({ user }) => (
    <a href={`#/profile/${user.id}`} className="flex items-center space-x-4 p-3 hover:bg-gray-50 transition-colors">
        <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
        <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-secondary">@{user.handle}</p>
        </div>
    </a>
);

const CommunityResultCard: React.FC<{community: Community}> = ({ community }) => (
    <a href={`#/community/${community.id}`} className="flex items-center space-x-4 p-3 hover:bg-gray-50 transition-colors">
        <img src={community.avatarUrl} alt={community.name} className="w-14 h-14 rounded-lg object-cover" />
        <div>
            <p className="font-bold">{community.name}</p>
            <p className="text-sm text-secondary">{Object.keys(community.members).length} members</p>
        </div>
    </a>
);

const ChannelResultCard: React.FC<{channel: Channel}> = ({ channel }) => (
    <a href={`#/channel/${channel.id}`} className="flex items-center space-x-4 p-3 hover:bg-gray-50 transition-colors">
        <img src={channel.avatarUrl} alt={channel.name} className="w-14 h-14 rounded-full object-cover" />
        <div>
            <p className="font-bold">{channel.name}</p>
            <p className="text-sm text-secondary">{Object.keys(channel.subscribers).length} subscribers</p>
        </div>
    </a>
);

export default SearchPage;
