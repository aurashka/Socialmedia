import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

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
    } catch (err: any) {
      setError('Sorry, your password was incorrect. Please double-check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl text-primary dark:text-gray-100 mb-6" style={{ fontFamily: "'Cookie', cursive" }}>ConnectSphere</h1>
      
      <form onSubmit={handleLogin} className="w-full space-y-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-background dark:bg-[#262626] text-primary dark:text-gray-100 focus:outline-none focus:border-secondary dark:focus:border-accent text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-background dark:bg-[#262626] text-primary dark:text-gray-100 focus:outline-none focus:border-secondary dark:focus:border-accent text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-primary dark:bg-accent text-white p-2 mt-4 rounded-lg font-semibold hover:bg-black dark:hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center text-sm">{error}</p>}
      
      <p className="text-sm mt-6 text-secondary dark:text-gray-400">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="font-semibold text-accent hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;