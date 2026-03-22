export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  industry?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  content: UserProfile;
  updatedAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  questions: InterviewQuestion[];
  feedback?: string;
  score?: number;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer?: string;
  feedback?: string;
}

export interface ATSCheck {
  id: string;
  userId: string;
  jobDescription: string;
  resumeText: string;
  score: number;
  suggestions: string[];
  missingKeywords: string[];
  createdAt: string;
}
