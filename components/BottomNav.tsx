
import React from 'react';
import { HomeIcon, SearchIcon, PlusSquareIcon, HeartIcon } from './Icons';

interface BottomNavProps {
    onPostClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onPostClick }) => {
  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-sm shadow-xl h-16 z-50 flex items-center justify-around rounded-full border border-divider w-[90%] max-w-sm">
      <BottomNavItem Icon={HomeIcon} href="/#" active />
      <BottomNavItem Icon={SearchIcon} href="#/friends" />
      <BottomNavItem Icon={PlusSquareIcon} onClick={onPostClick} />
      <BottomNavItem Icon={HeartIcon} />
      <BottomNavItem isProfile href="#/profile" />
    </nav>
  );
};

interface BottomNavItemProps {
  Icon?: React.ElementType;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  isProfile?: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ Icon, active, href, onClick, isProfile }) => {
    const content = (
        <div className="relative flex-1 flex justify-center items-center h-full cursor-pointer">
            {Icon && <Icon className={`w-7 h-7 ${active ? 'text-primary' : 'text-secondary'}`} strokeWidth={active ? 2.5 : 2} />}
            {isProfile && (
                <img src="https://i.pravatar.cc/150" className="w-8 h-8 rounded-full border-2 border-primary" />
            )}
        </div>
    );

    if (href) {
        return <a href={href} className="flex-1 h-full">{content}</a>;
    }
    return <button onClick={onClick} className="flex-1 h-full">{content}</button>
};

export default BottomNav;