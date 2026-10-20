import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookText, Search, Filter, BookOpen, ChevronLeft, Calendar, User, ArrowRight, Share2, Sparkles, BookMarked } from 'lucide-react';
import { BlogPost } from '../types.ts';

interface BlogProps {
  posts: BlogPost[];
}

export default function Blog({ posts }: BlogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const categories = ['All', 'CapCut', 'Website Building', 'AI Tools', 'Marketing', 'Creator Economy'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleShare = (postTitle: string) => {
    if (navigator.share) {
      navigator.share({
        title: postTitle,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div id="blog-stage" className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans space-y-6 pb-20">
      
      <AnimatePresence mode="wait">
        {!activePost ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Banner board */}
            <div className="bg-gradient-to-tr from-violet-950 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-1.5 relative z-10 max-w-xl">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold rounded-lg uppercase">
                  <BookText className="w-3.5 h-3.5" />
                  <span>Tutorials Catalog</span>
                </span>
                <h1 className="text-xl md:text-3xl font-display font-bold leading-tight font-sans">The Creator's Academy Blog</h1>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Read step-by-step written blueprints written by Kelvin Junior, targeting CapCut mobile hacks, AI website setups, online funnel architecture, and productivity tactics.
                </p>
              </div>

              {/* Spotlight info */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative z-10 text-center min-w-[200px] shrink-0 font-sans text-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LATEST RESOURCE</p>
                <p className="text-sm font-bold text-amber-400 mt-1">Free Creator Guides!</p>
                <p className="text-[10px] text-slate-300 mt-1">Updated weekly for students.</p>
              </div>

              {/* Ambient visual bubble */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles, tactics, categories..."
                  className="w-full bg-slate-50 dark:bg-slate-900 text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto shrink-0 pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer font-sans ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300 group"
                  >
                    <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/10 uppercase">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3.5 flex-grow flex flex-col justify-between font-sans">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1" /> {post.author}</span>
                        </div>
                        <h2 className="text-sm font-display font-bold text-slate-850 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {post.content.replace(/[#*`]/g, '')}
                        </p>
                      </div>

                      <button
                        onClick={() => setActivePost(post)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1 hover:space-x-2 transition-all pt-2.5 border-t border-slate-50 dark:border-slate-800/80 cursor-pointer"
                      >
                        <span>Read article</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white dark:bg-slate-850 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
                  <BookText className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 mt-2">No matching guides found. Try typing another search term!</p>
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto bg-white dark:bg-slate-850 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-6 font-sans"
          >
            {/* Header / Back */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                onClick={() => setActivePost(null)}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 transition cursor-pointer font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Catalog</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleShare(activePost.title)}
                  title="Share article"
                  className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-xl transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title block */}
            <div className="space-y-3">
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">
                {activePost.category}
              </span>
              <h1 className="text-xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                {activePost.title}
              </h1>
              <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-1 border-y border-slate-50 dark:border-slate-800 py-2">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-blue-500" /> {new Date(activePost.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center"><User className="w-4 h-4 mr-1.5 text-blue-500" /> Written by {activePost.author}</span>
              </div>
            </div>

            {/* Banner image */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow">
              <img src={activePost.thumbnail} alt={activePost.title} className="w-full h-full object-cover" />
            </div>

            {/* Markdown Content Block */}
            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
              {activePost.content}
            </div>

            {/* Footer newsletter recommendation */}
            <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-2 pt-4">
              <h4 className="font-display font-bold text-xs text-blue-800 dark:text-blue-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-500 animate-pulse" />
                Want more creator blueprints directly?
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Join our private WhatsApp group for immediate notifications, daily prompt files, and video edits alerts from Kelvin Junior!
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
