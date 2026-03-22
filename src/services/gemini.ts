import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, InterviewQuestion, ATSCheck } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiService = {
  async generateResumeSuggestions(profile: Partial<UserProfile>, jobDescription: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest improvements for this resume based on the following job description. 
      Profile: ${JSON.stringify(profile)}
      Job Description: ${jobDescription}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizedSummary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async generateInterviewQuestions(role: string, industry: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 technical and behavioral interview questions for a ${role} position in the ${industry} industry.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async getInterviewFeedback(questions: InterviewQuestion[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these interview answers and provide feedback and a score (0-100).
      Data: ${JSON.stringify(questions)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallFeedback: { type: Type.STRING },
            score: { type: Type.NUMBER },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async checkATSCompatibility(resumeText: string, jobDescription: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as an ATS (Applicant Tracking System). Analyze the resume against the job description.
      Resume: ${resumeText}
      Job Description: ${jobDescription}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text);
  }
};
