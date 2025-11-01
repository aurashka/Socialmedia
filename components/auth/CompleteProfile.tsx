import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../../types';
import { isHandleUnique, updateUserProfile } from '../../services/firebase';
import { useDebounce } from '../../hooks/useDebounce';

interface CompleteProfileProps {
  user: User;
}

const CompleteProfile: React.FC<CompleteProfileProps> = ({ user }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const debouncedHandle = useDebounce(handle, 500);

  const checkHandle = useCallback(async (h: string) => {
    if (!h || h.length < 3) {
      setHandleStatus('idle');
      return;
    }
    setHandleStatus('checking');
    const isUnique = await isHandleUnique(h);
    setHandleStatus(isUnique ? 'available' : 'taken');
  }, []);

  useEffect(() => {
    checkHandle(debouncedHandle);
  }, [debouncedHandle, checkHandle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (handleStatus !== 'available') {
        setError('Please choose an available handle.');
        return;
    }
    if(name.trim().length < 2) {
        setError('Please enter a valid name.');
        return;
    }

    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        name,
        handle,
      });
      // The state in App.tsx will update via the onValue listener,
      // which will cause a re-render and show the main app.
      // We can force a reload if needed, but it's usually not necessary.
      window.location.reload(); 
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getHandleMessage = () => {
    switch(handleStatus) {
      case 'checking': return 'Checking availability...';
      case 'available': return <span className="text-green-500">@{handle} is available!</span>;
      case 'taken': return <span className="text-red-500">@{handle} is already taken.</span>;
      default: return 'Your unique username.';
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">One Last Step</h1>
            <p className="text-text-secondary mt-2">Complete your profile to join ConnectSphere.</p>
          </div>
          {error && <p className="mb-4 text-red-500 bg-red-100 p-2 rounded-md text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-bold mb-2 text-text-secondary">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="mb-6">
                <label htmlFor="handle" className="block text-sm font-bold mb-2 text-text-secondary">Unique Handle</label>
                <div className="flex items-center border rounded-md bg-background focus-within:ring-2 focus-within:ring-primary">
                    <span className="pl-3 text-text-secondary">@</span>
                    <input
                        id="handle"
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="your_handle"
                        className="w-full p-3 bg-transparent focus:outline-none"
                        required
                        minLength={3}
                    />
                </div>
                <p className="text-xs text-text-secondary mt-1 h-4">{getHandleMessage()}</p>
            </div>
            <button
              type="submit"
              disabled={loading || handleStatus !== 'available'}
              className="w-full bg-primary text-white p-3 rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
