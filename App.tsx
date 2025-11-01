import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { onValue, ref, query, limitToLast, orderByChild, equalTo } from 'firebase/database';
import { db, onAuthChange, createPost } from './services/firebase';
import type { User, Post, Story, Community, Channel, Notification, Conversation } from './types';
import type { User as FirebaseUser } from 'firebase/auth';
import Header from './components/Header';
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
import { uploadMedia } from './services/mediaUpload';
import AdminPage from './components/admin/AdminPage';
import { ThemeProvider } from './contexts/ThemeContext';
import SettingsPage from './components/settings/SettingsPage';
import CommentSheet from './components/comments/CommentSheet';
import MessagesPage from './components/messages/MessagesPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import PostPage from './components/PostPage';
import AdminUserDetail from './components/admin/AdminUserDetail';
// FIX: Import PostCardShimmer component to resolve reference error.
import PostCardShimmer from './components/shimmers/PostCardShimmer';


type Route = 
  | { name: 'home' }
  | { name: 'profile'; id?: string }
  | { name: 'friends' }
  | { name: 'explore' }
  | { name: 'search'; query?: string }
  | { name: 'admin' }
  | { name: 'admin-user'; id: string }
  | { name: 'settings' }
  | { name: 'messages'; id?: string }
  | { name: 'notifications' }
  | { name: 'post'; id: string };

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2); // remove #/
    const parts = hash.split('/');

    switch (parts[0]) {
        case 'profile':
            return { name: 'profile', id: parts[1] };
        case 'friends':
            return { name: 'friends' };
        case 'explore':
            return { name: 'explore' };
        case 'search':
            return { name: 'search', query: parts[1] ? decodeURIComponent(parts[1]) : undefined };
        case 'admin':
            if (parts[1] === 'user' && parts[2]) {
                return { name: 'admin-user', id: parts[2] };
            }
            return { name: 'admin' };
        case 'settings':
            return { name: 'settings' };
        case 'messages':
            return { name: 'messages', id: parts[1] };
        case 'notifications':
            return { name: 'notifications' };
        case 'post':
            return { name: 'post', id: parts[1] };
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, any>>({});
  const [initialPostLoad, setInitialPostLoad] = useState(true);
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [commentSheetPost, setCommentSheetPost] = useState<Post | null>(null);
  const prevNotificationsRef = useRef<Notification[]>([]);


  useEffect(() => {
    const handleHashChange = () => {
        setRoute(parseHash());
    };
    
    setRoute(parseHash()); // Initial call
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Push Notifications Logic
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
      if (document.hidden && notifications.length > prevNotificationsRef.current.length && currentUser) {
          const newNotifications = notifications.filter(n => 
              !prevNotificationsRef.current.some(pn => pn.id === n.id) &&
              !n.read &&
              n.senderId !== currentUser.id
          );
          
          const getNotificationText = (type: Notification['type']) => {
              switch (type) {
                  case 'like': return 'liked your post.';
                  case 'comment': return 'commented on your post.';
                  case 'mention': return 'mentioned you in a post.';
                  case 'friend_request': return 'sent you a friend request.';
                  case 'friend_accept': return 'accepted your friend request.';
                  default: return 'interacted with you.';
              }
          };

          newNotifications.forEach(n => {
              const sender = users[n.senderId];
              if (sender && Notification.permission === 'granted') {
                  const body = `${sender.name} ${getNotificationText(n.type)}`;
                  new Notification('ConnectSphere', {
                      body,
                      icon: sender.avatarUrl,
                  });
              }
          });
      }
      prevNotificationsRef.current = notifications;
  }, [notifications, currentUser, users]);

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
              email: user.email || '',
              avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
              role: 'user',
            });
          }
        }, (error) => {
            console.error("Firebase profile read failed:", error);
            alert("Could not load your profile due to a database error. Please try logging in again.");
            signOut(auth);
        });
      } else {
        setAuthUser(null);
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
      userProfileUnsubscribe();
    };
  }, []);
  
  useEffect(() => {
    if (!currentUser?.id) {
        setPosts([]); // Clear posts on logout
        return;
    };

    setInitialPostLoad(true); // Reset loading state for new user login

    const usersRef = ref(db, 'users/');
    const usersUnsub = onValue(usersRef, (snapshot) => setUsers(snapshot.val() || {}));

    const postsRef = ref(db, 'posts/');
    const postsQuery = query(postsRef, orderByChild('timestamp'), limitToLast(25));
    const postsUnsub = onValue(postsQuery, (snapshot) => {
        if (snapshot.exists()) {
            const postsData = snapshot.val();
            const postsArray = Object.values(postsData) as Post[];
            setPosts(postsArray.sort((a, b) => b.timestamp - a.timestamp));
        } else {
            setPosts([]);
        }
        setInitialPostLoad(false);
    });

    const storiesRef = ref(db, 'stories/');
    const storiesUnsub = onValue(storiesRef, (snapshot) => {
      const storiesData = snapshot.val() || {};
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentStories = (Object.values(storiesData) as Story[]).filter(
        (story) => story.timestamp > twentyFourHoursAgo
      );
      setStories(recentStories);
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

    const notifsRef = ref(db, `notifications/${currentUser.id}`);
    const notifsQuery = query(notifsRef, orderByChild('timestamp'), limitToLast(50));
    const notifsUnsub = onValue(notifsQuery, (snapshot) => {
        if (snapshot.exists()) {
            const notifsData = snapshot.val();
            setNotifications(Object.values(notifsData).sort((a: any, b: any) => b.timestamp - a.timestamp) as Notification[]);
        } else {
            setNotifications([]);
        }
    });

    const conversationsRef = ref(db, 'conversations');
    const userConvsQuery = query(conversationsRef, orderByChild(`participants/${currentUser.id}`), equalTo(true));
    const convsUnsub = onValue(userConvsQuery, (snapshot) => {
        if (snapshot.exists()) {
            const convsData = snapshot.val();
            const convsArray = Object.values(convsData) as Conversation[];
            setConversations(convsArray.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp));
        } else {
            setConversations([]);
        }
    });

    const statusRef = ref(db, 'status');
    const statusUnsub = onValue(statusRef, (snapshot) => {
        setOnlineStatuses(snapshot.val() || {});
    });
    
    return () => {
      usersUnsub();
      postsUnsub();
      storiesUnsub();
      requestsUnsub();
      communitiesUnsub();
      channelsUnsub();
      notifsUnsub();
      convsUnsub();
      statusUnsub();
    }
  }, [currentUser?.id]);

  const handleCreatePost = async (content: string, mediaFiles: File[], privacy: Post['privacy'], areCommentsDisabled: boolean) => {
    if (!currentUser) return;

    let uploadedMedia: { url: string; type: 'image' | 'video' }[] = [];
    if (mediaFiles.length > 0) {
      try {
        const uploadPromises = mediaFiles.map(file => uploadMedia(file));
        const allUploadedMedia = await Promise.all(uploadPromises);
        // FIX: The result from uploadMedia can include 'audio' type which is not supported by Posts. Filter the results to ensure type compatibility.
        uploadedMedia = allUploadedMedia.filter(
            (media): media is { url: string; type: 'image' | 'video' } =>
                media.type === 'image' || media.type === 'video'
        );
      } catch (error) {
        console.error("Failed to upload media:", error);
        alert("Error uploading media. Please try again.");
        return;
      }
    }

    const newPost: Omit<Post, 'id' | 'commentCount' | 'timestamp'> = {
      userId: currentUser.id,
      content,
      media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
      privacy,
      areCommentsDisabled,
    };

    try {
      await createPost(newPost, users);
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
    if (!currentUser) return posts;
    
    const blockedUserIds = currentUser.blocked ? Object.keys(currentUser.blocked) : [];
    const friendIds = currentUser.friends ? Object.keys(currentUser.friends) : [];
    
    return posts.filter(post => {
      // Hide posts from users blocked by the current user
      if (blockedUserIds.includes(post.userId)) {
        return false;
      }
      
      // Always show the current user's own posts
      if (post.userId === currentUser.id) {
        return true;
      }

      // Determine privacy, defaulting old posts to public
      const privacy = post.privacy || 'public';
      
      switch (privacy) {
        case 'public':
          return true;
        case 'friends':
          return friendIds.includes(post.userId);
        case 'private':
          return false; // Only visible to owner, handled above
        default:
          return true;
      }
    });
  }, [posts, currentUser]);

  const filteredStories = useMemo(() => {
    if (!currentUser?.blocked) return stories;
    return stories.filter(story => !currentUser.blocked![story.userId]);
  }, [stories, currentUser]);

  const openCommentSheet = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setCommentSheetPost(post);
    }
  };

  const renderContent = () => {
      if (!currentUser) return <div className="space-y-4 max-w-lg mx-auto py-4"><PostCardShimmer /><PostCardShimmer /></div>;

      switch(route.name) {
          case 'home':
              return <MainContent
                        currentUser={currentUser}
                        users={filteredUsers}
                        posts={filteredPosts}
                        stories={filteredStories}
                        loading={initialPostLoad}
                        onOpenPostModal={() => setIsPostModalOpen(true)}
                        onOpenCommentSheet={openCommentSheet}
                      />;
          case 'profile':
              return <ProfilePage
                        currentUser={currentUser}
                        profileUserId={route.id}
                        users={users}
                        posts={posts} // Pass all posts to profile page for its own filtering
                        friendRequests={friendRequests}
                        stories={filteredStories}
                        onOpenCommentSheet={openCommentSheet}
                     />
          case 'friends':
              return <FriendsPage
                        currentUser={currentUser}
                        users={users}
                        friendRequests={friendRequests}
                        onlineStatuses={onlineStatuses}
                     />
           case 'explore':
                return <ExplorePage
                         currentUser={currentUser}
                         users={users}
                         posts={posts} // Pass all posts
                         friendRequests={friendRequests}
                         communities={communities}
                         channels={channels}
                         onOpenCommentSheet={openCommentSheet}
                       />
          case 'search':
              return <SearchPage
                        query={route.query || ''}
                        currentUser={currentUser}
                        users={users}
                        communities={communities}
                        channels={channels}
                        posts={posts} // Pass all posts
                        onOpenCommentSheet={openCommentSheet}
                     />
          case 'messages':
                return <MessagesPage
                          currentUser={currentUser}
                          users={users}
                          onlineStatuses={onlineStatuses}
                          conversations={conversations}
                          activeConversationId={route.id}
                       />
          case 'notifications':
                return <NotificationsPage
                          currentUser={currentUser}
                          notifications={notifications}
                          users={users}
                          posts={posts}
                       />
          case 'post':
                return <PostPage
                          postId={route.id}
                          currentUser={currentUser}
                          users={users}
                          posts={posts}
                          onOpenCommentSheet={openCommentSheet}
                        />
          case 'admin':
              if (currentUser.role !== 'admin') {
                  return <div className="p-8 text-center text-primary dark:text-gray-100"><h1 className="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>
              }
              return <AdminPage users={users} onlineStatuses={onlineStatuses} />;
          case 'admin-user':
                if (currentUser.role !== 'admin') {
                    return <div className="p-8 text-center text-primary dark:text-gray-100"><h1 className="text-2xl font-bold">Access Denied</h1><p>You do not have permission to view this page.</p></div>
                }
                return <AdminUserDetail userId={route.id} users={users} posts={posts} />;
          case 'settings':
              return <SettingsPage />;
          default:
              return <div className="text-primary dark:text-gray-100">Page not found</div>
      }
  }

  if (!authUser) {
    return <Auth />;
  }
  
  if (currentUser && (!currentUser.handle || !currentUser.name)) {
    return <CompleteProfile user={currentUser} />;
  }

  const isExplorePage = route.name === 'explore';
  const isMessagesPage = route.name === 'messages';
  const isAdminPage = route.name === 'admin' || route.name === 'admin-user';

  return (
    <ThemeProvider>
      <div className={`bg-background dark:bg-[#121212] min-h-screen ${isAdminPage ? '' : 'pb-20 md:pb-0'} text-primary dark:text-gray-100`}>
        <Header 
          currentUser={currentUser} 
          friendRequestCount={Object.keys(friendRequests).length}
          users={users}
          posts={posts}
          friendRequests={friendRequests}
          communities={communities}
          channels={channels}
          notifications={notifications}
        />
        <main className={`pt-14 ${isMessagesPage ? 'h-screen' : ''} ${isAdminPage ? 'h-[calc(100vh-56px)] overflow-y-auto' : ''}`}>
          {renderContent()}
        </main>
        {!isMessagesPage && !isAdminPage && <BottomNav onPostClick={() => setIsPostModalOpen(true)} currentUser={currentUser}/>}
        {isPostModalOpen && (
          <PostModal
            currentUser={currentUser}
            onClose={() => setIsPostModalOpen(false)}
            onSubmit={handleCreatePost}
          />
        )}
        {commentSheetPost && currentUser && (
          <CommentSheet
            post={commentSheetPost}
            currentUser={currentUser}
            users={users}
            onClose={() => setCommentSheetPost(null)}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;