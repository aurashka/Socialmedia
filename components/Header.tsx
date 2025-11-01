import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { SearchIcon, MessageIcon, HeartIcon } from './Icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

interface HeaderProps {
  currentUser: User;
  friendRequestCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentUser, friendRequestCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.hash = `#/search/${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-divider h-14 z-50">
      <div className="flex items-center justify-between px-4 h-full max-w-5xl mx-auto">
        {/* Left Section */}
        <a href="/#" className="text-3xl text-primary" style={{fontFamily: "'Cookie', cursive"}}>
          ConnectSphere
        </a>
        
        {/* Center Section - Desktop Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-secondary" />
            </div>
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background rounded-md py-1.5 pl-10 pr-4 w-64 text-primary focus:outline-none"
            />
        </form>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
            <a href="#">
              <MessageIcon className="w-6 h-6 text-primary"/>
            </a>
            <a href="#">
              <HeartIcon className="w-6 h-6 text-primary"/>
            </a>
          <div className="relative" ref={menuRef}>
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-50 border border-divider">
                <a href={`#/profile/${currentUser.id}`} className="block px-4 py-2 text-sm text-primary hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </a>
                {currentUser.role === 'admin' && (
                  <a href="#" className="block px-4 py-2 text-sm text-primary hover:bg-gray-100">
                    Admin Panel
                  </a>
                )}
                <a href="#" onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-100 border-t mt-1 pt-2">
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;