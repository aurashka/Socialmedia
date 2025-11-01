import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import UserEditorRow from './UserEditorRow';
import { SearchIcon } from '../Icons';
import AdminSettings from './AdminSettings';

interface AdminPageProps {
    users: Record<string, User>;
    onlineStatuses: Record<string, any>;
}

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 font-medium text-sm rounded-md ${
            active
                ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-gray-100'
                : 'text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
    >
        {label}
    </button>
);


const AdminPage: React.FC<AdminPageProps> = ({ users, onlineStatuses }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'banned' | 'verified' | 'admin'>('all');

    const filteredUsers = useMemo(() => {
        let usersArray = (Object.values(users) as User[]).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            usersArray = usersArray.filter(u => 
                u.name?.toLowerCase().includes(lowerQuery) ||
                u.email?.toLowerCase().includes(lowerQuery) ||
                u.handle?.toLowerCase().includes(lowerQuery)
            );
        }

        if (statusFilter !== 'all') {
            usersArray = usersArray.filter(u => {
                const isOnline = onlineStatuses[u.id]?.state === 'online';
                return statusFilter === 'online' ? isOnline : !isOnline;
            });
        }
        
        if (typeFilter === 'banned') {
            usersArray = usersArray.filter(u => u.isBanned);
        } else if (typeFilter === 'verified') {
            usersArray = usersArray.filter(u => u.badgeUrl);
        } else if (typeFilter === 'admin') {
            usersArray = usersArray.filter(u => u.role === 'admin');
        }
        
        return usersArray;
    }, [users, searchQuery, statusFilter, typeFilter, onlineStatuses]);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col h-full">
            <h1 className="text-3xl font-bold mb-6 text-primary dark:text-gray-100 flex-shrink-0">Admin Panel</h1>
            
            <div className="flex space-x-4 border-b border-divider dark:border-gray-700 mb-4">
                <TabButton label="User Management" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabButton label="API Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>

            {activeTab === 'users' ? (
                 <>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-shrink-0">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-secondary dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or @handle..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-divider dark:border-gray-700 rounded-md bg-surface dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border border-divider dark:border-gray-700 rounded-md bg-surface dark:bg-gray-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent">
                                <option value="all">All Statuses</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="border border-divider dark:border-gray-700 rounded-md bg-surface dark:bg-gray-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent">
                                <option value="all">All Types</option>
                                <option value="verified">Verified</option>
                                <option value="banned">Banned</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-surface dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-divider dark:border-gray-700 flex-grow overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            <div className="divide-y divide-divider dark:divide-gray-700">
                                {filteredUsers.map(user => (
                                    <UserEditorRow key={user.id} user={user} isOnline={onlineStatuses[user.id]?.state === 'online'} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-secondary dark:text-gray-400">
                                <p>No users match the current filters.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-surface dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-divider dark:border-gray-700 flex-grow overflow-y-auto">
                    <AdminSettings />
                </div>
            )}
        </div>
    );
};

export default AdminPage;