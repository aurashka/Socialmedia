import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, updateUserProfile } from '../../services/firebase';

const Register: React.FC = () => {
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
    <div className="flex flex-col items-center">
      <h1 className="text-5xl text-text-primary mb-4" style={{ fontFamily: "'Cookie', cursive" }}>ConnectSphere</h1>
      <p className="text-md font-semibold text-text-secondary text-center mb-4">
        Sign up to see photos and videos from your friends.
      </p>

      <form onSubmit={handleRegister} className="w-full space-y-2 mt-4">
        <input
          type="email"
          aria-label="Email address"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-gray-50 text-text-secondary focus:outline-none focus:border-gray-400 text-sm"
          required
        />
        <input
          type="tel"
          aria-label="Phone Number"
          placeholder="Phone Number (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-gray-50 text-text-secondary focus:outline-none focus:border-gray-400 text-sm"
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

        <p className="text-xs text-text-secondary text-center py-2">
            By signing up, you agree to our <a href="#" className="font-semibold text-text-primary hover:underline">Terms</a> & <a href="#" className="font-semibold text-text-primary hover:underline">Privacy Policy</a>.
        </p>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-primary text-white p-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500 text-center text-sm">{error}</p>}
    </div>
  );
};

export default Register;
