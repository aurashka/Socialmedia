
import React from 'react';
import type { User } from '../types';
import { HomeIcon, UsersIcon, ChatIcon, BellIcon, SearchIcon, MenuIcon } from './Icons';

interface HeaderProps {
  currentUser: User;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-card shadow-md h-14 z-50 flex items-center justify-between px-2 md:px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold text-primary hidden sm:block">ConnectSphere</h1>
        <div className="md:hidden">
            <MenuIcon className="w-8 h-8 text-text-secondary" />
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ConnectSphere"
            className="bg-background rounded-full py-2 pl-10 pr-4 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Center Section - Mobile/Tablet Nav */}
      <div className="flex-1 flex justify-center items-center space-x-2 sm:space-x-4 md:hidden">
        <HeaderIcon Icon={HomeIcon} active />
        <HeaderIcon Icon={UsersIcon} badge={1} />
        <HeaderIcon Icon={ChatIcon} />
        <HeaderIcon Icon={BellIcon} badge={2} />
        <HeaderIcon Icon={SearchIcon} />
      </div>
      
      {/* Center Section - Desktop Nav */}
      <div className="hidden md:flex flex-grow justify-center px-4">
        <div className="flex space-x-2">
          <DesktopNavIcon Icon={HomeIcon} active />
          <DesktopNavIcon Icon={UsersIcon} />
          <DesktopNavIcon Icon={ChatIcon} />
        </div>
      </div>


      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-2">
            <CircleButton Icon={ChatIcon} />
            <CircleButton Icon={BellIcon} />
        </div>
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full cursor-pointer"
        />
      </div>
    </header>
  );
};

interface HeaderIconProps {
    Icon: React.ElementType;
    badge?: number;
    active?: boolean;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({ Icon, badge, active }) => (
    <div className="relative p-2 rounded-lg cursor-pointer hover:bg-gray-100">
        <Icon className={`h-6 w-6 ${active ? 'text-primary' : 'text-text-secondary'}`} />
        {badge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{badge}</span>
        )}
    </div>
)

const DesktopNavIcon: React.FC<HeaderIconProps> = ({ Icon, active }) => (
    <div className={`cursor-pointer px-8 py-2 border-b-4 ${active ? 'border-primary' : 'border-transparent hover:bg-gray-100 rounded-lg'}`}>
         <Icon className={`h-7 w-7 ${active ? 'text-primary' : 'text-text-secondary'}`} />
    </div>
)

const CircleButton: React.FC<HeaderIconProps> = ({ Icon }) => (
    <button className="bg-gray-200 rounded-full p-2 hover:bg-gray-300">
        <Icon className="h-5 w-5 text-text-primary" />
    </button>
)

export default Header;
