import React from 'react';
import type { User } from '../types';

const tokenRegex = /(@[a-z0-9_]+)|(#[a-z0-9_]+)|((?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*)/gi;

export const parseContent = (text: string, users: Record<string, User>): React.ReactNode[] => {
  if (!text) return [];

  const parts = text.split(tokenRegex).filter(Boolean);
  const usersByHandle = Object.values(users).reduce((acc, user) => {
    if (user.handle) {
      acc[user.handle.toLowerCase()] = user;
    }
    return acc;
  }, {} as Record<string, User>);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.substring(1);
      return <a key={index} href={`#/search/${encodeURIComponent(tag)}`} className="text-primary font-semibold hover:underline">{part}</a>;
    }
    if (part.startsWith('@')) {
      const handle = part.substring(1).toLowerCase();
      const user = usersByHandle[handle];
      if (user) {
        return <a key={index} href={`#/profile/${user.id}`} className="text-primary font-semibold hover:underline">{part}</a>;
      }
      return <span key={index} className="text-primary font-semibold">{part}</span>;
    }
    if (part.match(/^(https?:\/\/|www\.)/)) {
      const url = part.startsWith('www.') ? `http://${part}` : part;
      return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{part}</a>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};