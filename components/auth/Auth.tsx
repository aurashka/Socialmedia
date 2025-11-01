import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <main className="w-full max-w-sm">
        <div className="bg-card border border-divider rounded-lg p-8 sm:p-10 mb-4">
          {isLoginView ? <Login /> : <Register />}
        </div>
        <div className="bg-card border border-divider rounded-lg p-5 text-center">
          {isLoginView ? (
            <p className="text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => setIsLoginView(false)}
                className="font-semibold text-primary hover:underline focus:outline-none"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm">
              Have an account?{' '}
              <button
                onClick={() => setIsLoginView(true)}
                className="font-semibold text-primary hover:underline focus:outline-none"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Auth;
