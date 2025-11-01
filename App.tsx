
import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, seedDatabase, onAuthChange, getUserProfile } from './services/firebase';
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

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDatabase();

    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setAuthUser(user);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          // This is a new user who needs to complete their profile
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

    // Fetch all data once we have a logged-in user
    const usersRef = ref(db, 'users/');
    const usersUnsub = onValue(usersRef, (snapshot) => {
      setUsers(snapshot.val() || {});
    });

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
    
    return () => {
      usersUnsub();
      postsUnsub();
      storiesUnsub();
    }
  }, [currentUser]);

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
          <MainContent
            currentUser={currentUser}
            users={users}
            posts={posts}
            stories={stories}
            loading={posts.length === 0} // Show loading if posts aren't there yet
          />
        </div>
        <SidebarRight users={users} currentUser={currentUser}/>
      </main>
      <BottomNav />
    </div>
  );
};

export default App;
