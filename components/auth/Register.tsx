import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, updateUserProfile } from '../../services/firebase';
import { MailIcon, LockClosedIcon } from '../Icons';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a basic profile in Realtime Database
      await updateUserProfile(user.uid, {
        email: user.email!,
        phone: phone,
        role: 'user',
        avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
      });
      // The onAuthChange listener in App.tsx will redirect to CompleteProfile.
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl mb-2 font-bold text-text-primary text-center">Create your Account</h2>
      <p className="mb-6 text-text-secondary text-center">
        Sign up to start connecting with friends.
      </p>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="relative mb-4">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="h-5 w-5 text-gray-400" />
            </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 pl-10 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pl-10 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white p-3 rounded-md font-bold hover:bg-green-600 disabled:bg-green-300 transition-colors"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-text-secondary">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;