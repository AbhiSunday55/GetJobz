import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ATSCheck } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  Search, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Upload,
  RefreshCcw
} from 'lucide-react';
import { geminiService } from '../services/gemini';

interface ATSCheckerProps {
  profile: UserProfile | null;
}

export default function ATSChecker({ profile }: ATSCheckerProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) return;
    setIsAnalyzing(true);
    try {
      const analysis = await geminiService.checkATSCompatibility(resumeText, jobDescription);
      setResult(analysis);

      // Save to Firestore
      const check: Partial<ATSCheck> = {
        userId: profile?.uid,
        jobDescription,
        resumeText,
        score: analysis.score,
        suggestions: analysis.suggestions,
        missingKeywords: analysis.missingKeywords,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'ats_checks'), check);
    } catch (error) {
      console.error("Error analyzing ATS:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useProfileText = () => {
    if (!profile) return;
    const text = `
      Name: ${profile.displayName}
      Industry: ${profile.industry}
      Skills: ${profile.skills?.join(', ')}
      Experience: ${profile.experience?.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n')}
      Education: ${profile.education?.map(e => `${e.degree} from ${e.institution}`).join('\n')}
    `;
    setResumeText(text.trim());
  };

  return (
    <div className="space-y-8">
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold italic flex items-center gap-3">
                <FileText size={24} /> Resume Content
              </h3>
              <button 
                onClick={useProfileText}
                className="text-xs uppercase tracking-widest font-bold text-blue-600 hover:underline"
              >
                Use My Profile
              </button>
            </div>
            <textarea 
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-8 bg-white rounded-[40px] border border-[#141414]/5 shadow-sm min-h-[400px] focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-sm"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold italic flex items-center gap-3">
              <Search size={24} /> Job Description
            </h3>
            <textarea 
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-8 bg-white rounded-[40px] border border-[#141414]/5 shadow-sm min-h-[400px] focus:ring-2 focus:ring-emerald-500 transition-all font-sans text-sm"
            />
          </div>

          <div className="lg:col-span-2 flex justify-center pt-8">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText || !jobDescription}
              className="px-16 py-6 bg-[#141414] text-[#E4E3E0] rounded-full text-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-4"
            >
              {isAnalyzing ? 'Analyzing with AI...' : 'Check Compatibility'}
              {!isAnalyzing && <Sparkles size={28} className="text-yellow-400" />}
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold italic tracking-tighter">Analysis Result</h2>
            <button 
              onClick={() => setResult(null)}
              className="flex items-center gap-2 px-6 py-3 bg-black/5 rounded-2xl font-bold hover:bg-black/10 transition-colors"
            >
              <RefreshCcw size={20} /> New Scan
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-12 rounded-[40px] border border-[#141414]/5">
                <h3 className="text-2xl font-bold italic mb-8 flex items-center gap-3">
                  <Sparkles size={24} className="text-emerald-500" /> Optimization Suggestions
                </h3>
                <div className="space-y-4">
                  {result.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-6 bg-[#F5F5F0] rounded-3xl">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed font-sans">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-[#141414] text-[#E4E3E0] p-12 rounded-[40px] text-center relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 mb-4">Match Score</h4>
                  <div className="text-8xl font-bold tracking-tighter mb-4 italic">
                    {result.score}<span className="text-3xl opacity-30">%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <p className="text-sm opacity-50 font-sans">
                    {result.score >= 80 ? 'Excellent match!' : result.score >= 60 ? 'Good match, needs optimization.' : 'Low compatibility.'}
                  </p>
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-[#141414]/5">
                <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans mb-6">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                      <AlertCircle size={14} />
                      {kw}
                    </div>
                  ))}
                  {result.missingKeywords.length === 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                      <CheckCircle size={14} />
                      All keywords found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
