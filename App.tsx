
import React, { useState, useEffect } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, seedDatabase } from './services/firebase';
import type { User, Post, Story } from './types';
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import MainContent from './components/MainContent';
import SidebarRight from './components/SidebarRight';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock current user
  const currentUser: User = {
    id: 'user1',
    name: 'George Alex',
    avatarUrl: 'https://i.pravatar.cc/150?u=user1',
  };

  useEffect(() => {
    const seedAndFetch = async () => {
      await seedDatabase();

      const usersRef = ref(db, 'users/');
      onValue(usersRef, (snapshot) => {
        setUsers(snapshot.val() || {});
      });

      const postsRef = ref(db, 'posts/');
      onValue(postsRef, (snapshot) => {
        const postsData = snapshot.val() || {};
        const postsArray = Object.values(postsData) as Post[];
        setPosts(postsArray.sort((a, b) => b.timestamp - a.timestamp));
      });

      const storiesRef = ref(db, 'stories/');
      onValue(storiesRef, (snapshot) => {
        const storiesData = snapshot.val() || {};
        setStories(Object.values(storiesData) as Story[]);
      });

      setLoading(false);
    };

    seedAndFetch();
  }, []);

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
            loading={loading}
          />
        </div>
        <SidebarRight users={users} />
      </main>
      <BottomNav />
    </div>
  );
};

export default App;
