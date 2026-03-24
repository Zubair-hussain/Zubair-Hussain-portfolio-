'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MapPin, Briefcase, Calendar, ShieldCheck } from 'lucide-react';
import { suggestTimeline, validateEmail, hasProfanity } from '@/lib/ai';
import { sendEmail } from '@/lib/email';
import { Turnstile } from '@marsidev/react-turnstile';

interface HireMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: { title: string; price: string; category: string } | null;
}

export default function HireMeModal({ isOpen, onClose, preselectedService }: HireMeModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    category: 'web',
    details: '',
    agreed: false,
    selectedService: '',
    selectedPrice: '',
    turnstileToken: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill from service selection
  useEffect(() => {
    if (isOpen && preselectedService) {
      setFormData(prev => ({
        ...prev,
        category: preselectedService.category,
        selectedService: preselectedService.title,
        selectedPrice: preselectedService.price,
      }));
    }
    if (isOpen) {
      setStep(1);
      setAiSuggestion(null);
    }
  }, [isOpen, preselectedService]);

  useEffect(() => {
    if (step === 3 && formData.category && formData.location) {
      getAiSuggestion();
    }
  }, [step]);

  const getAiSuggestion = async () => {
    setLoading(true);
    const suggestion = await suggestTimeline(formData.category, formData.location);
    setAiSuggestion(suggestion);
    setLoading(false);
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required';
      if (!formData.location) newErrors.location = 'Location is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      setErrors({ agreed: 'You must agree to the terms' });
      return;
    }
    if (hasProfanity(formData.details)) {
      setErrors({ details: 'Please keep it professional' });
      return;
    }

    setLoading(true);
    try {
      await sendEmail({
        from_name: formData.name,
        from_email: formData.email,
        location: formData.location,
        category: formData.category,
        message: formData.details,
        suggested_timeline: aiSuggestion,
        selected_service: formData.selectedService || 'Not specified',
        selected_price: formData.selectedPrice || 'Not specified',
      });
      setStep(4); // Success step
    } catch (error: any) {
      console.warn('Submission Failed:', error);
      // Show error message in the UI without changing layout
      setErrors({ 
        ...errors, 
        submit: error?.text || 'Failed to send message. Please try again or contact directly.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0b] border border-white/5 rounded-2xl sm:rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            data-lenis-prevent="true"
          >
            {/* Header - unchanged */}
            <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/10 rounded-xl text-red-500">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">Hire me</h3>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Step {step} of 3</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full bg-white/[0.03] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all`}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="Professional Email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className={`w-full bg-white/[0.03] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all`}
                      />
                    </div>
                    <div className="relative flex items-center">
                      <MapPin size={16} className="absolute left-6 text-white/20" />
                      <input 
                        type="text" 
                        placeholder="Your Location (e.g. USA, London)"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className={`w-full bg-white/[0.03] border ${errors.location ? 'border-red-500/50' : 'border-white/10'} rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all`}
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-mono text-[10px] uppercase tracking-[0.4em] font-bold shadow-[0_10px_30px_rgba(200,20,30,0.3)] transition-all"
                  >
                    Proceed to Project
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  
                  {formData.selectedService && (
                    <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 sm:p-5 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-red-500/60 mb-1">Selected Service</p>
                        <p className="text-xs sm:text-sm font-bold text-white uppercase italic tracking-wider">{formData.selectedService}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-red-500/60 mb-1">Estimated Base</p>
                        <p className="text-xs sm:text-sm font-black text-red-400">{formData.selectedPrice}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {['web', 'mobile', 'ai'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${formData.category === cat ? 'bg-red-600/10 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}
                      >
                        <span className="text-[10px] font-mono uppercase tracking-widest">{cat}</span>
                      </button>
                    ))}
                  </div>
                  <textarea 
                    rows={4}
                    placeholder="Briefly describe your vision..."
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/40 outline-none transition-all resize-none"
                  />
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 border border-white/10 hover:bg-white/5 rounded-2xl text-white/50 font-mono text-[10px] uppercase tracking-[0.4em] transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="button"
                      onClick={handleNext}
                      className="flex-[2] py-5 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-mono text-[10px] uppercase tracking-[0.4em] font-bold transition-all"
                    >
                      Check AI Estimate
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles size={18} className="text-red-500" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">AI Generated Roadmap</span>
                    </div>
                    
                    {loading ? (
                      <div className="h-20 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-rotate" />
                      </div>
                    ) : (
                      <p className="text-lg text-white font-light leading-relaxed italic">
                        &ldquo;{aiSuggestion}&rdquo;
                      </p>
                    )}
                    
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
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
                        I agree to the terms and project consultation conditions.
                      </span>
                    </label>
                    {errors.agreed && <p className="text-red-500 text-[9px] font-mono tracking-widest uppercase">{errors.agreed}</p>}
                    {errors.details && <p className="text-red-500 text-[9px] font-mono tracking-widest uppercase">{errors.details}</p>}
                    {errors.submit && (
                      <p className="text-red-500 text-[11px] font-medium text-center mt-2">
                        {errors.submit}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-5 border border-white/10 hover:bg-white/5 rounded-2xl text-white/50 font-mono text-[10px] uppercase tracking-[0.4em] transition-all"
                    >
                      Adjust
                    </button>
                    
                    <div className="flex-[2] flex flex-col gap-3">
                      {/* Cloudflare Turnstile Widget */}
                      <div className="flex justify-center w-full overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-1">
                        <Turnstile 
                          siteKey="1x00000000000000000000AA" // Default Cloudflare test key (always passes). Replace with your actual Site Key!
                          onSuccess={(token) => setFormData({...formData, turnstileToken: token})}
                          theme="dark"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading || !formData.turnstileToken}
                        className="w-full py-5 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-mono text-[10px] uppercase tracking-[0.4em] font-bold shadow-[0_10px_30px_rgba(200,20,30,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <Send size={14} />
                        Send Mission
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Send size={32} className="text-green-500" />
                  </div>
                  <h4 className="text-3xl font-bold italic uppercase tracking-tighter text-white">Mission Dispatched</h4>
                  <p className="text-white/40 font-mono text-xs tracking-widest leading-loose">
                    Zubair has been notified. <br/>Expect a resonance within 24 hours.
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-8 px-10 py-4 border border-white/10 hover:bg-white/5 rounded-full text-white/50 font-mono text-[10px] uppercase tracking-[0.4em] transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}