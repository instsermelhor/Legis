import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected import paths for local modules.
import { AREAS_OF_LAW } from '../constants';
import type { CaseAnalysis, ChatMessage, MapsSearchResult, GroundingChunk } from '../types';

// Use a getter or safe initialization for GoogleGenAI to avoid module crash when API_KEY is missing.
const getAI = () => {
  try {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || 'dummy_key' });
  } catch {
    return null;
  }
};
const ai = getAI();
export async function analyzeCaseWithGemini(description: string): Promise<CaseAnalysis> {
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are an expert legal assistant. Your task is to analyze a user's case description and extract key information.
You must classify the case into one primary area of law and identify up to three relevant specializations.
The primary area must be one of the following: ${AREAS_OF_LAW.join(', ')}.
The specializations should be more specific sub-fields within the primary area.
Provide a brief, neutral summary of the user's situation.
Determine the urgency of the case as 'high', 'medium', or 'low'.
You must respond in JSON format.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      primaryArea: {
        type: Type.STRING,
        description: `The main area of law. Must be one of: ${AREAS_OF_LAW.join(', ')}.`,
        enum: AREAS_OF_LAW,
      },
      specializations: {
        type: Type.ARRAY,
        description: "A list of up to 3 specific specializations within the primary area.",
        items: {
          type: Type.STRING,
        },
      },
      summary: {
        type: Type.STRING,
        description: "A brief, neutral summary of the user's situation.",
      },
      urgency: {
        type: Type.STRING,
        description: "The urgency level of the case.",
        enum: ['high', 'medium', 'low'],
      },
    },
    required: ['primaryArea', 'specializations', 'summary', 'urgency'],
  };

  try {
    // FIX: Use ai.models.generateContent to make API calls.
    const response = await ai.models.generateContent({
      model: model,
      contents: description,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // FIX: Access the response text directly from response.text.
    const text = response.text;

    // FIX: Trim whitespace which can sometimes be returned by the API.
    const jsonStr = text.trim();
    const result: CaseAnalysis = JSON.parse(jsonStr);
    return result;
  } catch (error) {
    console.error("Error analyzing case with Gemini:", error);
    throw new Error("Failed to analyze case. Please try again.");
  }
}

export async function findPlacesWithMaps(description: string, location?: { latitude: number; longitude: number; }): Promise<MapsSearchResult> {
  const model = 'gemini-2.5-flash';
  const prompt = `Find lawyers or law offices near the user's location that specialize in the following legal case. Provide a helpful summary and list some options. Case description: "${description}"`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      }
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as unknown as GroundingChunk[];

    return { text, groundingChunks };
  } catch (error) {
    console.error("Error finding places with Maps Grounding:", error);
    // Return an empty result instead of throwing, so the UI can still display the mock results
    return { text: 'Não foi possível buscar sugestões do Google Maps no momento.', groundingChunks: [] };
  }
}


export async function chatWithGemini(history: ChatMessage[], newMessage: string): Promise<string> {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are "Legis Connect Assistente IA", a friendly and helpful AI assistant for the Legis Connect platform.
Your purpose is to answer user questions about:
1.  How to use the Legis Connect platform (e.g., "how do I find a lawyer?", "how do I book a consultation?").
2.  General information about common legal areas (e.g., "what is family law?", "what does a labor lawyer do?").
3.  General questions about the status of a legal case (e.g., "what does 'in instruction phase' mean?").

IMPORTANT rules:
- You MUST NOT provide legal advice. If a user asks for advice on their specific situation, you must decline and recommend they consult with a qualified lawyer through the platform. For example, say: "Não posso fornecer aconselhamento jurídico, pois não sou um advogado. Para obter ajuda com seu caso específico, recomendo que você encontre um especialista aqui na plataforma."
- Keep your answers concise and easy to understand.
- Be polite and professional.
- Your responses must be in Brazilian Portuguese.`;

  try {
    const chat = ai.chats.create({ model, history, config: { systemInstruction } });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Error in chat with Gemini:", error);
    throw new Error("Failed to get a response from the AI assistant.");
  }
}
