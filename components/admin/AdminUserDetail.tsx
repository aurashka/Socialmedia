import React, { useState, useEffect, useMemo } from 'react';
import type { User, Post, Conversation } from '../../types';
import { fetchUserConversations, deleteUserConversations, banUser, unbanUser, setUserBadge } from '../../services/firebase';
import { ChevronLeftIcon, TrashIcon } from '../Icons';
import PostCard from '../PostCard';

interface AdminUserDetailProps {
    userId: string;
    users: Record<string, User>;
    posts: Post[];
}

type Tab = 'profile' | 'posts' | 'friends' | 'chats' | 'actions';

const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ userId, users, posts }) => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [userConversations, setUserConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [badgeUrl, setBadgeUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const user = users[userId];

    useEffect(() => {
        if (user) {
            setBadgeUrl(user.badgeUrl || '');
        }
    }, [user]);

    useEffect(() => {
        setLoading(true);
        fetchUserConversations(userId)
            .then(setUserConversations)
            .finally(() => setLoading(false));
    }, [userId]);

    const userPosts = useMemo(() => posts.filter(p => p.userId === userId).sort((a,b) => b.timestamp - a.timestamp), [posts, userId]);
    const userFriends = useMemo(() => user?.friends ? Object.keys(user.friends).map(id => users[id]).filter(Boolean) : [], [user?.friends, users]);

    const handleSetBadge = async () => {
        setStatus('saving');
        try {
            await setUserBadge(user.id, badgeUrl.trim() || null);
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            setStatus('error');
        }
    };
    
    const handleToggleBan = async () => {
        const action = user.isBanned ? 'unban' : 'ban';
        if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            setLoading(true);
            try {
                if (user.isBanned) {
                    await unbanUser(user.id);
                } else {
                    await banUser(user.id);
                }
            } catch(e) {
                alert(`Failed to ${action} user.`);
            } finally {
                setLoading(false);
            }
        }
    };
    
    const handleClearChats = async () => {
        if (window.confirm(`Are you sure you want to DELETE ALL conversations for ${user.name}? This action is irreversible.`)) {
            setLoading(true);
            try {
                await deleteUserConversations(user.id);
                setUserConversations([]);
                alert("Conversations cleared.");
            } catch(e) {
                 alert("Failed to clear conversations.");
            } finally {
                setLoading(false);
            }
        }
    }

    if (!user) return <div className="p-8 text-center">Loading user data...</div>;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'profile':
                return <div className="p-4 space-y-2">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Handle:</strong> @{user.handle}</p>
                    <p><strong>Bio:</strong> {user.bio}</p>
                    <p><strong>Friends:</strong> {userFriends.length}</p>
                    <p><strong>Posts:</strong> {userPosts.length}</p>
                </div>;
            case 'posts':
                return <div className="space-y-4 p-4">{userPosts.map(post => <PostCard key={post.id} post={post} user={user} currentUser={user} users={users} onOpenCommentSheet={() => {}}/>)}</div>;
            case 'friends':
                return <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">{userFriends.map(friend => <div key={friend.id} className="p-2 border rounded flex items-center gap-2"><img src={friend.avatarUrl} className="w-8 h-8 rounded-full" /><span>{friend.name}</span></div>)}</div>;
            case 'chats':
                return <div className="p-4 space-y-2">{userConversations.map(c => {
                    const otherId = Object.keys(c.participants).find(id => id !== userId);
                    const otherUser = otherId ? users[otherId] : null;
                    return <div key={c.id} className="p-2 border rounded">Chat with {otherUser?.name || 'Deleted User'}</div>
                })}</div>;
            case 'actions':
                return <div className="p-4 space-y-6">
                    <ActionSection title="Ban Status">
                        <p className="mb-2">This user is currently {user.isBanned ? <span className="font-bold text-red-500">Banned</span> : <span className="font-bold text-green-500">Active</span>}.</p>
                        <button onClick={handleToggleBan} disabled={loading} className={`px-4 py-2 text-white font-semibold rounded-md ${user.isBanned ? 'bg-green-500' : 'bg-red-500'}`}>{user.isBanned ? 'Unban' : 'Ban'} User</button>
                    </ActionSection>
                    <ActionSection title="Manage Badge">
                        <input type="text" value={badgeUrl} onChange={e => setBadgeUrl(e.target.value)} placeholder="Image URL for badge" className="w-full p-2 border rounded bg-background dark:bg-gray-800 mb-2" />
                        <button onClick={handleSetBadge} disabled={status === 'saving'} className="px-4 py-2 bg-accent text-white font-semibold rounded-md">{status === 'saving' ? 'Saving...' : 'Set Badge'}</button>
                    </ActionSection>
                    <ActionSection title="Clear Conversations">
                         <button onClick={handleClearChats} disabled={loading} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md flex items-center gap-2"><TrashIcon className="w-5 h-5"/> Delete All Chats</button>
                    </ActionSection>
                </div>;
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-divider dark:border-gray-700 flex-shrink-0">
                <a href="#/admin" className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline mb-2">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to User List
                </a>
                <div className="flex items-center gap-4">
                    <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full" />
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-secondary dark:text-gray-400">@{user.handle}</p>
                    </div>
                </div>
            </div>
            <div className="border-b border-divider dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center">
                    <TabButton label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    <TabButton label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <TabButton label="Friends" active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} />
                    <TabButton label="Chats" active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} />
                    <TabButton label="Actions" active={activeTab === 'actions'} onClick={() => setActiveTab('actions')} />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto bg-background dark:bg-gray-900">
                {renderTabContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, active: boolean, onClick: () => void}> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 font-semibold text-sm border-b-2 ${active ? 'border-accent text-accent' : 'border-transparent text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
        {label}
    </button>
);

const ActionSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-bold border-b pb-2 mb-3">{title}</h3>
        {children}
    </div>
);


export default AdminUserDetail;
