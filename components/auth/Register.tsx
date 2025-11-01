import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, updateUserProfile } from '../../services/firebase';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      await updateUserProfile(user.uid, {
        email: user.email!,
        role: 'user',
        avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl text-primary mb-4" style={{ fontFamily: "'Cookie', cursive" }}>ConnectSphere</h1>
      <p className="text-md font-semibold text-secondary text-center mb-4">
        Sign up to see photos and videos from your friends.
      </p>

      <form onSubmit={handleRegister} className="w-full space-y-2 mt-4">
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
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500 text-center text-sm">{error}</p>}
      
      <p className="text-sm mt-6 text-secondary">
        Have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-accent hover:underline">
          Log in
        </button>
      </p>
    </div>
  );
};

export default Register;