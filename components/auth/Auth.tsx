import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row w-full max-w-sm lg:max-w-4xl bg-card rounded-xl mx-auto shadow-lg overflow-hidden">
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-12 bg-no-repeat bg-cover bg-center bg-primary text-white">
            <h1 className="text-5xl font-bold mb-3">ConnectSphere</h1>
            <p className="text-center">Connect with friends and the world around you on ConnectSphere.</p>
          </div>
          <div className="w-full lg:w-1/2 py-12 px-8 sm:px-12">
            {isLoginView ? (
              <Login onSwitchToRegister={() => setIsLoginView(false)} />
            ) : (
              <Register onSwitchToLogin={() => setIsLoginView(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;