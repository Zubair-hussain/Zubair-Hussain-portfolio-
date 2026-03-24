'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Star, Send, Sparkles, ShieldCheck, X, Eye, EyeOff, Lock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { validateEmail, hasProfanity } from '@/lib/ai';
import { notifyAdmin } from '@/lib/email';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Consolidated Dynamic 3D Scene to prevent HTML/R3F namespace conflicts
const GlobeScene = dynamic(() => import('@/components/3d/Globe').then(mod => {
  const { Globe } = mod;
  const { Canvas } = require('@react-three/fiber');
  return function SceneWrapper() {
    return (
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
         <Globe />
      </Canvas>
    );
  };
}), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black/20 animate-pulse rounded-full" />
});

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
  country: string;
  loveUrl?: string;
  approved: boolean;
  createdAt: Timestamp;
}

// ─── Hidden Admin Login Modal ───────────────────────────────────────────────
function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Only allow if email matches the admin env var
      if (result.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        await signOut(auth);
        setError('Access denied.');
        return;
      }
      onClose();
    } catch (err: any) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
              <Lock size={14} className="text-red-500" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40">
              Restricted Access
            </span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/40 outline-none transition-all placeholder:text-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:border-red-500/40 outline-none transition-all placeholder:text-white/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[9px] font-mono tracking-widest uppercase">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-white font-mono text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Authenticate'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Secret Trigger: Ctrl + Shift + A keyboard shortcut ─────────────────────
