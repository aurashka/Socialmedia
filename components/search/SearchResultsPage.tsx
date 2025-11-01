import React, { useMemo } from 'react';
import type { User } from '../../types';
import { SearchIcon } from '../Icons';

interface SearchResultsPageProps {
  query: string;
  users: Record<string, User>;
}

// Simple scoring function for fuzzy search
const getScore = (text: string, query: string): number => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (lowerText === lowerQuery) return 10;
    if (lowerText.startsWith(lowerQuery)) return 5;
    if (lowerText.includes(lowerQuery)) return 2;
    
    // Character-by-character match score
    let score = 0;
    let queryIndex = 0;
    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
        if (lowerText[i] === lowerQuery[queryIndex]) {
            score += 1;
            queryIndex++;
        }
    }
    return score / lowerText.length;
};


const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, users }) => {
  const searchResults = useMemo(() => {
    if (!query) return [];
    
    // FIX: Add type assertion to User[] to fix type inference issues, and add a null/undefined check for safety.
    return (Object.values(users) as User[])
      .filter(user => user && user.isPublic && user.name && user.handle)
      .map(user => {
        const nameScore = getScore(user.name!, query);
        const handleScore = getScore(user.handle!, query);
        const emailScore = getScore(user.email, query);
        const totalScore = Math.max(nameScore, handleScore, emailScore);
        return { ...user, score: totalScore };
      })
      .filter(user => user.score > 1) // Threshold for a match
      .sort((a, b) => b.score - a.score);
  }, [query, users]);

  return (
    <div className="p-2 sm:p-4 pb-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm p-4">
             <h1 className="text-xl font-bold">Search results for "{query}"</h1>
             <p className="text-sm text-text-secondary">{searchResults.length} result(s) found</p>
        </div>

        {searchResults.length > 0 ? (
            <div className="bg-card rounded-lg shadow-sm p-4 space-y-3">
                {searchResults.map(user => (
                    <a key={user.id} href={`#/profile/${user.id}`} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100">
                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-sm text-text-secondary">@{user.handle}</p>
                        </div>
                    </a>
                ))}
            </div>
        ) : (
             <div className="bg-card rounded-lg shadow-sm p-8 text-center text-text-secondary">
                <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="font-bold text-lg">No results found</h2>
                <p>We couldn't find any public profiles matching your search.</p>
            </div>
        )}
    </div>
  );
};

export default SearchResultsPage;