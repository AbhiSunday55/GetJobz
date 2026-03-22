import React, { useState, useEffect } from 'react';
import { db, auth, signInWithGoogle } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import Layout from './components/Layout';
import ResumeBuilder from './components/ResumeBuilder';
import MockInterview from './components/MockInterview';
import ATSChecker from './components/ATSChecker';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'User',
            createdAt: new Date().toISOString(),
            skills: [],
            experience: [],
            education: []
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        } else {
          setProfile(userDoc.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#E4E3E0] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#E4E3E0] font-serif flex flex-col">
        <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold italic tracking-tighter">GetJobz</h1>
          <button 
            onClick={signInWithGoogle}
            className="px-6 py-2 bg-[#E4E3E0] text-[#141414] rounded-full font-medium hover:scale-105 transition-transform"
          >
            Sign In
          </button>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <h2 className="text-7xl sm:text-9xl font-bold tracking-tighter leading-none mb-8">
              LAND YOUR <br />
              <span className="italic text-[#E4E3E0]/40">DREAM ROLE.</span>
            </h2>
            <p className="text-xl sm:text-2xl opacity-60 max-w-2xl mx-auto mb-12 font-sans">
              AI-powered resume building, mock interviews, and ATS checking for the modern job seeker.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
              {[
                { icon: Briefcase, title: "Resume Builder", desc: "ATS-friendly templates" },
                { icon: Sparkles, title: "AI Interviews", desc: "Real-time feedback" },
                { icon: ShieldCheck, title: "ATS Checker", desc: "Keyword optimization" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <item.icon className="mx-auto mb-4 opacity-50" size={32} />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-50 font-sans">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={signInWithGoogle}
              className="group flex items-center gap-4 px-12 py-6 bg-[#E4E3E0] text-[#141414] rounded-full text-2xl font-bold hover:scale-105 transition-all"
            >
              Get Started for Free
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </main>

        <footer className="p-8 border-t border-white/10 text-center opacity-30 text-sm font-sans">
          © 2026 GetJobz. Built for the future of work.
        </footer>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && <Dashboard profile={profile} setActiveTab={setActiveTab} />}
        {activeTab === 'resume' && <ResumeBuilder profile={profile} setProfile={setProfile} />}
        {activeTab === 'interview' && <MockInterview profile={profile} />}
        {activeTab === 'ats' && <ATSChecker profile={profile} />}
      </AnimatePresence>
    </Layout>
  );
}
