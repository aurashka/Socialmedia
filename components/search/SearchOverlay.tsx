import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import { SearchIcon, XIcon } from '../Icons';

interface SearchOverlayProps {
  users: Record<string, User>;
  currentUser: User;
  onClose: () => void;
}

const getScore = (text: string, query: string): number => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (lowerText.startsWith(lowerQuery)) return 5;
    if (lowerText.includes(lowerQuery)) return 2;
    return 0;
};

const SearchOverlay: React.FC<SearchOverlayProps> = ({ users, currentUser, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('People');

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return [];

    return (Object.values(users) as User[])
      .filter(user => user && user.id !== currentUser.id && user.isPublic && user.name && user.handle)
      .map(user => {
        const nameScore = getScore(user.name!, query);
        const handleScore = getScore(user.handle!, query);
        const totalScore = Math.max(nameScore, handleScore);
        return { ...user, score: totalScore };
      })
      .filter(user => user.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query, users, currentUser.id]);

  const filters = ['All', 'People', 'Posts', 'Photos', 'Videos', 'Pages', 'Groups'];

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col">
      <header className="flex-shrink-0 bg-card shadow-md h-14 flex items-center px-4 space-x-4">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close search">
          <XIcon className="w-6 h-6 text-text-secondary" />
        </button>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ConnectSphere"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-background rounded-full py-2 pl-10 pr-4 focus:outline-none w-full"
            autoFocus
          />
        </div>
      </header>
      
      <div className="flex-1 flex">
        <aside className="w-80 h-full bg-card border-r p-4 hidden md:block">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <ul>
                {filters.map(filter => (
                     <li key={filter}>
                        <button 
                            onClick={() => setActiveFilter(filter)}
                            className={`w-full text-left p-2 rounded-md font-semibold ${activeFilter === filter ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100'}`}
                        >
                            {filter}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
        
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {query.trim().length < 2 ? (
                <div className="text-center text-text-secondary mt-20">
                    <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Find people, posts, and more.</p>
                </div>
            ) : (
                <>
                    {activeFilter === 'People' || activeFilter === 'All' ? (
                        <div>
                            <h3 className="text-lg font-bold mb-3">People</h3>
                            {searchResults.length > 0 ? (
                                <div className="space-y-3">
                                    {searchResults.map(user => (
                                        <a key={user.id} href={`#/profile/${user.id}`} onClick={onClose} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <p className="font-bold">{user.name}</p>
                                                <p className="text-sm text-text-secondary">@{user.handle}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary">No people found matching "{query}".</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-text-secondary mt-20">
                            <p>Search results for '{activeFilter}' are not implemented yet.</p>
                        </div>
                    )}
                </>
            )}
        </main>
      </div>
    </div>
  );
};

export default SearchOverlay;
