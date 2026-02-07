import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * AI Assistant for the Public Site (Travel Guide)
 */
export const getTravelAssistantResponse = async (history: { role: string; text: string }[], userMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `Você é o "Horizonte Guide", um assistente de viagens virtual amigável, entusiasta e experiente para uma agência de turismo brasileira.
        Seu objetivo é ajudar viajantes a escolher destinos, dar dicas locais e explicar nossos pacotes.
        Responda sempre em Português do Brasil. Seja conciso e persuasivo. Use emojis ocasionalmente.`,
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
    console.error("Gemini Chat Error:", error);
    return "Desculpe, estou tendo dificuldades para consultar o mapa estelar agora. Tente novamente em alguns instantes.";
  }
};

/**
 * AI Tool for the Backend Dashboard (Generate Package Descriptions)
 */
export const generatePackageDetails = async (destination: string, duration: string, price: string) => {
  try {
    const prompt = `Crie uma descrição de marketing atraente e um breve itinerário dia a dia para um pacote de viagem.
    Destino: ${destination}
    Duração: ${duration}
    Preço alvo: R$ ${price}

    Retorne APENAS um objeto JSON com o seguinte formato, sem markdown ao redor:
    {
      "description": "Um parágrafo curto e vendedor sobre a experiência.",
      "itinerary": "Resumo dos pontos altos dia a dia."
    }`;

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
    console.error("Gemini Content Gen Error:", error);
    throw error;
  }
};