import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, BookOpen, Award, FileText, Bookmark, Calendar, Flame, Zap, Camera, CheckCircle, ChevronRight, FileDown } from 'lucide-react';
import { User as AppUser, Course, Enrollment } from '../types.ts';

interface DashboardProps {
  user: AppUser;
  courses: Course[];
  enrollments: Enrollment[];
  onStartLearning: (courseId: number) => void;
  onUpdateProfile: (name: string, photo: string) => Promise<void>;
}

export default function Dashboard({
  user,
  courses,
  enrollments,
  onStartLearning,
  onUpdateProfile,
}: DashboardProps) {
  const [nameInput, setNameInput] = useState(user.displayName || '');
  const [photoInput, setPhotoInput] = useState(user.profilePhoto || '');
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Link course records to student enrollments
  const enrichedEnrollments = enrollments.map((enroll) => {
    const course = courses.find((c) => c.id === enroll.courseId);
    return { ...enroll, course };
  }).filter((e) => e.course !== undefined);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await onUpdateProfile(nameInput, photoInput);
      setEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Compile all user's notes into a downloadable markdown file
  const handleDownloadNotes = () => {
    let mdContent = `# aggregated Study Notes - ${user.displayName || user.email}\nGenerated on ${new Date().toLocaleDateString()}\n\n`;
    
    enrichedEnrollments.forEach((e) => {
      mdContent += `## Course: ${e.course?.title}\n`;
      const noteKeys = Object.keys(e.savedNotes);
      if (noteKeys.length === 0) {
        mdContent += `*No notes recorded yet.*\n\n`;
        return;
      }
      noteKeys.forEach((lessonId) => {
        const lesson = e.course?.lessons.find((l) => l.id === lessonId);
        mdContent += `### Lesson: ${lesson?.title || lessonId}\n`;
        mdContent += `${e.savedNotes[lessonId]}\n\n`;
      });
      mdContent += `***\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Kelvin_Creator_Hub_Notes.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="student-dashboard-stage" className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans space-y-6 pb-20">
      
      {/* Top Profile Summary Panel */}
      <div className="bg-white dark:bg-slate-850 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* User profile picture & name */}
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-blue-100 border-2 border-white dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-display font-bold text-2xl">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl border border-white dark:border-slate-850 shadow cursor-pointer transition"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg md:text-2xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                {user.displayName || 'Welcome Creator!'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">Level {Math.floor(user.xp / 100) + 1} Creator • {user.email}</p>
          </div>
        </div>

        {/* Gamified counters row */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center min-w-[100px] flex flex-col items-center justify-center">
            <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
            <span className="text-xs text-slate-400 mt-1 font-semibold">Study Streak</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white font-mono mt-0.5">{user.streak} Days</span>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center min-w-[100px] flex flex-col items-center justify-center">
            <Zap className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-slate-400 mt-1 font-semibold">Total Score</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white font-mono mt-0.5">{user.xp} XP</span>
          </div>
        </div>

      </div>

      {/* Profile edit toggle box */}
      {editing && (
        <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/80 max-w-xl">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Edit Profile credentials</h3>
          <form onSubmit={handleProfileSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your display name..."
                required
                className="bg-white dark:bg-slate-850 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
              />
              <input
                type="url"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="Avatar picture URL link..."
                className="bg-white dark:bg-slate-850 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none col-span-1"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                {updating ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Enrolled study paths */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
            My Active Courses
          </h3>

          <div className="space-y-4">
            {enrichedEnrollments.length > 0 ? (
              enrichedEnrollments.map((enroll) => {
                const c = enroll.course!;
                return (
                  <div
                    key={enroll.id}
                    className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow duration-200"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="aspect-video w-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{c.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.lessonsCount} lessons player • {c.difficulty}</p>
                        
                        {/* Inline progress display */}
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-24 bg-slate-100 dark:bg-slate-850 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: `${enroll.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 font-mono">{enroll.progress}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartLearning(c.id)}
                      className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition shadow-md shadow-blue-500/10"
                    >
                      <span>Continue Study</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-850 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">You haven't enrolled in any courses yet. Go back to browse courses and start learning!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Notes catalog, certificates earned */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notes summary pad */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-3">
              <h3 className="font-display font-bold text-xs text-slate-850 dark:text-white flex items-center">
                <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                Aggregated Notes Logs
              </h3>
              {enrichedEnrollments.some(e => Object.keys(e.savedNotes).length > 0) && (
                <button
                  onClick={handleDownloadNotes}
                  className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {enrichedEnrollments.some(e => Object.keys(e.savedNotes).length > 0) ? (
                enrichedEnrollments.map((e) => {
                  const noteKeys = Object.keys(e.savedNotes);
                  if (noteKeys.length === 0) return null;
                  return (
                    <div key={e.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{e.course?.title}</p>
                      <p className="text-slate-400 font-medium font-mono">{noteKeys.length} lesson logs recorded</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No notes written inside the player yet!</p>
              )}
            </div>
          </div>

          {/* Certificates panel */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-xs text-slate-850 dark:text-white flex items-center border-b border-slate-50 dark:border-slate-800 pb-3">
              <Award className="w-4 h-4 mr-2 text-amber-500" />
              Verified Certificates
            </h3>

            <div className="space-y-3">
              {enrichedEnrollments.filter(e => e.completed && e.certificateId).length > 0 ? (
                enrichedEnrollments.filter(e => e.completed && e.certificateId).map((e) => (
                  <div key={e.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5 text-[10px]">
                    <p className="font-bold text-slate-700 dark:text-slate-300">{e.course?.title} Certificate</p>
                    <p className="text-slate-400 font-mono">Verification ID: {e.certificateId}</p>
                    <button
                      onClick={() => alert(`Verified Certificate ID: ${e.certificateId}. You can save this code for LinkedIn or print the full certificate from the desktop player!`)}
                      className="text-blue-600 hover:underline font-bold flex items-center"
                    >
                      <Award className="w-3.5 h-3.5 mr-1" /> Verify Certificate
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No certificates claimed yet. Complete 100% of any course to receive yours instantly!</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
