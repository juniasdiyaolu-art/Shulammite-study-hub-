import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Laptop, Tv, Briefcase, ChevronRight, Star, Quote, HelpCircle, Users, Sparkles, AlertCircle, Phone, Mail, MapPin, ExternalLink, X, Send } from 'lucide-react';
import { SiteSettings, Course, User } from '../types.ts';

interface LandingPageProps {
  settings: SiteSettings;
  courses: Course[];
  studentLoggedIn: boolean;
  onLogin: () => void;
  setActiveTab: (tab: string) => void;
  onPostServiceRequest: (serviceName: string, details: string, contactPhone: string) => Promise<void>;
}

export default function LandingPage({
  settings,
  courses,
  studentLoggedIn,
  onLogin,
  setActiveTab,
  onPostServiceRequest,
}: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [hiringService, setHiringService] = useState<string | null>(null);
  const [hiringDetails, setHiringDetails] = useState('');
  const [hiringPhone, setHiringPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAction = (tab: string) => {
    if (studentLoggedIn) {
      setActiveTab(tab);
    } else {
      onLogin();
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hiringService) return;
    setSubmitting(true);
    try {
      await onPostServiceRequest(hiringService, hiringDetails, hiringPhone);
      alert('Service inquiry posted successfully! Kelvin Junior will reach out to your WhatsApp shortly! 🚀');
      setHiringService(null);
      setHiringDetails('');
      setHiringPhone('');
    } catch (err) {
      alert('Failed to submit inquiry!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans">
      
      {/* 1. HERO SALES SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-25 dark:opacity-15">
          <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-pink-300 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{settings.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-display font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Become the Digital Creator <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Everyone Wants to Hire.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            {settings.heroSubtitle}
          </p>

          <div className="pt-6 flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => handleAction('courses')}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Start Learning</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction('courses')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl flex items-center justify-center transition cursor-pointer"
            >
              <span>Browse Courses</span>
            </button>
            <button
              onClick={() => handleAction('webinar')}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer shadow shadow-amber-400/10"
            >
              <Tv className="w-4 h-4" />
              <span>Join Live Class</span>
            </button>
          </div>

          {/* Quick Statistics Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            {[
              { value: '1,500+', label: 'Students Enrolled' },
              { value: '5+ Core', label: 'High-Income Skills' },
              { value: '100% Free', label: 'Download Assets' },
              { value: 'Live', label: 'Weekly Webinars' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {stat.value}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. COURSES BENTO GRID */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Curated High-Income Courses
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Learn step-by-step from zero to world-class level with Kelvin Junior's proven video guides.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-200 group"
            >
              <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 duration-200" />
                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  {c.difficulty}
                </span>
              </div>
              <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-xs text-slate-850 dark:text-white">{c.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{c.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>{c.lessonsCount} lessons</span>
                  <button
                    onClick={() => handleAction('courses')}
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Enter course <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT KELVIN JUNIOR */}
      <section className="py-16 bg-white dark:bg-slate-900 transition-colors border-y border-slate-100 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Picture frame */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative">
              <div className="w-56 h-64 bg-slate-100 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                <img
                  src={settings.kelvinPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                  alt="Kelvin Jun"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-lg border border-white dark:border-slate-900 text-center text-xs">
                <p className="font-bold">Kelvin Junior</p>
                <p className="text-[9px] text-blue-100">Super Mentor</p>
              </div>
            </div>
          </div>

          {/* Biography text */}
          <div className="md:col-span-7 space-y-4">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Meet Your Instructor</span>
            <h2 className="text-xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
              Driven to Equip the Next Generation of Elite Creators
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
              {settings.kelvinBio}
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Video Editing Pro</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>AI Website Builder</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                <span>Online Marketing Mentor</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                <span>Supportive Community</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SERVICES ORDER SECTION ("Hire Kelvin") */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider">Brand Integrations</span>
          <h2 className="text-xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Hire Kelvin's Creative Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            Need bespoke high-conversion video editing, custom AI website architecture, or digital branding consultations? Hire Kelvin directly for premium client services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Cinematic Video Editing', desc: 'Premium cinematic grading, sound design, and speed ramping inside CapCut & Premiere. Tailored to go viral on Instagram or TikTok.', price: 'From $150' },
            { name: 'AI Website Setup', desc: 'High-speed high-conversion portfolio pages, sales funnels, and landing page systems. Engineered with modern automated AI components.', price: 'From $350' },
            { name: 'Creative Consultations', desc: '1-on-1 strategy calls over Google Meet or WhatsApp. We blueprint your brand identity, marketing tactics, and video layouts.', price: 'From $100' },
          ].map((service, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-2">
                <h3 className="font-display font-bold text-xs text-slate-850 dark:text-white">{service.name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono">{service.price}</span>
                <button
                  onClick={() => setHiringService(service.name)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Hire Kelvin
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQS SECTION */}
      <section className="py-16 bg-white dark:bg-slate-900/60 transition-colors border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-1.5">
            <h2 className="text-xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">
              Answers to common queries about classes, downloads, and mentorship.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the direct download store work?',
                a: 'Once you select an asset, transition pack, or prompt manual inside our Store Tab and apply a coupon, clicking Direct Download streams a packaged zip archive instantly to your computer or phone browser—no wait, no friction!',
              },
              {
                q: 'Do I get certificates after course completions?',
                a: 'Yes! Upon finishing 100% of any high-income course video path, our engine generates an authentic certificate record with a verification ID. You can verify it under the Student Dashboard tab.',
              },
              {
                q: 'What is the Weekly Creator Challenge?',
                a: 'Every Monday, Kelvin posts a cinematic video editing prompt on the Community feed. Students submit their edits as commenting links, and Kelvin awards XP, prizes, and live reviews during webinars.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-4.5 font-bold text-slate-850 dark:text-white flex items-center justify-between text-xs transition"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 transform transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4.5 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE REQUEST FORM MODAL */}
      <AnimatePresence>
        {hiringService && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-850 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 font-extrabold px-2 py-0.5 rounded uppercase">Creative Studio</span>
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mt-1">Hire Kelvin Jun</h3>
                  </div>
                  <button
                    onClick={() => setHiringService(null)}
                    className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full cursor-pointer text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs">
                  <p className="font-bold text-blue-600 dark:text-blue-400">Selected: {hiringService}</p>
                </div>

                <form onSubmit={handleServiceSubmit} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Describe Your Project / Objectives</label>
                    <textarea
                      placeholder="Tell us what you are trying to build or edit. Include timeline requirements or project details..."
                      value={hiringDetails}
                      onChange={(e) => setHiringDetails(e.target.value)}
                      required
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Your WhatsApp / Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +234 810..."
                      value={hiringPhone}
                      onChange={(e) => setHiringPhone(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-tr from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-850 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting request...' : 'Send Service Request'}</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
