
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Em ambientes sem process.env (navegador direto), isso pode falhar. 
// O shim no index.html ajuda a evitar o crash inicial.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const MODEL_NAME = 'gemini-3-flash-preview';

export const getTravelAssistantResponse = async (history: { role: string; text: string }[], userMessage: string) => {
  if (!process.env.API_KEY) return "Serviço de IA não configurado.";
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "Você é o Horizonte Guide, um assistente amigável.",
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });
    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tente novamente em breve.";
  }
};

export const generatePackageDetails = async (destination: string, duration: string, price: string) => {
  try {
    const prompt = `Gere descrição e itinerário para: ${destination}, ${duration}, R$ ${price}. JSON format.`;
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            itinerary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Gen Error:", error);
    throw error;
  }
};
