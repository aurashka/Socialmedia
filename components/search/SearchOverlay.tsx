import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Community, Channel } from '../../types';
import { SearchIcon, XIcon } from '../Icons';
import { UserResultCard, CommunityResultCard, ChannelResultCard } from './SearchResultCards';
import UserActionCard from '../friends/UserActionCard';

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

interface SearchOverlayProps {
    onClose: () => void;
    currentUser: User;
    users: Record<string, User>;
    friendRequests: Record<string, any>;
    communities: Record<string, Community>;
    channels: Record<string, Channel>;
}

const RECENT_SEARCHES_KEY = 'connectsphere_recent_searches';

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose, currentUser, users, friendRequests, communities, channels }) => {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

    useEffect(() => {
        try {
            const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (storedSearches) {
                setRecentSearches(JSON.parse(storedSearches));
            }
        } catch (error) {
            console.error("Failed to load recent searches:", error);
        }
    }, []);

    const updateRecentSearches = (newQuery: string) => {
        const trimmedQuery = newQuery.trim();
        if (!trimmedQuery) return;

        setRecentSearches(prev => {
            const updated = [trimmedQuery, ...prev.filter(q => q.toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 10);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error("Failed to save recent searches:", error);
            }
            return updated;
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            updateRecentSearches(query);
            window.location.hash = `#/search/${encodeURIComponent(query.trim())}`;
            onClose();
        }
    };
    
    const handleRecentClick = (term: string) => {
        updateRecentSearches(term);
        window.location.hash = `#/search/${encodeURIComponent(term)}`;
        onClose();
    }

    const removeRecentSearch = (searchToRemove: string) => {
        setRecentSearches(prev => {
            const updated = searchToRemove === '__all__' ? [] : prev.filter(q => q !== searchToRemove);
             try {
                if (updated.length > 0) {
                    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
                } else {
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                }
            } catch (error) {
                console.error("Failed to save recent searches:", error);
            }
            return updated;
        });
    };
    
    const searchResults = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.length < 1) return null;

        const filteredPeople = (Object.values(users) as User[])
            .filter(u => u && u.id !== currentUser.id && u.isPublic)
            .map(user => {
                const nameScore = getScore(user.name, lowerQuery);
                const handleScore = getScore(user.handle, lowerQuery);
                return { ...user, score: Math.max(nameScore, handleScore) };
            })
            .filter(user => user.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const filteredCommunities = (Object.values(communities) as Community[])
            .filter(c => c && c.isPublic)
            .map(community => ({ ...community, score: getScore(community.name, lowerQuery) }))
            .filter(c => c.score > 0)
            .sort((a,b) => b.score - a.score)
            .slice(0, 3);
        
        const filteredChannels = (Object.values(channels) as Channel[])
            .filter(c => c)
            .map(channel => ({ ...channel, score: getScore(channel.name, lowerQuery) }))
            .filter(c => c.score > 0)
            .sort((a,b) => b.score - a.score)
            .slice(0, 3);

        return { people: filteredPeople, communities: filteredCommunities, channels: filteredChannels };
    }, [query, users, communities, channels, currentUser.id]);

    const requestSenderIds = useMemo(() => Object.keys(friendRequests), [friendRequests]);
    const suggestedUsers = useMemo(() => {
        if (!users || !currentUser) return [];
        const currentUserFriendIds = currentUser.friends ? Object.keys(currentUser.friends) : [];
        const friendRequestSenderIds = Object.keys(friendRequests);
        return (Object.values(users) as User[])
            .filter(user => 
                user && user.id !== currentUser.id &&
                !currentUserFriendIds.includes(user.id) &&
                !friendRequestSenderIds.includes(user.id) &&
                user.isPublic
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
    }, [currentUser, users, friendRequests]);
    
    const handleSuggestionAction = (userId: string) => {
        setSentRequests(prev => ({ ...prev, [userId]: true }));
    }

    const renderContent = () => {
        if (searchResults) {
            const { people, communities, channels } = searchResults;
            const hasResults = people.length > 0 || communities.length > 0 || channels.length > 0;
            return (
                <div className="divide-y divide-divider">
                    {people.length > 0 && <div className="py-2">{people.map(u => <UserResultCard key={u.id} user={u}/>)}</div>}
                    {communities.length > 0 && <div className="py-2">{communities.map(c => <CommunityResultCard key={c.id} community={c}/>)}</div>}
                    {channels.length > 0 && <div className="py-2">{channels.map(c => <ChannelResultCard key={c.id} channel={c}/>)}</div>}
                    {hasResults && (
                         <form onSubmit={handleSearchSubmit} className="p-2">
                             <button type="submit" className="block text-center w-full p-2 font-semibold text-primary hover:bg-gray-100 rounded-md">
                                See all results for "{query}"
                             </button>
                         </form>
                    )}
                    {!hasResults && (
                        <p className="text-center p-8 text-secondary">No results found for "{query}"</p>
                    )}
                </div>
            )
        }
        
        return (
            <div className="p-4 space-y-6">
                 {recentSearches.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Recent</h3>
                            <button onClick={() => removeRecentSearch('__all__')} className="text-sm text-accent hover:underline">Clear all</button>
                        </div>
                        <ul className="space-y-1">
                            {recentSearches.map(term => (
                                <li key={term} className="flex items-center justify-between group -m-2 p-2 rounded-lg hover:bg-gray-100">
                                    <button onClick={() => handleRecentClick(term)} className="text-primary text-left flex-grow">{term}</button>
                                    <button onClick={() => removeRecentSearch(term)} className="opacity-0 group-hover:opacity-100 p-1">
                                        <XIcon className="w-4 h-4 text-secondary"/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
                 {requestSenderIds.length > 0 && (
                    <div>
                         <h3 className="font-bold mb-2">Friend Requests</h3>
                         <div className="space-y-2">
                            {requestSenderIds.slice(0,2).map(id => <UserActionCard key={id} cardUser={users[id]} currentUser={currentUser} type="request" />)}
                            {requestSenderIds.length > 2 && <a href="#/friends" onClick={onClose} className="text-sm text-accent font-semibold text-center block mt-2 hover:underline">See all</a>}
                         </div>
                    </div>
                 )}
                 {suggestedUsers.length > 0 && (
                     <div>
                         <h3 className="font-bold mb-2">Suggested For You</h3>
                         <div className="space-y-2">
                             {suggestedUsers.map(user => (
                                 <UserActionCard 
                                     key={user.id}
                                     cardUser={user}
                                     currentUser={currentUser}
                                     type="suggestion"
                                     onAction={() => handleSuggestionAction(user.id)}
                                     actionText={sentRequests[user.id] ? "Request Sent" : "Add Friend"}
                                 />
                             ))}
                         </div>
                     </div>
                 )}
            </div>
        )
    };

    return (
        <div className="fixed inset-0 z-[60] bg-background" role="dialog" aria-modal="true">
            <div className="h-full w-full bg-surface dark:bg-[#424242] flex flex-col">
                <div className="p-4 border-b border-divider flex-shrink-0">
                    <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                        <button type="button" onClick={onClose} className="p-2">
                            <XIcon className="w-6 h-6"/>
                        </button>
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-secondary" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search ConnectSphere"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full bg-background dark:bg-[#303030] rounded-md py-2 pl-10 pr-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                    </form>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;