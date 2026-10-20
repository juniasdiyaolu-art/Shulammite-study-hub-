import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Send, ThumbsUp, MessageSquare, Plus, Award, Hash, Flame, Sparkles, UserCheck } from 'lucide-react';
import { CommunityPost, User } from '../types.ts';

interface CommunityProps {
  user: User | null;
  posts: CommunityPost[];
  onPostCreated: (title: string, content: string, tags: string[]) => Promise<void>;
  onLikePost: (postId: number) => Promise<void>;
  onAddComment: (postId: number, comment: string) => Promise<void>;
  onLogin: () => void;
}

export default function Community({
  user,
  posts,
  onPostCreated,
  onLikePost,
  onAddComment,
  onLogin,
}: CommunityProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('CapCut');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const tagsList = ['CapCut', 'AI Web Design', 'AI Tools', 'Marketing', 'Inspiration', 'General'];

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLogin();
      return;
    }
    if (!title.trim() || !content.trim()) return;
    await onPostCreated(title, content, [selectedTag]);
    setTitle('');
    setContent('');
    setIsFormOpen(false);
  };

  const handlePostComment = async (postId: number) => {
    if (!user) {
      onLogin();
      return;
    }
    if (!commentInput.trim()) return;
    await onAddComment(postId, commentInput);
    setCommentInput('');
  };

  return (
    <div id="community-stage" className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans space-y-6 pb-20">
      
      {/* Banner / Title Row */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-display font-bold leading-tight">Creator Community Circle</h1>
          <p className="text-xs text-blue-100 leading-relaxed max-w-xl">
            Share your edits, showcase your newly built portfolio pages, ask code layout questions, join collaborative peer groups, and earn XP together!
          </p>
        </div>

        <button
          onClick={() => { if (!user) onLogin(); else setIsFormOpen(!isFormOpen); }}
          className="bg-white text-blue-700 hover:bg-slate-50 px-5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Start a Discussion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Feed list */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Add Post Form Accordion */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-md space-y-4 overflow-hidden"
              >
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Publish Creator Thread</h3>
                <form onSubmit={handleSubmitPost} className="space-y-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Provide a catchy discussion topic..."
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Scribble down your ideas, questions, or paste links to your project work here..."
                    required
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Category:</span>
                      <div className="flex flex-wrap gap-1">
                        {tagsList.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={`text-[9px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post to Feed (+15 XP)</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => {
                const likedByMe = user ? post.likes.includes(user.uid) : false;
                const isCommentsOpen = activeCommentId === post.id;

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    {/* Author block */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                          {post.userPhoto ? (
                            <img src={post.userPhoto} alt={post.userName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-display font-bold text-xs">
                              {post.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{post.userName}</span>
                            <div className="flex items-center space-x-0.5">
                              {post.badges.map((badge, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[8px] px-1 py-0.2 rounded font-extrabold uppercase ${
                                    badge === 'Admin' || badge === 'Mentor'
                                      ? 'bg-amber-500/10 text-amber-500'
                                      : 'bg-blue-500/10 text-blue-500'
                                  }`}
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Post tags */}
                      <div className="flex items-center space-x-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 px-2.5 py-0.5 rounded-lg"
                          >
                            <Hash className="w-2.5 h-2.5 mr-0.5 text-blue-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Main content body */}
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-display font-bold text-slate-850 dark:text-white">{post.title}</h2>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>

                    {/* Interactions buttons */}
                    <div className="flex items-center space-x-4 border-t border-slate-50 dark:border-slate-900 pt-3.5 text-xs text-slate-500">
                      <button
                        onClick={() => { if (!user) onLogin(); else onLikePost(post.id); }}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          likedByMe
                            ? 'bg-blue-500/10 text-blue-600 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${likedByMe ? 'fill-current' : ''}`} />
                        <span>{post.likes.length} Likes</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentId(isCommentsOpen ? null : post.id)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          isCommentsOpen ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length} Comments</span>
                      </button>
                    </div>

                    {/* Comments Loop block */}
                    {isCommentsOpen && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                        {post.comments.length > 0 && (
                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {post.comments.map((comment, i) => (
                              <div key={i} className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{comment.userName}</span>
                                  <span className="text-[8px] text-slate-400 font-mono">
                                    {new Date(comment.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Join the discussion, write comments..."
                            className="flex-grow bg-white dark:bg-slate-850 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-600"
                          />
                          <button
                            onClick={() => handlePostComment(post.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-850 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
                <Users className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400 mt-2">No threads on the bulletin board yet. Be the first to start a conversation!</p>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Weekly Creator challenges & Achievements */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Weekly Challenge Card */}
          <div className="bg-gradient-to-tr from-indigo-900 to-purple-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden space-y-3">
            <div className="bg-white/10 border border-white/10 p-2.5 rounded-xl w-fit text-amber-400 shadow-md">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md uppercase">Weekly Challenge</span>
              <h3 className="font-display font-bold text-sm mt-1.5">Viral Speed Ramp Reel 🎬</h3>
              <p className="text-[11px] text-slate-200 leading-relaxed mt-1">
                Edit a 15-second high-energy cinematic short inside CapCut, export it cleanly with high-quality presets, upload a Google Drive/Dropbox link in comments below! Kelvin will review live and award +500 XP to the winner.
              </p>
            </div>
            <div className="pt-2 flex items-center space-x-2 text-[10px] text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Submission Deadline: Sunday Midnight</span>
            </div>
            {/* Background glowing blob */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600/30 rounded-full blur-2xl" />
          </div>

          {/* Achievement Badges catalog */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md space-y-3.5">
            <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center">
              <Award className="w-4 h-4 mr-2 text-indigo-500" />
              Earnable Badges
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'First Post', desc: 'Publish a thread', color: 'bg-emerald-50 text-emerald-600 border-emerald-500/10' },
                { title: 'Master Editor', desc: 'Complete CapCut course', color: 'bg-blue-50 text-blue-600 border-blue-500/10' },
                { title: 'AI Pro', desc: 'Finish 2 AI courses', color: 'bg-indigo-50 text-indigo-600 border-indigo-500/10' },
                { title: 'Live Hero', desc: 'Attend Live webinar', color: 'bg-amber-50 text-amber-600 border-amber-500/10' },
              ].map((badge, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border flex flex-col text-center items-center justify-center space-y-1 ${badge.color}`}>
                  <span className="text-[10px] font-bold tracking-tight">{badge.title}</span>
                  <span className="text-[8px] text-slate-400 font-medium leading-tight">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Leaderboard preview */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center">
              <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
              Weekly Top Creators
            </h3>
            <div className="space-y-2.5">
              {[
                { rank: 1, name: 'Tunde Lawson', xp: '1,450 XP', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
                { rank: 2, name: 'Chioma Okafor', xp: '1,210 XP', photo: '' },
                { rank: 3, name: 'Adebayo Wale', xp: '980 XP', photo: '' },
              ].map((student, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-slate-400 w-3">{student.rank}</span>
                    <div className="w-7 h-7 rounded-lg bg-blue-100 overflow-hidden text-[10px] font-bold flex items-center justify-center text-white shrink-0">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{student.name}</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[10px]">{student.xp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
