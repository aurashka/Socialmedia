import React, { useState, useEffect, useMemo } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, onAuthChange } from './services/firebase';
import type { User, Post, Story, Community, Channel } from './types';
import type { User as FirebaseUser } from 'firebase/auth';
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import MainContent from './components/MainContent';
import Auth from './components/auth/Auth';
import CompleteProfile from './components/auth/CompleteProfile';
import LoadingSpinner from './components/LoadingSpinner';
import ProfilePage from './components/profile/ProfilePage';
import FriendsPage from './components/friends/FriendsPage';
import SearchPage from './components/search/SearchPage';
import { signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import BottomNav from './components/BottomNav';
import ExplorePage from './components/explore/ExplorePage';

type Route = 
  | { name: 'home' }
  | { name: 'profile'; id?: string }
  | { name: 'friends' }
  | { name: 'explore' }
  | { name: 'search'; query?: string };

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2);
    const [path, param] = hash.split('/');

    switch (path) {
        case 'profile':
            return { name: 'profile', id: param };
        case 'friends':
            return { name: 'friends' };
        case 'explore':
            return { name: 'explore' };
        case 'search':
            return { name: 'search', query: param ? decodeURIComponent(param) : undefined };
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
  const [communities, setCommunities] = useState<Record<string, Community>>({});
  const [channels, setChannels] = useState<Record<string, Channel>>({});
  const [friendRequests, setFriendRequests] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let userProfileUnsubscribe: () => void = () => {};

    const unsubscribeAuth = onAuthChange((user) => {
      userProfileUnsubscribe();

      if (user) {
        setAuthUser(user);
        
        const userProfileRef = ref(db, `users/${user.uid}`);
        userProfileUnsubscribe = onValue(userProfileRef, (snapshot) => {
          const userProfile = snapshot.val();
          if (userProfile?.isBanned) {
            alert("Your account has been banned.");
            signOut(auth);
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
          setLoading(false);
        });
      } else {
        setAuthUser(null);
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      userProfileUnsubscribe();
    };
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
    
    const communitiesRef = ref(db, 'communities/');
    const communitiesUnsub = onValue(communitiesRef, (snapshot) => {
      setCommunities(snapshot.val() || {});
    });
    
    const channelsRef = ref(db, 'channels/');
    const channelsUnsub = onValue(channelsRef, (snapshot) => {
      setChannels(snapshot.val() || {});
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
      communitiesUnsub();
      channelsUnsub();
    }
  }, [currentUser]);
  
  const filteredUsers = useMemo(() => {
    if (!currentUser?.blocked) return users;
    const filtered = { ...users };
    Object.keys(currentUser.blocked).forEach(blockedId => {
      delete filtered[blockedId];
    });
    return filtered;
  }, [users, currentUser]);

  const filteredPosts = useMemo(() => {
    if (!currentUser?.blocked) return posts;
    return posts.filter(post => !currentUser.blocked![post.userId]);
  }, [posts, currentUser]);

  const filteredStories = useMemo(() => {
    if (!currentUser?.blocked) return stories;
    return stories.filter(story => !currentUser.blocked![story.userId]);
  }, [stories, currentUser]);

  const renderContent = () => {
      if (!currentUser) return null;

      switch(route.name) {
          case 'home':
              return <MainContent
                        currentUser={currentUser}
                        users={filteredUsers}
                        posts={filteredPosts}
                        stories={filteredStories}
                        loading={posts.length === 0}
                      />;
          case 'profile':
              return <ProfilePage
                        currentUser={currentUser}
                        profileUserId={route.id}
                        users={users} // Pass all users to find profile, even if blocked
                        posts={filteredPosts}
                        friendRequests={friendRequests}
                        stories={filteredStories}
                     />
          case 'friends':
              return <FriendsPage
                        currentUser={currentUser}
                        users={users}
                        friendRequests={friendRequests}
                     />
           case 'explore':
                return <ExplorePage
                         currentUser={currentUser}
                         users={users}
                         posts={filteredPosts}
                       />
          case 'search':
              return <SearchPage
                        query={route.query || ''}
                        currentUser={currentUser}
                        users={users}
                        communities={communities}
                        channels={channels}
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
    <div className="bg-background min-h-screen text-primary pb-20 md:pb-0">
      <Header 
        currentUser={currentUser} 
        friendRequestCount={Object.keys(friendRequests).length}
        users={users}
        friendRequests={friendRequests}
        communities={communities}
        channels={channels}
      />
      <main className="flex pt-14 max-w-7xl mx-auto">
        <SidebarLeft currentUser={currentUser} />
        <div className="w-full md:ml-72 transition-all duration-300">
          {renderContent()}
        </div>
      </main>
      <BottomNav onPostClick={() => { /* Logic to open post modal */ }} currentUser={currentUser}/>
    </div>
  );
};

export default App;