import React from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { FileText, Video, Search, PlusCircle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ profile, setActiveTab }: DashboardProps) {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            WELCOME BACK, <span className="italic text-[#141414]/40">{profile?.displayName?.toUpperCase()}</span>
          </h1>
          <p className="text-lg opacity-60 font-sans">Your career journey is looking promising.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest font-bold font-sans opacity-40">Profile Completion</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-48 h-2 bg-black/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-[#141414]"
              />
            </div>
            <span className="font-mono text-sm">65%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'resume', title: 'Resume Builder', icon: FileText, desc: 'Update your professional profile and export ATS-friendly PDF.', color: 'bg-blue-500/10 text-blue-600' },
          { id: 'interview', title: 'Mock Interview', icon: Video, desc: 'Practice with AI and get real-time feedback on your performance.', color: 'bg-purple-500/10 text-purple-600' },
          { id: 'ats', title: 'ATS Checker', icon: Search, desc: 'Analyze your resume against job descriptions to optimize keywords.', color: 'bg-emerald-500/10 text-emerald-600' }
        ].map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ y: -8 }}
            onClick={() => setActiveTab(item.id)}
            className="group p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm text-left flex flex-col h-full"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
              <item.icon size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
            <p className="text-sm opacity-50 font-sans mb-8 flex-1 leading-relaxed">{item.desc}</p>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
              Launch <ArrowRight size={16} />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-[#141414]/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold italic">Quick Stats</h3>
            <button className="text-xs uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">View All</button>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Interviews Completed', value: '12', trend: '+2 this week' },
              { label: 'Avg. ATS Score', value: '84%', trend: 'Top 10%' },
              { label: 'Resumes Generated', value: '5', trend: 'Latest: 2 days ago' }
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-[#F5F5F0]/50">
                <div>
                  <p className="text-sm opacity-50 font-sans">{stat.label}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">{stat.trend}</p>
                </div>
                <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141414] text-[#E4E3E0] p-8 rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold italic mb-4">Ready for your next <br />big move?</h3>
            <p className="opacity-60 font-sans mb-8 max-w-sm">
              Our AI has analyzed 1,000+ tech job descriptions to help you stand out.
            </p>
            <button 
              onClick={() => setActiveTab('resume')}
              className="flex items-center gap-3 px-8 py-4 bg-[#E4E3E0] text-[#141414] rounded-full font-bold hover:scale-105 transition-transform"
            >
              <PlusCircle size={20} />
              Create New Resume
            </button>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
