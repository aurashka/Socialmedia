import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { MailIcon, LockClosedIcon } from '../Icons';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthChange listener in App.tsx will handle the redirect.
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl mb-2 font-bold text-text-primary text-center">Login to your Account</h2>
      <p className="mb-6 text-text-secondary text-center">
        Welcome back! Please enter your details.
      </p>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-3 rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-text-secondary">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-primary font-bold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;