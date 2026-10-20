import React, { useState, useEffect } from 'react';
import { LogOut, Sun, Moon, Sparkles, User, Shield, BookOpen, Tv, Users, ShoppingBag, BookText, HelpCircle, Laptop } from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { User as AppUser, SiteSettings } from '../types.ts';

interface NavbarProps {
  user: AppUser | null;
  onAuthSync: (user: FirebaseUser | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  settings: SiteSettings;
}

export default function Navbar({
  user,
  onAuthSync,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  settings,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      onAuthSync(result.user);
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onAuthSync(null);
      setDropdownOpen(false);
      setActiveTab('home');
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const navItems = [
    { id: 'home', name: 'Home', icon: Laptop },
    { id: 'classroom', name: 'Classroom', icon: Tv },
    { id: 'store', name: 'Store', icon: ShoppingBag },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'blog', name: 'Blog', icon: BookText },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg shadow-md shadow-blue-500/10 group-hover:scale-105 transition-all duration-200">
              K
            </div>
            <div>
              <span className="text-lg font-display font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {settings.brandName || 'Kelvin Creator Hub'}
              </span>
              <span className="text-[10px] block text-blue-600 dark:text-blue-400 font-semibold -mt-1 uppercase tracking-widest font-mono">
                {settings.tagline || 'Learn. Create. Earn.'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-600 dark:text-slate-300">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 transition-all py-1.5 px-2.5 rounded-xl cursor-pointer font-sans text-xs font-semibold relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-400/5 font-bold'
                      : 'hover:text-blue-600 dark:hover:text-blue-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
            
            {user && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 transition-all py-1.5 px-2.5 rounded-xl cursor-pointer font-sans text-xs font-semibold ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-400/5 font-bold'
                    : 'hover:text-blue-600 dark:hover:text-blue-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}

            {user?.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 transition-all py-1.5 px-2.5 rounded-xl cursor-pointer font-sans text-xs font-bold ${
                  activeTab === 'admin'
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-400/5'
                    : 'text-rose-500 dark:text-rose-400 hover:text-rose-600 hover:bg-rose-500/5 dark:hover:bg-rose-400/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Suite</span>
              </button>
            )}
          </div>

          {/* User Controls & Dark Mode */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-150 dark:hover:border-slate-750 transition-all duration-150 cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {user ? (
              <div className="relative flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Lv. {Math.floor(user.xp / 100) + 1} • <span className="text-blue-600 dark:text-blue-400 font-semibold">{user.xp} XP</span>
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.displayName || 'Profile'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-display font-bold text-sm">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 shadow-2xl py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Profile Account</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => { setActiveTab('dashboard'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer font-sans"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </button>
                      
                      {user.isAdmin && (
                        <button
                          onClick={() => { setActiveTab('admin'); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2.5 cursor-pointer font-bold"
                        >
                          <Shield className="w-4 h-4 text-rose-500" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2.5 cursor-pointer font-sans"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 cursor-pointer transition-all duration-150 shadow-blue-500/10"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Entering...' : 'Log In / Sign Up'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Navigation Bottom Bar (Premium App UX) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100/80 dark:border-slate-800/80 px-4 py-2 flex justify-around z-40 shadow-2xl">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 scale-105 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-sans font-medium tracking-tight">{tab.name}</span>
            </button>
          );
        })}
        {user && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">Learn</span>
          </button>
        )}
      </div>
    </nav>
  );
}
