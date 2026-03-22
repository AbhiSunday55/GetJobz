import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Experience, Education } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  GraduationCap,
  Wrench
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { geminiService } from '../services/gemini';

interface ResumeBuilderProps {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export default function ResumeBuilder({ profile, setProfile }: ResumeBuilderProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), { ...profile });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addExperience = () => {
    if (!profile) return;
    const newExp: Experience = { id: Date.now().toString(), company: '', role: '', duration: '', description: '' };
    setProfile({ ...profile, experience: [...(profile.experience || []), newExp] });
  };

  const addEducation = () => {
    if (!profile) return;
    const newEdu: Education = { id: Date.now().toString(), institution: '', degree: '', year: '' };
    setProfile({ ...profile, education: [...(profile.education || []), newEdu] });
  };

  const removeExperience = (id: string) => {
    if (!profile) return;
    setProfile({ ...profile, experience: profile.experience?.filter(e => e.id !== id) || [] });
  };

  const removeEducation = (id: string) => {
    if (!profile) return;
    setProfile({ ...profile, education: profile.education?.filter(e => e.id !== id) || [] });
  };

  const handleAISuggestions = async () => {
    if (!profile || !jobDescription) return;
    setIsGenerating(true);
    try {
      const result = await geminiService.generateResumeSuggestions(profile, jobDescription);
      setSuggestions(result);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = () => {
    if (!profile) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(24);
    doc.text(profile.displayName, 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(profile.email, 20, y);
    y += 15;

    if (profile.industry) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Industry', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(profile.industry, 20, y);
      y += 15;
    }

    if (profile.skills?.length) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Skills', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(profile.skills.join(', '), 20, y);
      y += 15;
    }

    if (profile.experience?.length) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Experience', 20, y);
      y += 10;
      profile.experience.forEach(exp => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.role} at ${exp.company}`, 20, y);
        y += 5;
        doc.setFont('helvetica', 'italic');
        doc.text(exp.duration, 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(exp.description, 170);
        doc.text(splitDesc, 20, y);
        y += (splitDesc.length * 7) + 5;
      });
    }

    doc.save(`${profile.displayName.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-[#141414]/5">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-12 h-1 rounded-full ${step >= i ? 'bg-[#141414]' : 'bg-black/5'}`} />
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl text-sm font-bold hover:bg-black/10 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Progress'}
              </button>
              <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-xl text-sm font-bold hover:scale-105 transition-transform"
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold italic flex items-center gap-3">
                  <Briefcase size={24} /> Basic Info & Industry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans">Full Name</label>
                    <input 
                      type="text" 
                      value={profile?.displayName || ''} 
                      onChange={(e) => setProfile({ ...profile!, displayName: e.target.value })}
                      className="w-full p-4 bg-[#F5F5F0] rounded-2xl border-none focus:ring-2 focus:ring-[#141414] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans">Target Industry</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Blockchain, AI, Fintech"
                      value={profile?.industry || ''} 
                      onChange={(e) => setProfile({ ...profile!, industry: e.target.value })}
                      className="w-full p-4 bg-[#F5F5F0] rounded-2xl border-none focus:ring-2 focus:ring-[#141414] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans">Skills (Comma separated)</label>
                  <textarea 
                    value={profile?.skills?.join(', ') || ''} 
                    onChange={(e) => setProfile({ ...profile!, skills: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full p-4 bg-[#F5F5F0] rounded-2xl border-none focus:ring-2 focus:ring-[#141414] transition-all min-h-[100px]"
                    placeholder="Solidity, React, Node.js, Python..."
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold italic flex items-center gap-3">
                    <Briefcase size={24} /> Experience
                  </h3>
                  <button onClick={addExperience} className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-6">
                  {profile?.experience?.map((exp, idx) => (
                    <div key={exp.id} className="p-6 bg-[#F5F5F0] rounded-3xl relative group">
                      <button 
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input 
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...profile.experience!];
                            newExp[idx].company = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          className="bg-white p-3 rounded-xl border-none text-sm"
                        />
                        <input 
                          placeholder="Role"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...profile.experience!];
                            newExp[idx].role = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          className="bg-white p-3 rounded-xl border-none text-sm"
                        />
                      </div>
                      <input 
                        placeholder="Duration (e.g. 2022 - Present)"
                        value={exp.duration}
                        onChange={(e) => {
                          const newExp = [...profile.experience!];
                          newExp[idx].duration = e.target.value;
                          setProfile({ ...profile, experience: newExp });
                        }}
                        className="bg-white p-3 rounded-xl border-none text-sm w-full mb-4"
                      />
                      <textarea 
                        placeholder="Description of your responsibilities and achievements..."
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...profile.experience!];
                          newExp[idx].description = e.target.value;
                          setProfile({ ...profile, experience: newExp });
                        }}
                        className="bg-white p-3 rounded-xl border-none text-sm w-full min-h-[100px]"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold italic flex items-center gap-3">
                    <GraduationCap size={24} /> Education
                  </h3>
                  <button onClick={addEducation} className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-6">
                  {profile?.education?.map((edu, idx) => (
                    <div key={edu.id} className="p-6 bg-[#F5F5F0] rounded-3xl relative group">
                      <button 
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                          placeholder="Institution"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...profile.education!];
                            newEdu[idx].institution = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                          className="bg-white p-3 rounded-xl border-none text-sm"
                        />
                        <input 
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...profile.education!];
                            newEdu[idx].degree = e.target.value;
                            setProfile({ ...profile, education: newEdu });
                          }}
                          className="bg-white p-3 rounded-xl border-none text-sm"
                        />
                      </div>
                      <input 
                        placeholder="Year"
                        value={edu.year}
                        onChange={(e) => {
                          const newEdu = [...profile.education!];
                          newEdu[idx].year = e.target.value;
                          setProfile({ ...profile, education: newEdu });
                        }}
                        className="bg-white p-3 rounded-xl border-none text-sm w-full mt-4"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 bg-black/5 rounded-2xl font-bold disabled:opacity-30"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button 
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={step === 3}
              className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold disabled:opacity-30"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-[#141414] text-[#E4E3E0] p-8 rounded-3xl relative overflow-hidden">
          <h3 className="text-2xl font-bold italic mb-6 flex items-center gap-3">
            <Sparkles size={24} className="text-yellow-400" /> AI Optimizer
          </h3>
          <p className="text-sm opacity-60 font-sans mb-6">
            Paste a job description to get tailored suggestions for your resume.
          </p>
          <textarea 
            placeholder="Paste Job Description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-sm font-sans min-h-[150px] mb-6 focus:ring-1 focus:ring-white/30 transition-all"
          />
          <button 
            onClick={handleAISuggestions}
            disabled={isGenerating || !jobDescription}
            className="w-full py-4 bg-[#E4E3E0] text-[#141414] rounded-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isGenerating ? 'Analyzing...' : 'Get Suggestions'}
          </button>
        </div>

        {suggestions && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-[#141414]/5 space-y-6"
          >
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans mb-3">Optimized Summary</h4>
              <p className="text-sm leading-relaxed italic">"{suggestions.optimizedSummary}"</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans mb-3">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.missingSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans mb-3">Key Suggestions</h4>
              <ul className="space-y-2">
                {suggestions.suggestions.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
