
import React from 'react';
import { HomeIcon, UsersIcon, ChatIcon, BellIcon, MenuIcon } from './Icons';

const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card shadow-t-md h-14 z-50 flex items-center justify-around border-t">
      <BottomNavItem Icon={HomeIcon} active />
      <BottomNavItem Icon={UsersIcon} />
      <BottomNavItem Icon={ChatIcon} />
      <BottomNavItem Icon={BellIcon} badge={2} />
      <BottomNavItem Icon={MenuIcon} />
    </nav>
  );
};

interface BottomNavItemProps {
  Icon: React.ElementType;
  active?: boolean;
  badge?: number;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ Icon, active, badge }) => (
  <button className="relative flex-1 flex justify-center items-center h-full">
    <Icon className={`w-7 h-7 ${active ? 'text-primary' : 'text-text-secondary'}`} />
    {badge && (
      <span className="absolute top-2 right-1/4 transform translate-x-1/2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{badge}</span>
    )}
  </button>
);

export default BottomNav;
