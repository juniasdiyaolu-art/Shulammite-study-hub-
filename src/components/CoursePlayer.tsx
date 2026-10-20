import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle, BookOpen, AlertCircle, FileText, ChevronLeft, Award, Save, Bookmark, BookmarkCheck, ArrowRight, Zap, Info } from 'lucide-react';
import { Course, Lesson, Enrollment } from '../types.ts';

interface CoursePlayerProps {
  course: Course;
  enrollment: Enrollment;
  onUpdateEnrollment: (enrollmentId: number, data: Partial<Enrollment>) => Promise<void>;
  onClose: () => void;
  userXp: number;
  onXpEarned: (amount: number) => void;
}

export default function CoursePlayer({
  course,
  enrollment,
  onUpdateEnrollment,
  onClose,
  userXp,
  onXpEarned,
}: CoursePlayerProps) {
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [quizState, setQuizState] = useState<{
    selectedAnswer: string | null;
    submitted: boolean;
    correct: boolean | null;
    showExplanation: boolean;
  }>({
    selectedAnswer: null,
    submitted: false,
    correct: null,
    showExplanation: false,
  });

  const activeLesson: Lesson = course.lessons[activeLessonIdx] || course.lessons[0];

  // Load saved note and reset quiz state on lesson switch
  useEffect(() => {
    if (activeLesson) {
      setNoteText(enrollment.savedNotes[activeLesson.id] || '');
      setQuizState({
        selectedAnswer: null,
        submitted: false,
        correct: null,
        showExplanation: false,
      });
    }
  }, [activeLessonIdx, enrollment, activeLesson]);

  const handleSaveNote = async () => {
    if (!activeLesson) return;
    setSavingNote(true);
    try {
      const updatedNotes = {
        ...enrollment.savedNotes,
        [activeLesson.id]: noteText,
      };
      await onUpdateEnrollment(enrollment.id, { savedNotes: updatedNotes });
    } catch (err) {
      console.error('Note save error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!activeLesson) return;
    try {
      let updatedBookmarks = [...enrollment.bookmarkedLessons];
      if (updatedBookmarks.includes(activeLesson.id)) {
        updatedBookmarks = updatedBookmarks.filter(id => id !== activeLesson.id);
      } else {
        updatedBookmarks.push(activeLesson.id);
      }
      await onUpdateEnrollment(enrollment.id, { bookmarkedLessons: updatedBookmarks });
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    
    // Add lesson id to bookmarked/completed track inside enrollment if not completed
    const currentProgress = enrollment.progress;
    const lessonWeight = Math.ceil(100 / course.lessons.length);
    const newProgress = Math.min(100, currentProgress + lessonWeight);
    const isCompleted = newProgress >= 100;

    try {
      await onUpdateEnrollment(enrollment.id, {
        progress: newProgress,
        completed: isCompleted,
      });
      onXpEarned(25); // 25 XP for completing a lesson!
    } catch (err) {
      console.error('Progress update failed:', err);
    }
  };

  const handleSubmitQuiz = () => {
    if (!activeLesson.quiz || quizState.submitted) return;
    const isCorrect = quizState.selectedAnswer === activeLesson.quiz.correctAnswer;
    setQuizState(prev => ({
      ...prev,
      submitted: true,
      correct: isCorrect,
      showExplanation: true,
    }));

    if (isCorrect) {
      onXpEarned(50); // Extra 50 XP for nailing the quiz first try!
    }
  };

  const isBookmarked = enrollment.bookmarkedLessons.includes(activeLesson?.id);

  return (
    <div id="course-player-stage" className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar: Curriculum List */}
      <div id="player-curriculum-sidebar" className="w-full md:w-80 bg-white dark:bg-slate-850 border-r border-slate-100 dark:border-slate-800 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        {/* Back header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 transition cursor-pointer font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Close Player</span>
          </button>
          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-1 rounded-lg">
            {enrollment.progress}% Completed
          </div>
        </div>

        {/* Course Details Card */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800/80">
          <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">{course.title}</h2>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center">
            <BookOpen className="w-3 h-3 mr-1" />
            {course.lessons.length} Lessons • {course.duration}
          </p>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${enrollment.progress}%` }} />
          </div>
        </div>

        {/* Lessons List Scroll */}
        <div className="flex-grow overflow-y-auto p-3 space-y-1 md:max-h-[calc(100vh-210px)]">
          {course.lessons.map((lesson, idx) => {
            const isActive = idx === activeLessonIdx;
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonIdx(idx)}
                className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-bold leading-tight line-clamp-2">{lesson.title}</p>
                  <p className={`text-[9px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {lesson.duration}
                  </p>
                </div>
                {idx < Math.floor((enrollment.progress / 100) * course.lessons.length) && (
                  <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stream Window & Tabs Content */}
      <div id="player-main-workspace" className="flex-grow p-4 md:p-6 overflow-y-auto h-auto md:h-screen space-y-5">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Title & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <div>
                <span className="text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  LESSON {activeLessonIdx + 1} OF {course.lessons.length}
                </span>
                <h1 className="text-lg md:text-xl font-display font-bold text-slate-900 dark:text-white mt-1.5">{activeLesson.title}</h1>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleToggleBookmark}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCompleteLesson}
                  className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Completed</span>
                </button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              <video
                src={activeLesson.videoUrl}
                controls
                className="w-full h-full object-cover"
                poster={course.thumbnail}
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-xl flex items-center space-x-1 border border-white/10">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Gain 25 XP on Completion</span>
              </div>
            </div>

            {/* Workspace split columns: Notes vs Practice resources */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Side: Lesson details, resources and quiz */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Info and Resources Card */}
                <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3.5">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center">
                    <Info className="w-4 h-4 mr-2 text-blue-600" />
                    Lesson Summary & Study notes
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {activeLesson.notes}
                  </p>

                  {course.downloadableResources.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson Resources</p>
                      <div className="mt-2 space-y-2">
                        {course.downloadableResources.map((res, i) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-blue-500/5 dark:bg-blue-400/5 hover:bg-blue-500/10 dark:hover:bg-blue-400/10 rounded-xl border border-blue-500/10 text-blue-600 dark:text-blue-400 transition"
                          >
                            <span className="text-xs font-bold flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              {res.name}
                            </span>
                            <span className="text-[9px] font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded font-bold uppercase">Download</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Quiz Module */}
                {activeLesson.quiz && (
                  <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center">
                        <Award className="w-4 h-4 mr-2 text-amber-500" />
                        Lesson Quiz Challenges
                      </h3>
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-1 rounded-lg">
                        Earn +50 XP
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {activeLesson.quiz.question}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {activeLesson.quiz.options.map((opt, i) => {
                        const isSelected = quizState.selectedAnswer === opt;
                        return (
                          <button
                            key={i}
                            disabled={quizState.submitted}
                            onClick={() => setQuizState(prev => ({ ...prev, selectedAnswer: opt }))}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                              quizState.submitted
                                ? opt === activeLesson.quiz?.correctAnswer
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold'
                                  : isSelected
                                    ? 'bg-red-500/10 border-red-500 text-red-600'
                                    : 'border-slate-100 dark:border-slate-800 text-slate-400'
                                : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/15 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {quizState.submitted && opt === activeLesson.quiz?.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {!quizState.submitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={!quizState.selectedAnswer}
                        className="w-full flex items-center justify-center space-x-1.5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        <span>Submit Answer</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <AnimatePresence>
                        {quizState.showExplanation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 text-[11px] leading-relaxed space-y-1.5"
                          >
                            <p className="font-bold flex items-center">
                              <AlertCircle className={`w-3.5 h-3.5 mr-1.5 ${quizState.correct ? 'text-emerald-500' : 'text-red-500'}`} />
                              <span>{quizState.correct ? 'CORRECT ANSWER! 🎉' : 'INCORRECT ANSWER'}</span>
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {activeLesson.quiz.explanation}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side: Markdown study notes pad */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center">
                      <Save className="w-4 h-4 mr-2 text-indigo-500" />
                      Personal Study Pad
                    </h3>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{savingNote ? 'Saving...' : 'Save Note'}</span>
                    </button>
                  </div>

                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Scribble down reminders, key insights, or code structures from Kelvin's slides here... Your note automatically saves to your student account."
                    className="w-full flex-grow min-h-[220px] bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none"
                  />

                  <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-start space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Your edits here are synchronised to your **Dashboard**. Open the Continuing Notes menu in your dashboard to download all notes at once!</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-300 animate-bounce" />
            <p className="mt-3 text-sm font-semibold">No lesson active. Please select a lesson from the curriculum sidebar!</p>
          </div>
        )}
      </div>

    </div>
  );
}
