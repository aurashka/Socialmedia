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

      <button className="w-full bg-primary text-white p-2 rounded-lg font-semibold hover:bg-blue-700 text-sm flex items-center justify-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24h11.494v-9.294H9.692v-3.622h3.126V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.142v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.324V1.324C24 .593 23.407 0 22.676 0z"></path></svg>
          Log in with Facebook
      </button>

      <div className="flex items-center my-4 w-full">
        <div className="flex-grow border-t border-divider"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-text-secondary uppercase">OR</span>
        <div className="flex-grow border-t border-divider"></div>
      </div>

      <form onSubmit={handleRegister} className="w-full space-y-2">
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