function useAdminShortcut(onTrigger: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        onTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger]);
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Testimonials() {
  const t = useTranslations('testimonials');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    email: '',
    agreed: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // Ctrl + Shift + A → open admin login (only if not already logged in)
  useAdminShortcut(() => { if (!isAdmin) setShowAdminModal(true); });

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Fetch approved reviews (and pending if admin)
  useEffect(() => {
    const q = isAdmin 
      ? query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'testimonials'), where('approved', '==', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      if (docs.length > 0) setReviews(docs);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (current >= reviews.length && reviews.length > 0) {
      setCurrent(0);
    }
  }, [reviews.length]);

  const next = useCallback(() => {
    if (reviews.length > 0) {
      setCurrent((c) => (c + 1) % reviews.length);
    }
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length > 0) {
      const timer = setInterval(next, 8000);
      return () => clearInterval(timer);
    }
  }, [next, reviews.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.text) newErrors.text = 'Message is required';
    if (!formData.agreed) newErrors.agreed = 'Agreement required';
    if (hasProfanity(formData.text)) newErrors.text = 'Please Keep it professional';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const docData = {
        name: formData.name,
        role: formData.role || 'Client',
        text: formData.text,
        email: formData.email,
        rating: 5,
        avatar: formData.name.substring(0, 2).toUpperCase(),
        country: '🌐',
        approved: false,
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'testimonials'), docData);
      await notifyAdmin('comment', docData);
      
      setSubmitted(true);
      setFormData({ name: '', role: '', text: '', email: '', agreed: false });
    } catch (err) {
      console.warn('Feedback Dispatch Failed:', err);
      setErrors({ submit: 'Failed to dispatch feedback.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="testimonials" ref={ref} className="py-24 md:py-32 lg:py-40 relative overflow-hidden bg-black">
      
      {/* HIDDEN ADMIN LOGIN MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <AdminLoginModal onClose={() => setShowAdminModal(false)} />
        )}
      </AnimatePresence>

      {/* 3D GLOBE BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-40 md:opacity-60 xl:opacity-80">
        <GlobeScene />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
          
          {/* LEFT: CONTENT & CAROUSEL */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-12 bg-red-600/50" />
              <p className="text-xs font-mono tracking-[0.5em] uppercase text-red-500 font-bold">
                {t('label')}
              </p>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic text-white mb-10 sm:mb-16 leading-[0.9]">
              {t('heading')}
            </h2>

            {/* Carousel */}
            <div className="relative min-h-[280px] sm:min-h-[320px] h-auto mb-8 sm:mb-12">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {reviews.length > 0 ? (
                      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 h-full flex flex-col justify-between shadow-2xl">
                        <div>
                          <div className="flex gap-1 mb-8">
                            {Array.from({ length: reviews[current]?.rating || 5 }).map((_, i) => (
                              <Star key={i} size={16} className="fill-red-600 text-red-600" />
                            ))}
                          </div>
                          <p className="text-base sm:text-xl md:text-2xl font-light italic leading-relaxed text-white/90">
                            &ldquo;{reviews[current]?.text}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-xl font-black italic text-white shadow-lg">
                                {reviews[current]?.avatar}
                              </div>
                              <div>
                                 <p className="text-base font-bold text-white uppercase tracking-tight">
                                   {reviews[current]?.name} {reviews[current]?.country}
                                 </p>
                                 <p className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">
                                   {reviews[current]?.role}
                                 </p>
                              </div>
                           </div>
                           
                           {reviews[current]?.loveUrl && (
                             <a 
                               href={reviews[current]?.loveUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-4 bg-white/5 hover:bg-red-600/20 rounded-2xl text-red-500 transition-all border border-white/5 hover:border-red-500/30"
                               aria-label="View Project"
                             >
                                <Sparkles size={20} />
                             </a>
                           )}
                           
                           {/* Admin Controls — only visible when logged in as admin */}
                           {isAdmin && (
                             <div className="flex items-center gap-2">
                               {!reviews[current]?.approved && (
                                 <button 
                                   onClick={async () => {
                                     await updateDoc(doc(db, 'testimonials', reviews[current].id), { approved: true });
                                   }}
                                   className="px-4 py-2 bg-green-600/20 border border-green-600/40 rounded-xl text-green-500 text-[10px] font-mono uppercase tracking-widest hover:bg-green-600/30 transition-all"
                                 >
                                   Approve
                                 </button>
                               )}
                               <button 
                                 onClick={async () => {
                                   await deleteDoc(doc(db, 'testimonials', reviews[current].id));
                                 }}
                                 className="p-3 bg-red-600/10 hover:bg-red-600/20 rounded-xl text-red-500 transition-all border border-transparent hover:border-red-500/30"
                               >
                                 <X size={16} />
                               </button>
                             </div>
                           )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-14 h-full flex items-center justify-center">
                        <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest">Awaiting collaborations...</p>
                      </div>
                    )}
                  </motion.div>
               </AnimatePresence>
            </div>
            
            {/* Pagination Lines */}
            <div className="flex gap-3">
               {reviews.map((_, i) => (
                 <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1 transition-all duration-700 rounded-full ${i === current ? 'w-16 bg-red-600' : 'w-4 bg-white/10'}`}
                 />
               ))}
            </div>

            {/* Admin Session Bar — only visible when logged in */}
            {isAdmin && (
              <div className="mt-8 p-4 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Admin Control Panel</span>
                <button 
                  onClick={() => signOut(auth)} 
                  className="text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest underline"
                >
                  Exit Session
                </button>
              </div>
            )}
          </motion.div>

          {/* RIGHT: FORM */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative"
          >
             <div className="bg-black/40 border border-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-10">
                   {submitted ? 'Mission Logged' : 'Leave your mark'}
                </h3>
                
                {submitted ? (
                  <div className="py-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mx-auto">
                      <Send size={24} className="text-red-600" />
                    </div>
                    <p className="text-sm font-mono text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                      Your words have been encrypted and sent for verification. <br/>Admin approval pending.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-400 underline underline-offset-8"
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 ml-1">Identity</label>
                          <input 
                            type="text" 
                            placeholder="Your Name" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className={`w-full bg-white/[0.03] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all`} 
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 ml-1">Email</label>
                          <input 
                            type="email" 
                            placeholder="your@email.com" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className={`w-full bg-white/[0.03] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all`} 
                          />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 ml-1">Arena (Role/Company)</label>
                        <input 
                          type="text" 
                          placeholder="CEO, TechStart" 
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all" 
                        />
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 ml-1">Mission Details</label>
                        <textarea 
                          rows={4} 
                          placeholder="Describe the impact of our collaboration..." 
                          value={formData.text}
                          onChange={e => setFormData({...formData, text: e.target.value})}
                          className={`w-full bg-white/[0.03] border ${errors.text ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all resize-none`} 
                        />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative mt-1">
                          <input 
                            type="checkbox" 
                            checked={formData.agreed}
                            onChange={e => setFormData({...formData, agreed: e.target.checked})}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border ${formData.agreed ? 'bg-red-600 border-red-600' : 'border-white/20'} transition-all`} />
                          {formData.agreed && <ShieldCheck size={12} className="absolute inset-0 m-auto text-white" />}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">
                          I agree to the terms and data privacy conditions.
                        </span>
                      </label>
                      {errors.agreed && <p className="text-red-500 text-[9px] font-mono tracking-widest uppercase">{errors.agreed}</p>}
                      {errors.submit && <p className="text-red-500 text-[9px] font-mono tracking-widest uppercase">{errors.submit}</p>}
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-[2rem] text-white font-mono text-[10px] uppercase tracking-[0.4em] font-bold shadow-[0_10px_30px_rgba(200,20,30,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={14} />
                            Dispatch Feedback
                          </>
                        )}
                    </button>
                  </form>
                )}
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}