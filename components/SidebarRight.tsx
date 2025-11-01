import React from 'react';
import type { User } from '../types';

interface SidebarRightProps {
  users: Record<string, User>;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ users }) => {
  // Fix: Explicitly type `u` as `User` to help TypeScript infer the correct type for `suggestedFriends`.
  const suggestedFriends = Object.values(users).filter((u: User) => u.id !== 'user1').slice(0, 4);

  return (
    <aside className="hidden xl:block fixed top-14 right-0 w-72 h-[calc(100vh-56px)] bg-background p-4 overflow-y-auto">
      <div className="bg-card p-3 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-text-primary">Suggested Friends</h3>
          <a href="#" className="text-sm text-primary hover:underline">See All</a>
        </div>
        <ul>
          {/* Fix: Explicitly type `user` as `User` to correct type inference issues. */}
          {suggestedFriends.map((user: User) => (
            <li key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
              <span className="font-semibold text-sm">{user.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <footer className="text-xs text-text-secondary mt-4 space-y-2">
        <div className="flex flex-wrap gap-x-2">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Contact Us</a>
            <a href="#" className="hover:underline">Directory</a>
        </div>
        <p>&copy; 2025 ConnectSphere</p>
      </footer>
    </aside>
  );
};

export default SidebarRight;