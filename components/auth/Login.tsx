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
      <h1 className="text-4xl text-primary mb-6" style={{ fontFamily: "'Cookie', cursive" }}>ConnectSphere</h1>
      
      <form onSubmit={handleLogin} className="w-full space-y-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-primary focus:outline-none focus:border-secondary text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background text-primary focus:outline-none focus:border-secondary text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-primary text-white p-2 mt-4 rounded-lg font-semibold hover:bg-black disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center text-sm">{error}</p>}
      
      <p className="text-sm mt-6 text-secondary">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="font-semibold text-accent hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;