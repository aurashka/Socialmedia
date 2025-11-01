import React from 'react';
import type { User } from '../../types';

interface UserEditorRowProps {
    user: User;
    isOnline: boolean;
}

const UserEditorRow: React.FC<UserEditorRowProps> = ({ user, isOnline }) => {
    return (
        <a 
            href={`#/admin/user/${user.id}`} 
            className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Manage user ${user.name}`}
        >
            <div className="flex items-center gap-4 flex-grow min-w-0">
                <div className="relative flex-shrink-0">
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                    {isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface dark:border-gray-900" title="Online"></div>}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary dark:text-gray-100 truncate">{user.name}</p>
                      {user.badgeUrl && <img src={user.badgeUrl} alt="badge" className="w-5 h-5 object-contain flex-shrink-0" title="Verified" />}
                    </div>
                    <p className="text-sm text-secondary dark:text-gray-400 truncate">{user.email}</p>
                    <p className="text-sm text-secondary dark:text-gray-400 truncate">@{user.handle}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                {user.isBanned && <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-full">BANNED</span>}
                {user.role === 'admin' && <span className="text-xs font-bold bg-accent text-white px-2 py-1 rounded-full">ADMIN</span>}
            </div>
        </a>
    );
};

export default UserEditorRow;
