import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Import 'query' and 'limitToLast' from 'firebase/database'
import { onValue, ref, query, limitToLast } from 'firebase/database';
import { db, onAuthChange, createPost, fetchPosts, POSTS_PER_PAGE } from './services/firebase';
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
import PostModal from './components/PostModal';
import { uploadImage } from './services/imageUpload';
import AdminPage from './components/admin/AdminPage';

type Route = 
  | { name: 'home' }
  | { name: 'profile'; id?: string }
  | { name: 'friends' }
  | { name: 'explore' }
  | { name: 'search'; query?: string }
  | { name: 'admin' };

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
        case 'admin':
            return { name: 'admin' };
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
  const [route, setRoute] = useState<Route>({ name: 'home' }); // Default to home
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());

    // Set the initial route from the hash after the component has mounted
    handleHashChange();
    
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
  
  const loadInitialPosts = useCallback(async () => {
    if (isFetchingPosts) return;
    setIsFetchingPosts(true);
    const initialPosts = await fetchPosts();
    setPosts(initialPosts);
    setHasMorePosts(initialPosts.length === POSTS_PER_PAGE);
    setIsFetchingPosts(false);
  }, [isFetchingPosts]);
  
  useEffect(() => {
    if (!currentUser) return;

    loadInitialPosts();

    const usersRef = ref(db, 'users/');
    const usersUnsub = onValue(usersRef, (snapshot) => setUsers(snapshot.val() || {}));

    // Listener for real-time post updates (new posts, reactions, comments)
    const postsRef = ref(db, 'posts/');
    const postsUnsub = onValue(query(postsRef, limitToLast(1)), (snapshot) => {
       // A simple listener to add new posts to the top of the feed in real-time
        if (snapshot.exists()) {
            const newPostsData = snapshot.val();
            const newPostsArray = Object.values(newPostsData) as Post[];
            setPosts(prevPosts => {
                const existingPostIds = new Set(prevPosts.map(p => p.id));
                const uniqueNewPosts = newPostsArray.filter(p => !existingPostIds.has(p.id));
                return [...uniqueNewPosts, ...prevPosts];
            });
        }
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
  }, [currentUser, loadInitialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (isFetchingPosts || !hasMorePosts || posts.length === 0) return;
    
    setIsFetchingPosts(true);
    const lastPost = posts[posts.length - 1];
    const newPosts = await fetchPosts(lastPost.timestamp);
    
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    setHasMorePosts(newPosts.length === POSTS_PER_PAGE);
    setIsFetchingPosts(false);
  }, [isFetchingPosts, hasMorePosts, posts]);


  const handleCreatePost = async (content: string, imageFiles: File[]) => {
    if (!currentUser) return;

    let mediaUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        const uploadPromises = imageFiles.map(file => uploadImage(file));
        mediaUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Failed to upload one or more images:", error);
        alert("Error uploading images. Please try again.");
        return;
      }
    }

    const newPost: Omit<Post, 'id' | 'commentCount' | 'timestamp'> = {
      userId: currentUser.id,
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    };

    try {
      await createPost(newPost);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Error creating post. Please try again.");
    }
  };
  
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
                        loading={posts.length === 0 && isFetchingPosts}
                        onOpenPostModal={() => setIsPostModalOpen(true)}
                        loadMorePosts={loadMorePosts}
                        hasMorePosts={hasMorePosts}
                        isFetchingPosts={isFetchingPosts}
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
                        posts={filteredPosts}
                     />
          case 'admin':
              if (currentUser.role !== 'admin') {
                  return <div className="p-8 text-center"><h1 className="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>
              }
              return <AdminPage users={users} />;
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

  const isExplorePage = route.name === 'explore';
  const isAdminPage = route.name === 'admin';

  return (
    <div className="bg-background min-h-screen text-primary pb-20 md:pb-0">
      {!isExplorePage && (
        <Header 
          currentUser={currentUser} 
          friendRequestCount={Object.keys(friendRequests).length}
          users={users}
          friendRequests={friendRequests}
          communities={communities}
          channels={channels}
        />
      )}
      <main className={!isExplorePage ? "flex pt-14 max-w-7xl mx-auto" : ""}>
        {!isExplorePage && !isAdminPage && <SidebarLeft currentUser={currentUser} />}
        <div className={!isExplorePage && !isAdminPage ? "w-full md:ml-72 transition-all duration-300" : "w-full"}>
           <div className={isAdminPage ? "pt-14" : ""}>
             {renderContent()}
           </div>
        </div>
      </main>
      <BottomNav onPostClick={() => setIsPostModalOpen(true)} currentUser={currentUser}/>
      {isPostModalOpen && (
        <PostModal
          currentUser={currentUser}
          onClose={() => setIsPostModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default App;
