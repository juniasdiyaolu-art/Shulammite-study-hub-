import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Clock, Users, Send, ThumbsUp, PlusCircle, CheckCircle, Award, Volume2, FileDown, Flame, AlertCircle, HelpCircle } from 'lucide-react';
import { LiveClass, ChatMessage, Poll, QaItem, User } from '../types.ts';

interface LiveClassroomProps {
  user: User | null;
  liveClass: LiveClass | null;
  onPostInteraction: (classId: number, data: any) => Promise<LiveClass | null>;
  onRegister: (classId: number) => Promise<LiveClass | null>;
  onLogin: () => void;
}

export default function LiveClassroom({
  user,
  liveClass,
  onPostInteraction,
  onRegister,
  onLogin,
}: LiveClassroomProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'polls'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [qaInput, setQaInput] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [registered, setRegistered] = useState(false);
  const [isClassActive, setIsClassActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state on mount and update
  useEffect(() => {
    if (liveClass && user) {
      setRegistered(liveClass.registeredUsers.includes(user.uid));
    }
  }, [liveClass, user]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveClass?.chatMessages, activeTab]);

  // Handle countdown
  useEffect(() => {
    if (!liveClass) return;

    const timer = setInterval(() => {
      const scheduledTime = new Date(liveClass.scheduledAt).getTime();
      const now = new Date().getTime();
      const difference = scheduledTime - now;

      if (difference <= 0) {
        setIsClassActive(true);
        setTimeLeft('LIVE');
        clearInterval(timer);
      } else {
        setIsClassActive(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        let timeStr = '';
        if (days > 0) timeStr += `${days}d `;
        timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeLeft(timeStr);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [liveClass]);

  if (!liveClass) {
    return (
      <div id="no-class-stage" className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white dark:bg-slate-850 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl max-w-lg mx-auto">
          <Tv className="w-16 h-16 text-slate-300 mx-auto animate-pulse" />
          <h2 className="text-xl font-display font-bold mt-5 text-slate-850 dark:text-white">Classroom is currently idle</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            There are no live webinars scheduled for this exact moment. Kelvin Junior will broadcast notifications, schedule countdowns, and upload slides here once the next intensive launches!
          </p>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!user) {
      onLogin();
      return;
    }
    const updated = await onRegister(liveClass.id);
    if (updated) {
      setRegistered(true);
    }
  };

  const handleSendChat = async () => {
    if (!user) {
      onLogin();
      return;
    }
    if (!chatInput.trim()) return;
    const currentMsg = chatInput;
    setChatInput('');
    await onPostInteraction(liveClass.id, {
      type: 'chat',
      message: currentMsg,
    });
  };

  const handleSendQa = async () => {
    if (!user) {
      onLogin();
      return;
    }
    if (!qaInput.trim()) return;
    const currentQa = qaInput;
    setQaInput('');
    await onPostInteraction(liveClass.id, {
      type: 'qa',
      qaText: currentQa,
    });
  };

  const handleVotePoll = async (pollId: string, option: string) => {
    if (!user) {
      onLogin();
      return;
    }
    await onPostInteraction(liveClass.id, {
      type: 'vote',
      pollId,
      option,
    });
  };

  const handleMarkAttendance = async () => {
    if (!user) {
      onLogin();
      return;
    }
    await onPostInteraction(liveClass.id, {
      type: 'attendance',
    });
  };

  return (
    <div id="live-classroom-stage" className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans space-y-6 pb-20">
      
      {/* Title block & Action board */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 p-6 md:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl relative z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg uppercase animate-pulse">
            <Tv className="w-3.5 h-3.5" />
            <span>{isClassActive ? 'LIVE SESSION' : 'UPCOMING'}</span>
          </span>
          <h1 className="text-xl md:text-3xl font-display font-bold leading-tight">{liveClass.title}</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{liveClass.description}</p>
        </div>

        {/* Dynamic Countdown clock panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4.5 border border-white/10 flex flex-col items-center justify-center min-w-[200px] shrink-0 text-center relative z-10 shadow-lg">
          <Clock className="w-5 h-5 text-amber-400 mb-1 animate-spin-slow" />
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Starts In</p>
          <p className="text-xl md:text-2xl font-mono font-bold text-amber-300 tracking-wider mt-1">{timeLeft}</p>
          
          {!isClassActive && (
            <button
              onClick={handleRegister}
              disabled={registered}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                registered
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 shadow-none'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-400/10'
              }`}
            >
              {registered ? '✓ Seat Registered' : 'Reserve My Seat'}
            </button>
          )}
        </div>

        {/* Decorative background visual blob */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Main split work space: Video Feed vs Interactions panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Broadcast embed & instructor announcements */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main stream box */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md">
            {isClassActive ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={liveClass.youtubeUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video w-full relative bg-slate-900 flex flex-col items-center justify-center text-center text-slate-400 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80')` }} />
                <div className="relative z-10 space-y-4 max-w-md">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-2xl">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Broadcast hasn't started yet</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      This classroom will connect directly to Kelvin's YouTube Live feed as soon as the scheduled broadcast starts! Make sure you are registered to receive immediate WhatsApp notifications.
                    </p>
                  </div>
                  {user && (
                    <button
                      onClick={handleMarkAttendance}
                      className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Check In Attendance (+50 XP)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Broadcast control bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center">
                <Users className="w-4 h-4 text-blue-600 mr-2" />
                <span>{liveClass.registeredUsers.length} creators registered to attend</span>
              </p>
              {liveClass.resources.length > 0 && (
                <div className="flex items-center space-x-2">
                  {liveClass.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition font-semibold"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>{res.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Announcements Board from Kelvin */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center">
              <Volume2 className="w-4 h-4 mr-2 text-indigo-500" />
              Pinned Announcements
            </h3>
            <div className="space-y-3">
              {liveClass.teacherAnnouncements.length > 0 ? (
                liveClass.teacherAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">{ann.text}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                        Posted on {new Date(ann.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No pinned alerts for today's session!</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Chat, Q&A, and Polls Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-850 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md flex flex-col h-[520px] overflow-hidden">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
            {(['chat', 'qa', 'polls'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-grow text-center py-3.5 border-b-2 uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'qa' ? 'Q&A' : tab}
              </button>
            ))}
          </div>

          {/* Active Tab Body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {activeTab === 'chat' && (
              <div className="space-y-3 h-full flex flex-col justify-between">
                <div className="flex-grow overflow-y-auto space-y-3 pr-1 max-h-[350px]">
                  {liveClass.chatMessages.length > 0 ? (
                    liveClass.chatMessages.map((msg) => (
                      <div key={msg.id} className="text-xs flex flex-col">
                        <span className="font-bold text-slate-500 dark:text-slate-400">{msg.sender}</span>
                        <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {msg.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-10">
                      <Flame className="w-8 h-8 text-slate-300 mb-1" />
                      <p className="text-[10px]">Chat is empty. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input block */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                  className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type to chat..."
                    className="flex-grow bg-slate-50 dark:bg-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="flex-grow overflow-y-auto space-y-3 pr-1 max-h-[350px]">
                  {liveClass.qa.length > 0 ? (
                    liveClass.qa.map((qa) => (
                      <div key={qa.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-500 dark:text-slate-400">{qa.askedBy}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${qa.answered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {qa.answered ? 'Answered ✓' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{qa.question}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-slate-400 py-10">
                      <HelpCircle className="w-8 h-8 text-slate-300 mb-1" />
                      <p className="text-[10px]">No questions yet. Ask anything!</p>
                    </div>
                  )}
                </div>

                {/* QA input block */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendQa(); }}
                  className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-3"
                >
                  <input
                    type="text"
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow bg-slate-50 dark:bg-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'polls' && (
              <div className="space-y-4">
                {liveClass.polls.length > 0 ? (
                  liveClass.polls.map((poll) => {
                    const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                    return (
                      <div key={poll.id} className="text-xs p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <p className="font-bold text-slate-800 dark:text-white">{poll.question}</p>
                        
                        <div className="space-y-2">
                          {poll.options.map((opt, i) => {
                            const votes = poll.votes[opt] || 0;
                            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                            return (
                              <button
                                key={i}
                                disabled={!poll.active}
                                onClick={() => handleVotePoll(poll.id, opt)}
                                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-500/5 hover:border-blue-500/20 transition cursor-pointer relative overflow-hidden"
                              >
                                <div className="absolute inset-y-0 left-0 bg-blue-500/5 transition-all" style={{ width: `${pct}%` }} />
                                <div className="relative z-10 flex items-center justify-between font-medium">
                                  <span>{opt}</span>
                                  <span className="font-bold text-blue-600 dark:text-blue-400">{pct}% ({votes})</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400 py-10">
                    <Award className="w-8 h-8 text-slate-300 mb-1" />
                    <p className="text-[10px]">No active polls from Kelvin Junior at this time!</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
