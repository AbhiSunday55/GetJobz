import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, InterviewQuestion, InterviewSession } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  Video, 
  Mic, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Timer,
  MessageSquare
} from 'lucide-react';
import { geminiService } from '../services/gemini';

interface MockInterviewProps {
  profile: UserProfile | null;
}

export default function MockInterview({ profile }: MockInterviewProps) {
  const [stage, setStage] = useState<'setup' | 'interview' | 'feedback'>('setup');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState(profile?.industry || '');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startInterview = async () => {
    if (!role || !industry) return;
    setIsGenerating(true);
    try {
      const qs = await geminiService.generateInterviewQuestions(role, industry);
      setQuestions(qs.map((q: any) => ({ ...q, answer: '' })));
      setStage('interview');
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    const updatedQs = [...questions];
    updatedQs[currentIdx].answer = currentAnswer;
    setQuestions(updatedQs);
    setCurrentAnswer('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      submitInterview();
    }
  };

  const submitInterview = async () => {
    setIsSubmitting(true);
    try {
      const result = await geminiService.getInterviewFeedback(questions);
      setFeedback(result);
      
      // Save to Firestore
      const session: Partial<InterviewSession> = {
        userId: profile?.uid,
        role,
        questions,
        feedback: result.overallFeedback,
        score: result.score,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'interviews'), session);
      
      setStage('feedback');
    } catch (error) {
      console.error("Error submitting interview:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStage('setup');
    setRole('');
    setQuestions([]);
    setCurrentIdx(0);
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {stage === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-12 rounded-[40px] border border-[#141414]/5 text-center"
          >
            <div className="w-20 h-20 bg-purple-500/10 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Video size={40} />
            </div>
            <h2 className="text-4xl font-bold tracking-tighter mb-4 italic">Ready for your mock interview?</h2>
            <p className="text-lg opacity-50 font-sans mb-12 max-w-lg mx-auto">
              Our AI will simulate a real interview experience and provide detailed feedback on your answers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 text-left">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans">Target Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 bg-[#F5F5F0] rounded-2xl border-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans">Industry</label>
                <input 
                  type="text" 
                  placeholder="e.g. Technology"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-4 bg-[#F5F5F0] rounded-2xl border-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={startInterview}
              disabled={isGenerating || !role || !industry}
              className="px-12 py-4 bg-[#141414] text-[#E4E3E0] rounded-full text-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-3 mx-auto"
            >
              {isGenerating ? 'Preparing Session...' : 'Start Interview'}
              {!isGenerating && <ArrowRight size={24} />}
            </button>
          </motion.div>
        )}

        {stage === 'interview' && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-xs font-bold uppercase tracking-widest">
                  Question {currentIdx + 1} of {questions.length}
                </div>
                <div className="flex items-center gap-2 text-sm opacity-40 font-mono">
                  <Timer size={16} /> 02:45
                </div>
              </div>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`w-8 h-1 rounded-full ${i <= currentIdx ? 'bg-purple-500' : 'bg-black/5'}`} />
                ))}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[40px] border border-[#141414]/5 shadow-sm min-h-[400px] flex flex-col">
              <div className="flex-1">
                <h3 className="text-3xl font-bold italic mb-12 leading-tight">
                  "{questions[currentIdx]?.question}"
                </h3>
                <textarea 
                  autoFocus
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full p-8 bg-[#F5F5F0] rounded-3xl border-none focus:ring-2 focus:ring-purple-500 transition-all min-h-[200px] text-lg font-sans"
                />
              </div>
              <div className="mt-12 flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm opacity-40 font-sans">
                  <Mic size={20} />
                  <span>Voice input coming soon</span>
                </div>
                <button 
                  onClick={handleNext}
                  disabled={!currentAnswer || isSubmitting}
                  className="px-8 py-4 bg-[#141414] text-[#E4E3E0] rounded-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-3"
                >
                  {currentIdx === questions.length - 1 ? (isSubmitting ? 'Analyzing...' : 'Finish Interview') : 'Next Question'}
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'feedback' && feedback && (
          <motion.div 
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div className="bg-white p-12 rounded-[40px] border border-[#141414]/5">
                  <h3 className="text-2xl font-bold italic mb-6 flex items-center gap-3">
                    <MessageSquare size={24} className="text-purple-500" /> Overall Feedback
                  </h3>
                  <p className="text-lg leading-relaxed opacity-70 font-sans mb-8">
                    {feedback.overallFeedback}
                  </p>
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans">Key Improvements</h4>
                    <div className="space-y-3">
                      {feedback.improvements.map((imp: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-[#F5F5F0] rounded-2xl text-sm">
                          <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          {imp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#141414] text-[#E4E3E0] p-12 rounded-[40px] text-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 mb-4">Performance Score</h4>
                    <div className="text-8xl font-bold tracking-tighter mb-4 italic">
                      {feedback.score}<span className="text-3xl opacity-30">/100</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${feedback.score}%` }}
                        className="h-full bg-purple-500"
                      />
                    </div>
                    <button 
                      onClick={reset}
                      className="w-full py-4 bg-white text-[#141414] rounded-2xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={20} /> Try Again
                    </button>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-[#141414]/5">
                  <h4 className="text-xs uppercase tracking-widest font-bold opacity-40 font-sans mb-4">AI Insight</h4>
                  <div className="flex items-start gap-3 text-sm italic opacity-60">
                    <Sparkles size={20} className="text-yellow-500 shrink-0" />
                    "Your technical knowledge is strong, but focus on the 'STAR' method for behavioral questions to provide more structured answers."
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
