import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth: React.FC = () => {
  const [view, setView] = useState<'splash' | 'login' | 'register'>('splash');

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login onSwitchToRegister={() => setView('register')} />;
      case 'register':
        return <Register onSwitchToLogin={() => setView('login')} />;
      case 'splash':
      default:
        return (
          <div className="relative h-full w-full flex flex-col justify-between p-8 text-white">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold">ConnectSphere</h1>
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl font-bold leading-tight">Join Socials<br/>Network for<br/>Amplify in your<br/>life.</h2>
              <button 
                onClick={() => setView('login')}
                className="mt-8 bg-white/30 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-lg w-full max-w-xs hover:bg-white/40 transition-colors"
              >
                Lets Started &gt;&gt;&gt;
              </button>
            </div>
          </div>
        );
    }
  };

  if (view === 'splash') {
    return (
       <div 
        className="min-h-screen bg-cover bg-center" 
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=80')"}}>
          {renderView()}
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#303030] flex items-center justify-center p-4">
      <main className="w-full max-w-sm">
        <div className="bg-surface dark:bg-[#424242] border border-divider dark:border-gray-700 rounded-lg p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Auth;