
import React from 'react';
import type { User } from '../types';
import { HomeIcon, UsersIcon, ChatIcon, BellIcon, MenuIcon } from './Icons'; // Assuming more icons will be here

interface SidebarLeftProps {
  currentUser: User;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ currentUser }) => {
  return (
    <aside className="hidden md:block fixed top-14 left-0 w-72 h-[calc(100vh-56px)] bg-background p-4 overflow-y-auto">
      <nav>
        <ul>
          <SidebarLink icon={<img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full" />} text={currentUser.name} />
          <SidebarLink icon={<HomeIcon className="w-8 h-8 text-primary" />} text="News Feed" active />
          <SidebarLink icon={<UsersIcon className="w-8 h-8 text-blue-500" />} text="Mine" />
          <SidebarLink icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>} text="Saved" />
          <SidebarLink icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6z" /></svg>} text="Memories" />
        </ul>
        <hr className="my-4" />
        <h3 className="text-text-secondary font-semibold uppercase text-sm mb-2">ADVERTISING</h3>
        <ul>
          <SidebarLink icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l3 3a1 1 0 001.414-1.414L10.414 13H15a1 1 0 001-1V6.414l1.293 1.293a1 1 0 001.414-1.414l-7-7z" /></svg>} text="Ads Manager" />
          <SidebarLink icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2H4z" clipRule="evenodd" /></svg>} text="Wallet" />
        </ul>
         <hr className="my-4" />
        <h3 className="text-text-secondary font-semibold uppercase text-sm mb-2">EXPLORE</h3>
        <ul>
            <SidebarLink icon={<UsersIcon className="h-8 w-8 text-cyan-500"/>} text="People" />
            <SidebarLink icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>} text="Pages" />
        </ul>
      </nav>
    </aside>
  );
};

interface SidebarLinkProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, text, active }) => (
  <li className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${active ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
    {icon}
    <span className="font-semibold text-text-primary">{text}</span>
  </li>
);

export default SidebarLeft;
