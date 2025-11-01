import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, updateUserProfile } from '../../services/firebase';

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
      <h2 className="text-3xl mb-4 font-bold text-text-primary">Sign Up</h2>
      <p className="mb-4 text-text-secondary">
        Create an account to start connecting.
      </p>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
