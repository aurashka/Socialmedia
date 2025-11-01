import React from 'react';

// Regex to match @mentions, #hashtags, and URLs
const tokenRegex = /(#\w+)|(@\w+)|(https?:\/\/[^\s]+)/g;

export const parseContent = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts = text.split(tokenRegex).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.substring(1);
      return <a key={index} href={`#/search/${encodeURIComponent(tag)}`} className="text-primary hover:underline">{part}</a>;
    }
    if (part.startsWith('@')) {
       // In a real app, you'd look up the user handle and link to their profile ID
      return <a key={index} href={`#/search/${encodeURIComponent(part)}`} className="text-primary font-semibold hover:underline">{part}</a>;
    }
    if (part.startsWith('http')) {
      return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{part}</a>;
    }
    // Return plain text for non-matching parts
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};
