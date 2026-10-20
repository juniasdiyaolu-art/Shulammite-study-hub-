import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Tag, Filter, CheckCircle, Download, X, HelpCircle, Star, Sparkles, FileDown } from 'lucide-react';
import { DigitalProduct, User } from '../types.ts';

interface DigitalStoreProps {
  user: User | null;
  products: DigitalProduct[];
  onLogin: () => void;
}

export default function DigitalStore({
  user,
  products,
  onLogin,
}: DigitalStoreProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeProduct, setActiveProduct] = useState<DigitalProduct | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const productTypes = ['All', 'Preset', 'Template', 'Prompt Pack', 'Website Template', 'E-book'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'All' || p.type.toLowerCase() === selectedType.toLowerCase() || (selectedType === 'Website Template' && p.type.toLowerCase() === 'website template');
    return matchesSearch && matchesType;
  });

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'CREATIVE50' || couponCode.toUpperCase() === 'KELVIN50') {
      setDiscountApplied(true);
      setDiscountPercent(50);
    } else {
      alert('Invalid coupon code! Try "CREATIVE50" for 50% discount!');
    }
  };

  const handleSimulatePurchase = () => {
    if (!user) {
      onLogin();
      return;
    }
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      setActiveProduct(null);
      setDiscountApplied(false);
      setCouponCode('');
    }, 4000);
  };

  return (
    <div id="store-stage" className="max-w-7xl mx-auto px-4 py-6 md:py-10 font-sans space-y-6 pb-20">
      
      {/* Banner board */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10 max-w-xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg uppercase">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Digital Asset Hub</span>
          </span>
          <h1 className="text-xl md:text-3xl font-display font-bold leading-tight">Elite Digital Creator Assets</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Download professional CapCut transition packs, ready-made timeline templates, ChatGPT marketing prompt manuals, and high-conversion landing page layouts.
          </p>
        </div>

        {/* Coupon spotlight board */}
        <div className="bg-white/5 border border-white/10 p-4.5 rounded-2xl relative z-10 text-center min-w-[200px] shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIMITED DISCOUNT</p>
          <p className="text-sm font-bold text-amber-400 mt-0.5">Get 50% OFF Assets!</p>
          <div className="mt-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold tracking-wider text-white">
            CREATIVE50
          </div>
        </div>

        {/* Decorative ambient bubble */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Search Input bar */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, presets, prompts..."
            className="w-full bg-slate-50 dark:bg-slate-900 text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* Category Filters horizontal scroll */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto shrink-0 pb-1">
          {productTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer font-sans ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'All' ? <Filter className="w-3.5 h-3.5 inline mr-1" /> : null}
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Products Bento List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group"
            >
              {/* Product Thumbnail */}
              <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                <img
                  src={p.thumbnail}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/10 uppercase font-mono">
                  {p.type}
                </span>
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow">
                  ${p.price.toFixed(2)}
                </div>
              </div>

              {/* Product Info content */}
              <div className="p-4.5 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-xs text-slate-850 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
                </div>

                {/* Rating and triggers */}
                <div className="flex items-center justify-between pt-1.5">
                  <div className="flex items-center space-x-1 text-[10px] text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{p.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-medium">({p.reviewsCount} reviews)</span>
                  </div>
                  <button
                    onClick={() => setActiveProduct(p)}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-850 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
            <p className="text-xs text-slate-400 mt-2">No items matching your exact search filters right now.</p>
          </div>
        )}
      </div>

      {/* Product Details & Checkout modal */}
      <AnimatePresence>
        {activeProduct && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-850 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800/80"
            >
              {/* Product image detail */}
              <div className="aspect-video w-full bg-slate-150 relative">
                <img src={activeProduct.thumbnail} alt={activeProduct.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => { setActiveProduct(null); setDiscountApplied(false); setCouponCode(''); }}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-xl font-mono uppercase">
                  {activeProduct.type}
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">{activeProduct.name}</h2>
                  <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{activeProduct.rating}</span>
                    <span className="text-slate-400 font-medium">({activeProduct.reviewsCount} verified downloads)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProduct.description}
                </p>

                {/* Billing Coupon box */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Regular Price:</span>
                    <span className={`font-mono font-bold ${discountApplied ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      ${activeProduct.price.toFixed(2)}
                    </span>
                  </div>

                  {discountApplied && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                      <span>Promo Coupon Applied:</span>
                      <span className="font-mono">
                        -${(activeProduct.price * (discountPercent / 100)).toFixed(2)} ({discountPercent}% Off)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-white">
                    <span>Final Amount:</span>
                    <span className="font-mono text-sm">
                      ${discountApplied ? (activeProduct.price * (1 - discountPercent / 100)).toFixed(2) : activeProduct.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Coupon Input */}
                  {!discountApplied ? (
                    <div className="flex space-x-2 pt-1.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Apply promo code..."
                        className="flex-grow bg-white dark:bg-slate-850 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 uppercase focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center pt-1.5">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Coupon code accepted!
                    </p>
                  )}
                </div>

                {/* Purchase triggering button */}
                <div className="pt-2">
                  {downloadSuccess ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4 animate-bounce" />
                      <span>Downloading Assets Package...</span>
                    </motion.div>
                  ) : (
                    <button
                      onClick={handleSimulatePurchase}
                      className="w-full bg-gradient-to-tr from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Purchase & Direct Download</span>
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 flex items-start space-x-1 leading-relaxed justify-center pt-1">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Purchasing instantly activates a raw zip file download stream to your browser.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
