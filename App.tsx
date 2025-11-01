import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, onAuthChange, getUserProfile } from './services/firebase';
import type { User, Post, Story } from './types';
import type { User as FirebaseUser } from 'firebase/auth';
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import MainContent from './components/MainContent';
import SidebarRight from './components/SidebarRight';
import BottomNav from './components/BottomNav';
import Auth from './components/auth/Auth';
import CompleteProfile from './components/auth/CompleteProfile';
import LoadingSpinner from './components/LoadingSpinner';
import ProfilePage from './components/profile/ProfilePage';
import SearchResultsPage from './components/search/SearchResultsPage';
import { signOut } from 'firebase/auth';
import { auth } from './services/firebase';

type Route = 
  | { name: 'home' }
  | { name: 'profile'; id?: string }
  | { name: 'search'; query: string };

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2);
    const [path, param] = hash.split('/');

    switch (path) {
        case 'profile':
            return { name: 'profile', id: param };
        case 'search':
            return { name: 'search', query: decodeURIComponent(param) };
        default:
            return { name: 'home' };
    }
};

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [friendRequests, setFriendRequests] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    // No need to seed here anymore, it's done on demand in firebase.ts if DB is empty
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setAuthUser(user);
        const userProfile = await getUserProfile(user.uid);
        if(userProfile?.isBanned) {
            alert("Your account has been banned.");
            await signOut(auth);
            setAuthUser(null);
            setCurrentUser(null);
        } else if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          setCurrentUser({
            id: user.uid,
            email: user.email!,
            avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
            role: 'user',
          });
        }
      } else {
        setAuthUser(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!currentUser) return;

    const usersRef = ref(db, 'users/');
    const usersUnsub = onValue(usersRef, (snapshot) => setUsers(snapshot.val() || {}));

    const postsRef = ref(db, 'posts/');
    const postsUnsub = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val() || {};
      const postsArray = Object.values(postsData) as Post[];
      setPosts(postsArray.sort((a, b) => b.timestamp - a.timestamp));
    });

    const storiesRef = ref(db, 'stories/');
    const storiesUnsub = onValue(storiesRef, (snapshot) => {
      const storiesData = snapshot.val() || {};
      setStories(Object.values(storiesData) as Story[]);
    });

    const requestsRef = ref(db, `friendRequests/${currentUser.id}`);
    const requestsUnsub = onValue(requestsRef, (snapshot) => {
        setFriendRequests(snapshot.val() || {});
    });
    
    return () => {
      usersUnsub();
      postsUnsub();
      storiesUnsub();
      requestsUnsub();
    }
  }, [currentUser]);
  
  const renderContent = () => {
      if (!currentUser) return null;

      switch(route.name) {
          case 'home':
              return <MainContent
                        currentUser={currentUser}
                        users={users}
                        posts={posts}
                        stories={stories}
                        loading={posts.length === 0}
                      />;
          case 'profile':
              return <ProfilePage
                        currentUser={currentUser}
                        profileUserId={route.id}
                        users={users}
                        posts={posts}
                        friendRequests={friendRequests}
                     />
          case 'search':
              return <SearchResultsPage
                        query={route.query}
                        users={users}
                     />
          default:
              return <div>Page not found</div>
      }
  }


  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authUser) {
    return <Auth />;
  }
  
  if (!currentUser?.handle || !currentUser?.name) {
    return <CompleteProfile user={currentUser!} />;
  }

  return (
    <div className="bg-background min-h-screen text-text-primary">
      <Header currentUser={currentUser} />
      <main className="flex pt-14">
        <SidebarLeft currentUser={currentUser} />
        <div className="w-full lg:w-[calc(100%-560px)] md:w-[calc(100%-280px)] md:mx-auto lg:ml-72 lg:mr-72 xl:mr-96 transition-all duration-300">
          {renderContent()}
        </div>
        <SidebarRight users={users} currentUser={currentUser}/>
      </main>
      <BottomNav />
    </div>
  );
};

export default App;