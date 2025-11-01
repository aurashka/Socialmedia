import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

const Login: React.FC = () => {
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
      // Provide a user-friendly error message similar to Instagram
      setError('Sorry, your password was incorrect. Please double-check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl text-text-primary mb-8" style={{ fontFamily: "'Cookie', cursive" }}>ConnectSphere</h1>
      
      <form onSubmit={handleLogin} className="w-full space-y-2">
          <input
            type="email"
            aria-label="Email address"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 text-text-secondary focus:outline-none focus:border-gray-400 text-sm"
            required
            autoCapitalize="off"
            autoCorrect="off"
          />
          <input
            type="password"
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 text-text-secondary focus:outline-none focus:border-gray-400 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-primary text-white p-2 mt-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center text-sm">{error}</p>}
      
      <a href="#" className="text-xs text-primary hover:underline mt-8">
          Forgot password?
      </a>
    </div>
  );
};

export default Login;
