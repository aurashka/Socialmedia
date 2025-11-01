import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-3">ConnectSphere</h1>
          <p className="text-xl text-text-secondary max-w-md">
            Share your memories, connect with others, and make new friends.
          </p>
      </div>
      <div className="w-full max-w-md bg-card rounded-xl mx-auto shadow-lg overflow-hidden p-8">
        {isLoginView ? (
          <Login onSwitchToRegister={() => setIsLoginView(false)} />
        ) : (
          <Register onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;