import React from 'react';
import { HomeIcon, CompassIcon, PlusSquareIcon, MessageIcon } from './Icons';
import type { User } from '../types';

interface BottomNavProps {
    onPostClick: () => void;
    currentUser: User | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ onPostClick, currentUser }) => {
  if (!currentUser) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 dark:bg-[#212121]/80 backdrop-blur-sm shadow-xl h-16 z-50 flex items-center justify-around rounded-full border border-divider dark:border-gray-700 w-[90%] max-w-sm">
      <BottomNavItem Icon={HomeIcon} href="/#" active />
      <BottomNavItem Icon={CompassIcon} href="#/explore" />
      <BottomNavItem Icon={PlusSquareIcon} onClick={onPostClick} />
      <BottomNavItem Icon={MessageIcon} href="#/messages" />
      <BottomNavItem isProfile href={`#/profile/${currentUser.id}`} avatarUrl={currentUser.avatarUrl} />
    </nav>
  );
};

interface BottomNavItemProps {
  Icon?: React.ElementType;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  isProfile?: boolean;
  avatarUrl?: string;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ Icon, active, href, onClick, isProfile, avatarUrl }) => {
    const content = (
        <div className="relative flex-1 flex justify-center items-center h-full cursor-pointer">
            {Icon && <Icon className={`w-7 h-7 ${active ? 'text-primary dark:text-white' : 'text-secondary dark:text-gray-400'}`} strokeWidth={active ? 2.5 : 2} />}
            {isProfile && avatarUrl && (
                <img src={avatarUrl} className="w-8 h-8 rounded-full border-2 border-primary dark:border-white" />
            )}
        </div>
    );

    if (href) {
        return <a href={href} className="flex-1 h-full">{content}</a>;
    }
    return <button onClick={onClick} className="flex-1 h-full">{content}</button>
};

export default BottomNav;