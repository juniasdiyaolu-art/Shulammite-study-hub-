import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Settings, Laptop, Tv, Briefcase, BookText, Users, PlusCircle, CheckCircle, Trash2, Edit2, AlertCircle, Save } from 'lucide-react';
import { User, Course, LiveClass, DigitalProduct, BlogPost, ServiceRequest, SiteSettings } from '../types.ts';

interface AdminPanelProps {
  user: User;
  settings: SiteSettings;
  courses: Course[];
  liveClass: LiveClass | null;
  blogs: BlogPost[];
  serviceRequests: ServiceRequest[];
  students: User[];
  onUpdateSettings: (data: Partial<SiteSettings>) => Promise<void>;
  onAddCourse: (data: any) => Promise<void>;
  onDeleteCourse: (courseId: number) => Promise<void>;
  onAddLiveClass: (data: any) => Promise<void>;
  onPostLiveInteraction: (classId: number, data: any) => Promise<void>;
  onAddBlog: (data: any) => Promise<void>;
  onUpdateServiceStatus: (requestId: number, status: string) => Promise<void>;
}

export default function AdminPanel({
  user,
  settings,
  courses,
  liveClass,
  blogs,
  serviceRequests,
  students,
  onUpdateSettings,
  onAddCourse,
  onDeleteCourse,
  onAddLiveClass,
  onPostLiveInteraction,
  onAddBlog,
  onUpdateServiceStatus,
}: AdminPanelProps) {
  const [activePanel, setActivePanel] = useState<'settings' | 'courses' | 'webinar' | 'hiring' | 'blogs' | 'students'>('settings');

  // Local state for settings editing
  const [siteName, setSiteName] = useState(settings.brandName || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || '');
  const [heroSub, setHeroSub] = useState(settings.heroSubtitle || '');
  const [bio, setBio] = useState(settings.kelvinBio || '');
  const [photo, setPhoto] = useState(settings.kelvinPhoto || '');
  const [phone, setPhone] = useState(settings.phoneNumber || '');
  const [email, setEmail] = useState(settings.email || '');
  const [address, setAddress] = useState(settings.address || '');
  const [payment, setPayment] = useState(settings.paymentDetails || '');
  const [whatsapp, setWhatsapp] = useState(settings.socialLinks?.whatsapp || '');
  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram || '');
  const [youtube, setYoutube] = useState(settings.socialLinks?.youtube || '');
  const [tiktok, setTiktok] = useState(settings.socialLinks?.tiktok || '');

  // Local state for Course creation
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cDifficulty, setCDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [cDuration, setCDuration] = useState('3h 30m');
  const [cThumb, setCThumb] = useState('');

  // Local state for Live Webinar creation
  const [wTitle, setWTitle] = useState('');
  const [wDesc, setWDesc] = useState('');
  const [wDate, setWDate] = useState(new Date().toISOString().substring(0, 16));
  const [wStream, setWStream] = useState('');
  const [wAnnouncement, setWAnnouncement] = useState('');

  // Local state for Blog creation
  const [bTitle, setBTitle] = useState('');
  const [bCategory, setBCategory] = useState('CapCut');
  const [bContent, setBContent] = useState('');
  const [bThumb, setBThumb] = useState('');

  const [saving, setSaving] = useState(false);

  if (!user.isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white dark:bg-slate-850 p-8 rounded-3xl border border-rose-500/10 shadow-xl max-w-md mx-auto">
          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-display font-bold mt-4 text-slate-900 dark:text-white">Admin access forbidden</h2>
          <p className="text-xs text-slate-400 mt-2">Only the Super Admin (Kelvin) can modify configurations on this platform.</p>
        </div>
      </div>
    );
  }

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings({
        brandName: siteName,
        tagline,
        heroTitle,
        heroSubtitle: heroSub,
        kelvinBio: bio,
        kelvinPhoto: photo,
        phoneNumber: phone,
        email,
        address,
        paymentDetails: payment,
        socialLinks: { whatsapp, instagram, youtube, tiktok },
      });
      alert('Global settings updated successfully! 🚀');
    } catch (err) {
      alert('Failed to update settings!');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim() || !cDesc.trim()) return;
    try {
      await onAddCourse({
        title: cTitle,
        description: cDesc,
        difficulty: cDifficulty,
        duration: cDuration,
        thumbnail: cThumb || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        lessons: [
          { id: `${Date.now()}-l1`, title: 'Lesson 1: Introduction', duration: '10:00', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', notes: 'First introductory lecture content.' }
        ],
        downloadableResources: []
      });
      alert('Course added successfully with a default intro lesson! 🚀');
      setCTitle('');
      setCDesc('');
    } catch (err) {
      alert('Failed to add course.');
    }
  };

  const handleCreateWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wTitle.trim() || !wDesc.trim()) return;
    try {
      await onAddLiveClass({
        title: wTitle,
        description: wDesc,
        scheduledAt: new Date(wDate).toISOString(),
        youtubeUrl: wStream || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        polls: [
          { id: `poll-${Date.now()}`, question: 'Are you practicing editing?', options: ['Yes, every day', 'Sometimes', 'Not yet'], votes: { 'Yes, every day': 0, 'Sometimes': 0, 'Not yet': 0 }, active: true }
        ]
      });
      alert('Webinar scheduled with countdown! 🚀');
      setWTitle('');
      setWDesc('');
    } catch (err) {
      alert('Failed to add webinar.');
    }
  };

  const handlePostAnnouncement = async () => {
    if (!liveClass || !wAnnouncement.trim()) return;
    try {
      await onPostLiveInteraction(liveClass.id, {
        type: 'announcement',
        announcement: wAnnouncement,
      });
      alert('Pinned announcement broadcasted to Classroom board! 👋');
      setWAnnouncement('');
    } catch (err) {
      alert('Failed to post announcement.');
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bContent.trim()) return;
    try {
      await onAddBlog({
        title: bTitle,
        content: bContent,
        category: bCategory,
        thumbnail: bThumb || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        tags: [bCategory, 'Creator']
      });
      alert('Blog published! 📝');
      setBTitle('');
      setBContent('');
    } catch (err) {
      alert('Failed to publish blog.');
    }
  };

  return (
    <div id="admin-stage" className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans pb-20 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar Selector Navigation */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col space-y-1.5 h-fit">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 flex items-center">
          <Shield className="w-3.5 h-3.5 mr-1.5 text-rose-500 animate-pulse" />
          Super Admin Console
        </h3>

        {[
          { id: 'settings', name: 'Site Configuration', icon: Settings },
          { id: 'courses', name: 'Course Management', icon: Laptop },
          { id: 'webinar', name: 'Webinar Scheduler', icon: Tv },
          { id: 'hiring', name: 'Client Inquiries', icon: Briefcase },
          { id: 'blogs', name: 'Blog Publishing', icon: BookText },
          { id: 'students', name: 'Students Registry', icon: Users },
        ].map((panel) => {
          const Icon = panel.icon;
          return (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id as any)}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer ${
                activePanel === panel.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{panel.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form workspace */}
      <div className="lg:col-span-9 bg-white dark:bg-slate-850 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[450px]">
        
        {/* PANEL 1: Global Site settings */}
        {activePanel === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-display font-bold text-slate-850 dark:text-white">Global Configuration Controls</h2>
              <p className="text-[11px] text-slate-400">All contact info, payment accounts, tagline and display bios edited here update instantly on the Landing Page!</p>
            </div>

            <form onSubmit={handleUpdateBranding} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Platform Brand Name</label>
                  <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500" required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Tagline / Mission</label>
                  <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Hero Section Heading Title</label>
                  <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500" required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Hero Section Subtitle Description</label>
                  <input type="text" value={heroSub} onChange={(e) => setHeroSub(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Kelvin Junior Biography Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 resize-none" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Kelvin Photo url</label>
                  <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">WhatsApp Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Official Business Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Business Address Location</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Bank Payment details</label>
                  <input type="text" value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving changes...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PANEL 2: Course management */}
        {activePanel === 'courses' && (
          <div className="space-y-6 text-xs">
            <div>
              <h2 className="text-base font-display font-bold text-slate-850 dark:text-white">Course Registry Setup</h2>
              <p className="text-[11px] text-slate-400">Launch a new course curriculum with introductory modules. Or delete stale material.</p>
            </div>

            {/* Course Builder form */}
            <form onSubmit={handleCreateCourse} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Launch New Course</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Course Title..." value={cTitle} onChange={(e) => setCTitle(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                <input type="text" placeholder="Duration (e.g. 5h 30m)..." value={cDuration} onChange={(e) => setCDuration(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
              </div>
              <textarea placeholder="Write core marketing curriculum synopsis..." value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={3} className="w-full bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none resize-none" required />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={cDifficulty} onChange={(e) => setCDifficulty(e.target.value as any)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none">
                  <option value="Beginner">Beginner Difficulty</option>
                  <option value="Intermediate">Intermediate Difficulty</option>
                  <option value="Advanced">Advanced Difficulty</option>
                </select>
                <input type="text" placeholder="Thumbnail Unsplash URL..." value={cThumb} onChange={(e) => setCThumb(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" />
              </div>

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-1 cursor-pointer transition">
                <PlusCircle className="w-4 h-4" />
                <span>Launch Course</span>
              </button>
            </form>

            {/* Courses listing table */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Active Courses list ({courses.length})</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {courses.map((c) => (
                  <div key={c.id} className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs hover:shadow">
                    <div className="flex items-center space-x-2">
                      <div className="aspect-video w-12 bg-slate-100 rounded overflow-hidden">
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white leading-snug">{c.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.duration} • {c.difficulty}</p>
                      </div>
                    </div>
                    <button onClick={() => onDeleteCourse(c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PANEL 3: Live class Countdown */}
        {activePanel === 'webinar' && (
          <div className="space-y-6 text-xs">
            <div>
              <h2 className="text-base font-display font-bold text-slate-850 dark:text-white">Live Webinar Control Center</h2>
              <p className="text-[11px] text-slate-400">Schedule live streams, embed YouTube Live frame source keys, release active polls, and broadcast pinned announcements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Schedule form */}
              <form onSubmit={handleCreateWebinar} className="md:col-span-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Schedule Live Stream</h3>
                <input type="text" placeholder="Webinar Title..." value={wTitle} onChange={(e) => setWTitle(e.target.value)} className="w-full bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                <textarea placeholder="Summary of webinar details..." value={wDesc} onChange={(e) => setWDesc(e.target.value)} rows={2} className="w-full bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none resize-none" required />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="datetime-local" value={wDate} onChange={(e) => setWDate(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none text-[10px]" required />
                  <input type="text" placeholder="YouTube Embed URL..." value={wStream} onChange={(e) => setWStream(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none text-[10px]" />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition">
                  <span>Schedule stream</span>
                </button>
              </form>

              {/* Webinar interactions board */}
              <div className="md:col-span-6 space-y-4">
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
                  <h3 className="font-bold text-indigo-700 dark:text-indigo-300">Live Stream Broadcaster Board</h3>
                  {liveClass ? (
                    <div className="space-y-3">
                      <div className="text-[11px] leading-relaxed">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Active class: {liveClass.title}</p>
                        <p className="text-slate-400 font-mono mt-0.5">Scheduled: {new Date(liveClass.scheduledAt).toLocaleString()}</p>
                      </div>

                      {/* Announcement post input */}
                      <div className="space-y-1.5 border-t border-indigo-500/10 pt-3">
                        <textarea placeholder="Write a pinned announcement alert..." value={wAnnouncement} onChange={(e) => setWAnnouncement(e.target.value)} rows={2} className="w-full bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none resize-none" />
                        <button type="button" onClick={handlePostAnnouncement} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl transition cursor-pointer">
                          Broadcast Announcement
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No class is currently scheduled to stream.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PANEL 4: Services Orders */}
        {activePanel === 'hiring' && (
          <div className="space-y-6 text-xs">
            <div>
              <h2 className="text-base font-display font-bold text-slate-850 dark:text-white">Client Service Requests</h2>
              <p className="text-[11px] text-slate-400">Review all business inquiries submitted by clients who clicked "Hire Kelvin" to edit videos or consult AI solutions.</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {serviceRequests.length > 0 ? (
                serviceRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3 text-xs flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[9px] uppercase font-bold tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 px-2 py-0.5 rounded">
                          {req.serviceName}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white mt-1.5">Submitted by: {req.userName}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{req.details}</p>
                    <p className="font-bold text-[11px] text-slate-400">Contact WhatsApp/Call: {req.contactPhone}</p>

                    <div className="flex space-x-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <button onClick={() => onUpdateServiceStatus(req.id, 'Approved')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer transition">
                        Approve Inquire
                      </button>
                      <button onClick={() => onUpdateServiceStatus(req.id, 'Completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer transition">
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Briefcase className="w-10 h-10 mx-auto opacity-30 animate-pulse" />
                  <p className="mt-2">No client inquiries received yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 5: Blog publishing */}
        {activePanel === 'blogs' && (
          <div className="space-y-6 text-xs font-sans">
            <div>
              <h2 className="text-base font-display font-bold text-slate-850 dark:text-white">Academy Blog Publisher</h2>
              <p className="text-[11px] text-slate-400">Write helpful text tutorials for creators on CapCut editing patterns, AI workflows, or organic Instagram virality recipes.</p>
            </div>

            <form onSubmit={handleCreateBlog} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Article Title..." value={bTitle} onChange={(e) => setBTitle(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" required />
                <select value={bCategory} onChange={(e) => setBCategory(e.target.value)} className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none">
                  <option value="CapCut">CapCut Editing</option>
                  <option value="Website Building">Website Building</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Creator Economy">Creator Economy</option>
                </select>
              </div>

              <input type="text" placeholder="Banner Image URL..." value={bThumb} onChange={(e) => setBThumb(e.target.value)} className="w-full bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none" />

              <textarea placeholder="Write rich tutorial text. You can use markdown syntax standard line structures..." value={bContent} onChange={(e) => setBContent(e.target.value)} rows={6} className="w-full bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none resize-none leading-relaxed" required />

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-1 cursor-pointer transition">
                <span>Publish Article</span>
              </button>
            </form>
          </div>
        )}

        {/* PANEL 6: Students registry */}
        {activePanel === 'students' && (
          <div className="space-y-6 text-xs font-sans">
            <div>
              <h2 className="text-base font-display font-bold text-slate-850 dark:text-white">Active Student Ledger</h2>
              <p className="text-[11px] text-slate-400">View registered students, trace total score XP distributions, and track streaks.</p>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow transition-all duration-150">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 overflow-hidden text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                      {student.profilePhoto ? (
                        <img src={student.profilePhoto} alt={student.displayName || 'student'} className="w-full h-full object-cover" />
                      ) : (
                        (student.displayName || student.email).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white leading-snug">{student.displayName || student.email}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 dark:text-blue-400 font-mono">{student.xp} XP</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">Streak: {student.streak} Days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
