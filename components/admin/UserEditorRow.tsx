import React, { useState } from 'react';
import type { User } from '../../types';
import { setUserBadge } from '../../services/firebase';

interface UserEditorRowProps {
    user: User;
}

const UserEditorRow: React.FC<UserEditorRowProps> = ({ user }) => {
    const [badgeUrl, setBadgeUrl] = useState(user.badgeUrl || '');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleSave = async () => {
        setStatus('saving');
        try {
            await setUserBadge(user.id, badgeUrl.trim() || null);
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to set badge:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };
    
    const handleRemove = async () => {
        setStatus('saving');
        try {
            await setUserBadge(user.id, null);
            setBadgeUrl('');
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to remove badge:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    }

    const getButtonText = () => {
        switch (status) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved!';
            case 'error': return 'Error!';
            default: return 'Save';
        }
    }

    return (
        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-grow">
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary">{user.name}</p>
                      {user.badgeUrl && <img src={user.badgeUrl} alt="badge" className="w-5 h-5 object-contain" title={`Current Badge: ${user.badgeUrl}`} />}
                    </div>
                    <p className="text-sm text-secondary">{user.email}</p>
                </div>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                    type="text"
                    value={badgeUrl}
                    onChange={(e) => setBadgeUrl(e.target.value)}
                    placeholder="Badge Image URL"
                    className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:border-secondary text-sm flex-grow"
                />
                <div className="flex items-center gap-2">
                  <button
                      onClick={handleSave}
                      disabled={status === 'saving'}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto
                          ${status === 'saved' ? 'bg-green-500 text-white' : ''}
                          ${status === 'error' ? 'bg-red-500 text-white' : ''}
                          ${status === 'idle' ? 'bg-primary text-white hover:bg-black' : ''}
                          ${status === 'saving' ? 'bg-gray-400 text-white cursor-not-allowed' : ''}
                      `}
                  >
                      {getButtonText()}
                  </button>
                  {user.badgeUrl && (
                    <button
                        onClick={handleRemove}
                        disabled={status === 'saving'}
                        className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-gray-200 text-primary hover:bg-gray-300 disabled:opacity-50 w-full sm:w-auto"
                    >
                        Remove
                    </button>
                  )}
                </div>
            </div>
        </div>
    );
};

export default UserEditorRow;
