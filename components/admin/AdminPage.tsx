import React from 'react';
import type { User } from '../../types';
import UserEditorRow from './UserEditorRow';

interface AdminPageProps {
    users: Record<string, User>;
}

const AdminPage: React.FC<AdminPageProps> = ({ users }) => {
    // FIX: Cast `Object.values(users)` to `User[]` to ensure correct type inference for `sort` and `map`.
    const usersArray = (Object.values(users) as User[]).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-primary">Admin Panel: User Management</h1>
            <div className="bg-surface rounded-lg shadow-sm border border-divider overflow-hidden">
                <div className="divide-y divide-divider">
                    {usersArray.map(user => (
                        <UserEditorRow key={user.id} user={user} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;