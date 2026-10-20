import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { User as AppUser, Course, Enrollment, LiveClass, DigitalProduct, BlogPost, CommunityPost, ServiceRequest, SiteSettings } from './types.ts';

import Navbar from './components/Navbar.tsx';
import LandingPage from './components/LandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import CoursePlayer from './components/CoursePlayer.tsx';
import LiveClassroom from './components/LiveClassroom.tsx';
import DigitalStore from './components/DigitalStore.tsx';
import Community from './components/Community.tsx';
import Blog from './components/Blog.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AiAssistant from './components/AiAssistant.tsx';

import { Sparkles, Lock, Shield, Loader, Volume2, X } from 'lucide-react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  // Nav tab control state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Selected course to play
  const [playingCourseId, setPlayingCourseId] = useState<number | null>(null);

  // App data registers
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'Kelvin Digital Creator Hub',
    tagline: 'Learn. Create. Earn.',
    heroTitle: 'Become the Digital Creator Everyone Wants to Hire.',
    heroSubtitle: 'Master CapCut editing, AI tools, AI website building, content creation, online marketing, and other high-income digital skills—all in one place.',
    kelvinBio: "I'm Kelvin Junior, a digital creator passionate about helping people learn practical skills that create real opportunities. I specialize in CapCut video editing, AI-powered website building, content creation, AI productivity, online marketing, and creative digital solutions.",
    kelvinPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    phoneNumber: '08128844540',
    email: 'juniasdiyaolu@gmail.com',
    address: 'Lagos, Nigeria',
    paymentDetails: 'Kelvin Digital Creator Hub LTD - Bank: GTBank - Account: 0123456789',
    socialLinks: { whatsapp: '', instagram: '', youtube: '', tiktok: '' }
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [studentsList, setStudentsList] = useState<AppUser[]>([]);

  // Dark mode trigger
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth synchronization listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setAuthLoading(true);
      if (fUser) {
        setFirebaseUser(fUser);
        try {
          const idToken = await fUser.getIdToken();
          setToken(idToken);

          // Synchronize user profile into backend database
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            }
          });

          if (syncRes.ok) {
            const data = await syncRes.json();
            setUser(data.user);
          }
        } catch (err) {
          console.error('Error syncing auth state with server database:', err);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setToken('');
        if (activeTab !== 'home' && activeTab !== 'blog' && activeTab !== 'store') {
          setActiveTab('home');
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Primary data load effect
  useEffect(() => {
    async function loadHubContent() {
      try {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Load Global settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData) setSettings(sData);
        }

        // Load courses catalog
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          setCourses(cData || []);
        }

        // Load store items
        const storeRes = await fetch('/api/store');
        if (storeRes.ok) {
          const pData = await storeRes.json();
          setDigitalProducts(pData || []);
        }

        // Load blog posts
        const blogRes = await fetch('/api/blog');
        if (blogRes.ok) {
          const bData = await blogRes.json();
          setBlogPosts(bData || []);
        }

        // Load community feed
        const commRes = await fetch('/api/community');
        if (commRes.ok) {
          const coData = await commRes.json();
          setCommunityPosts(coData || []);
        }

        // Load live countdown webinar details
        const webinarRes = await fetch('/api/live-classes');
        if (webinarRes.ok) {
          const wData = await webinarRes.json();
          if (wData && wData.length > 0) {
            setLiveClass(wData[wData.length - 1]);
          }
        }

        // Load user-specific enrollments
        if (token) {
          const enrollRes = await fetch('/api/enrollments', { headers });
          if (enrollRes.ok) {
            const eData = await enrollRes.json();
            setEnrollments(eData || []);
          }

          // If user is super admin, load students list & inquiries
          if (user?.isAdmin) {
            const adminUsersRes = await fetch('/api/admin/users', { headers });
            if (adminUsersRes.ok) {
              const uData = await adminUsersRes.json();
              setStudentsList(uData || []);
            }

            const serviceRes = await fetch('/api/services/requests', { headers });
            if (serviceRes.ok) {
              const sData = await serviceRes.json();
              setServiceRequests(sData || []);
            }
          }
        }

      } catch (err) {
        console.error('Failed loading Kelvin Hub database:', err);
      }
    }
    loadHubContent();
  }, [token, user?.isAdmin]);

  // Handle Login popups
  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        const idToken = await result.user.getIdToken();
        setToken(idToken);
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        if (syncRes.ok) {
          const data = await syncRes.json();
          setUser(data.user);
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSync = async (fUser: FirebaseUser | null) => {
    if (fUser) {
      setFirebaseUser(fUser);
      try {
        const idToken = await fUser.getIdToken();
        setToken(idToken);
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
        if (syncRes.ok) {
          const data = await syncRes.json();
          setUser(data.user);
          setActiveTab('dashboard');
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setFirebaseUser(null);
      setUser(null);
      setToken('');
      setActiveTab('home');
    }
  };

  // API triggers: Update User profiles
  const handleUpdateProfile = async (displayName: string, profilePhoto: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName, profilePhoto })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        alert('Profile saved! 🌟');
      }
    } catch (err) {
      console.error('Failed updating profile:', err);
    }
  };

  // API triggers: Enroll in a Course
  const handleEnrollCourse = async (courseId: number) => {
    if (!token) {
      handleLogin();
      return;
    }
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollments(prev => {
          if (prev.some(e => e.id === data.id)) return prev;
          return [...prev, data];
        });
        setPlayingCourseId(courseId);
        setActiveTab('player');
      }
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
  };

  // API triggers: Course Progress Updates
  const handleUpdateEnrollment = async (enrollmentId: number, data: Partial<Enrollment>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, ...updated } : e));
      }
    } catch (err) {
      console.error('Failed updating enrollment metrics:', err);
    }
  };

  // API triggers: Community interactions
  const handleCreateCommunityPost = async (title: string, content: string, tags: string[]) => {
    if (!token) return;
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, tags })
      });
      if (res.ok) {
        const newPost = await res.json();
        setCommunityPosts(prev => [newPost, ...prev]);
        if (user) {
          setUser(u => u ? { ...u, xp: u.xp + 15 } : null);
        }
      }
    } catch (err) {
      console.error('Failed to publish post:', err);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/community/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setCommunityPosts(prev => prev.map(p => p.id === postId ? updated : p));
      }
    } catch (err) {
      console.error('Failed liking post:', err);
    }
  };

  const handleAddPostComment = async (postId: number, comment: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/community/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment })
      });
      if (res.ok) {
        const updated = await res.json();
        setCommunityPosts(prev => prev.map(p => p.id === postId ? updated : p));
      }
    } catch (err) {
      console.error('Failed comment creation:', err);
    }
  };

  // API triggers: Webinar count-down interactions
  const handleLiveClassRegister = async (classId: number) => {
    if (!token) {
      handleLogin();
      return null;
    }
    try {
      const res = await fetch(`/api/live-classes/${classId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setLiveClass(updated);
        return updated;
      }
    } catch (err) {
      console.error('Live registration failed:', err);
    }
    return null;
  };

  const handleLiveInteraction = async (classId: number, data: any) => {
    if (!token) return null;
    try {
      const res = await fetch(`/api/live-classes/${classId}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setLiveClass(updated);
        return updated;
      }
    } catch (err) {
      console.error('Live interaction failed:', err);
    }
    return null;
  };

  // API triggers: Service Hiring Inquiry
  const handlePostServiceRequest = async (serviceName: string, details: string, contactPhone: string) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/services/requests', {
      method: 'POST',
      headers,
      body: JSON.stringify({ serviceName, details, contactPhone })
    });
    if (res.ok) {
      const newInquiry = await res.json();
      setServiceRequests(prev => [newInquiry, ...prev]);
    }
  };

  // ADMIN-ONLY API triggers
  const handleUpdateGlobalSettings = async (data: Partial<SiteSettings>) => {
    if (!token) return;
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
    }
  };

  const handleAdminAddCourse = async (courseData: any) => {
    if (!token) return;
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(courseData)
    });
    if (res.ok) {
      const added = await res.json();
      setCourses(prev => [...prev, added]);
    }
  };

  const handleAdminDeleteCourse = async (courseId: number) => {
    if (!token) return;
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  const handleAdminAddLiveClass = async (liveData: any) => {
    if (!token) return;
    const res = await fetch('/api/live-classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(liveData)
    });
    if (res.ok) {
      const added = await res.json();
      setLiveClass(added);
    }
  };

  const handleAdminAddBlog = async (blogData: any) => {
    if (!token) return;
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(blogData)
    });
    if (res.ok) {
      const added = await res.json();
      setBlogPosts(prev => [added, ...prev]);
    }
  };

  const handleAdminUpdateServiceStatus = async (requestId: number, status: string) => {
    if (!token) return;
    const res = await fetch(`/api/services/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      setServiceRequests(prev => prev.map(s => s.id === requestId ? updated : s));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200 text-slate-800 dark:text-slate-100 ${darkMode ? 'dark' : ''}`}>
      
      {/* Dynamic Navbar */}
      <Navbar
        user={user}
        onAuthSync={handleAuthSync}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setPlayingCourseId(null);
         }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        settings={settings}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <Loader className="w-10 h-10 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold uppercase tracking-wider font-sans">Connecting Creator Terminal...</p>
          </div>
        ) : (
          <>
            {/* ROUTE 1: Landing Sales page */}
            {activeTab === 'home' && (
              <LandingPage
                settings={settings}
                courses={courses}
                studentLoggedIn={!!user}
                onLogin={handleLogin}
                setActiveTab={setActiveTab}
                onPostServiceRequest={handlePostServiceRequest}
              />
            )}

            {/* Access wall for private student spaces */}
            {activeTab !== 'home' && activeTab !== 'blog' && activeTab !== 'store' && !user ? (
              <div className="max-w-md mx-auto my-20 px-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-5">
                  <div className="p-4.5 bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white">Student Login Required</h2>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                      Sign in with your Google Account to begin tracks, practice quizzes, and download free premium transition assets.
                    </p>
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Connect Scholar Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ROUTE 2: Dashboard */}
                {activeTab === 'dashboard' && user && (
                  <Dashboard
                    user={user}
                    courses={courses}
                    enrollments={enrollments}
                    onStartLearning={(courseId) => {
                      setPlayingCourseId(courseId);
                      setActiveTab('player');
                    }}
                    onUpdateProfile={handleUpdateProfile}
                  />
                )}

                {/* ROUTE 3: Course browser / Player Router */}
                {activeTab === 'courses' && (
                  <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-6">
                    <div className="space-y-1">
                      <h1 className="text-xl md:text-2xl font-display font-bold text-slate-800 dark:text-white">Creator Curriculums</h1>
                      <p className="text-xs text-slate-400">Enroll in top high-income skill courses built specifically for digital earners.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {courses.map((c) => {
                        const enrolled = enrollments.find(e => e.courseId === c.id);
                        return (
                          <div key={c.id} className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow transition duration-150">
                            <div className="aspect-video bg-slate-100 overflow-hidden">
                              <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 space-y-3.5">
                              <div>
                                <span className="bg-blue-500/10 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{c.difficulty}</span>
                                <h3 className="font-display font-bold text-xs text-slate-850 dark:text-white mt-1.5">{c.title}</h3>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-3">{c.description}</p>
                              </div>

                              <button
                                onClick={() => enrolled ? (setPlayingCourseId(c.id), setActiveTab('player')) : handleEnrollCourse(c.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                {enrolled ? 'Resume Class' : 'Enroll Now (+100 XP)'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ROUTE 4: Interactive Player */}
                {activeTab === 'player' && playingCourseId && user && (
                  (() => {
                    const currentCourse = courses.find(c => c.id === playingCourseId);
                    const currentEnroll = enrollments.find(e => e.courseId === playingCourseId);
                    if (!currentCourse || !currentEnroll) return <p className="text-xs text-center p-12 text-slate-400">Enrollment sync failed!</p>;
                    return (
                      <CoursePlayer
                        course={currentCourse}
                        enrollment={currentEnroll}
                        onUpdateEnrollment={handleUpdateEnrollment}
                        onClose={() => {
                          setPlayingCourseId(null);
                          setActiveTab('dashboard');
                        }}
                        userXp={user.xp}
                        onXpEarned={async (amount) => {
                          setUser(prev => prev ? { ...prev, xp: prev.xp + amount } : null);
                        }}
                      />
                    );
                  })()
                )}

                {/* ROUTE 5: Live stream webinars room */}
                {activeTab === 'webinar' && (
                  <LiveClassroom
                    user={user}
                    liveClass={liveClass}
                    onPostInteraction={handleLiveInteraction}
                    onRegister={handleLiveClassRegister}
                    onLogin={handleLogin}
                  />
                )}

                {/* ROUTE 6: Digital products hub */}
                {activeTab === 'store' && (
                  <DigitalStore
                    user={user}
                    products={digitalProducts}
                    onLogin={handleLogin}
                  />
                )}

                {/* ROUTE 7: community message feed */}
                {activeTab === 'community' && (
                  <Community
                    user={user}
                    posts={communityPosts}
                    onPostCreated={handleCreateCommunityPost}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddPostComment}
                    onLogin={handleLogin}
                  />
                )}

                {/* ROUTE 8: Blogs Catalog */}
                {activeTab === 'blog' && (
                  <Blog posts={blogPosts} />
                )}

                {/* ROUTE 9: Admin dashboard */}
                {activeTab === 'admin' && user && user.isAdmin && (
                  <AdminPanel
                    user={user}
                    settings={settings}
                    courses={courses}
                    liveClass={liveClass}
                    blogs={blogPosts}
                    serviceRequests={serviceRequests}
                    students={studentsList}
                    onUpdateSettings={handleUpdateGlobalSettings}
                    onAddCourse={handleAdminAddCourse}
                    onDeleteCourse={handleAdminDeleteCourse}
                    onAddLiveClass={handleAdminAddLiveClass}
                    onPostLiveInteraction={handleLiveInteraction}
                    onAddBlog={handleAdminAddBlog}
                    onUpdateServiceStatus={handleAdminUpdateServiceStatus}
                  />
                )}

              </>
            )}
          </>
        )}
      </main>

      {/* Footer social values */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800/80 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-display font-bold text-sm tracking-tight">{settings.brandName}</h3>
            <p className="mt-2 text-slate-500 leading-relaxed max-w-xs">
              Become a premium high-income digital editor, AI engineer, and content strategist. All lessons, downloadable materials, and support under one roof.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Site Directory</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition">Home</button></li>
              <li><button onClick={() => setActiveTab('courses')} className="hover:text-white transition">Courses</button></li>
              <li><button onClick={() => setActiveTab('store')} className="hover:text-white transition">Digital Assets</button></li>
              <li><button onClick={() => setActiveTab('blog')} className="hover:text-white transition">Creator Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Connect & Location</h4>
            <p className="text-slate-400 space-y-1">
              <span className="block">Email: {settings.email}</span>
              <span className="block">WhatsApp: {settings.phoneNumber}</span>
              <span className="block">Location: {settings.address}</span>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2 max-w-7xl mx-auto px-4">
          <p>&copy; 2026 {settings.brandName}. All rights reserved.</p>
          <p>Created by Kelvin Junior</p>
        </div>
      </footer>

      {/* Floating AI companion */}
      <AiAssistant />

    </div>
  );
}
