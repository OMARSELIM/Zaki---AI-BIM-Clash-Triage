import { GoogleGenAI, Type } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from '../constants';
import { BatchAnalysisResponse, ClashSeverity, Discipline, RawClashData } from '../types';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenAI({ apiKey });
};

export const analyzeClashBatch = async (clashes: RawClashData[]): Promise<BatchAnalysisResponse | null> => {
  if (!genAI) throw new Error("Gemini AI not initialized");

  const prompt = `
    Analyze the following list of BIM clashes. Return a JSON object with a 'results' array.
    
    Clashes to analyze:
    ${JSON.stringify(clashes.map(c => ({
      id: c.id,
      item1: c.item1,
      item2: c.item2,
      distance: c.distance,
      layer1: c.layer1,
      layer2: c.layer2
    })), null, 2)}
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: Object.values(ClashSeverity) },
                  responsibility: { type: Type.STRING, enum: Object.values(Discipline) },
                  description: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["id", "severity", "responsibility", "description"]
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BatchAnalysisResponse;
    }
    return null;

  } catch (error) {
    console.error("Error analyzing batch:", error);
    return null;
  }
};
