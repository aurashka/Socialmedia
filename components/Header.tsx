import React, { useState, useEffect, useRef } from 'react';
import type { User, Community, Channel } from '../types';
import { SearchIcon, MessageIcon, HeartIcon } from './Icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import SearchOverlay from './search/SearchOverlay';

interface HeaderProps {
  currentUser: User;
  friendRequestCount: number;
  users: Record<string, User>;
  friendRequests: Record<string, any>;
  communities: Record<string, Community>;
  channels: Record<string, Channel>;
}

const Header: React.FC<HeaderProps> = ({ currentUser, friendRequestCount, users, friendRequests, communities, channels }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
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
    <>
      <header className="fixed top-0 left-0 right-0 bg-surface dark:bg-gray-900 border-b border-divider dark:border-gray-700 h-14 z-50">
        <div className="flex items-center justify-between px-4 h-full max-w-5xl mx-auto">
          {/* Left Section */}
          <a href="/#" className="text-3xl text-primary dark:text-gray-100" style={{fontFamily: "'Cookie', cursive"}}>
            ConnectSphere
          </a>
          
          {/* Center Section - Desktop Search */}
          <div onClick={() => setIsSearchOpen(true)} className="relative hidden md:flex items-center bg-background dark:bg-gray-800 rounded-md h-9 w-64 cursor-text">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-secondary dark:text-gray-400" />
              </div>
              <span className="pl-10 text-secondary dark:text-gray-400 text-sm">Search</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
              <a href="#">
                <MessageIcon className="w-6 h-6 text-primary dark:text-gray-100"/>
              </a>
              <a href="#">
                <HeartIcon className="w-6 h-6 text-primary dark:text-gray-100"/>
              </a>
            <div className="relative" ref={menuRef}>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-divider dark:border-gray-700">
                  <a href={`#/profile/${currentUser.id}`} className="block px-4 py-2 text-sm text-primary dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </a>
                  {currentUser.role === 'admin' && (
                    <a href="#/admin" className="block px-4 py-2 text-sm text-primary dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                      Admin Panel
                    </a>
                  )}
                  <a href="#/settings" className="block px-4 py-2 text-sm text-primary dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Settings
                  </a>
                  <a href="#" onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-primary dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-divider dark:border-gray-600 mt-1 pt-2">
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {isSearchOpen && (
        <SearchOverlay 
            onClose={() => setIsSearchOpen(false)}
            currentUser={currentUser}
            users={users}
            friendRequests={friendRequests}
            communities={communities}
            channels={channels}
        />
      )}
    </>
  );
};

export default Header;