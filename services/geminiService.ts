import { GoogleGenAI, Type } from "@google/genai";
import { AREAS_OF_LAW } from '../constants';
import type { CaseAnalysis, ChatMessage, MapsSearchResult, GroundingChunk, Message } from '../types';

// ─── Proxy helper (VULN-004 fix: API Key remains on server) ───────────────────
const PROXY_URL = process.env.GEMINI_PROXY_URL || '/api/gemini';
const IS_PROXY_MODE = process.env.API_KEY === 'USE_PROXY' || process.env.GEMINI_API_KEY === 'USE_PROXY' || !process.env.GEMINI_API_KEY;

async function callGeminiProxy(payload: { model?: string; contents: unknown; generationConfig?: unknown }) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Gemini Proxy error: ${response.status}`);
  }
  return response.json();
}

const getAI = () => {
  if (IS_PROXY_MODE) return null; // Proxy mode active
  try {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key || key === 'USE_PROXY') return null;
    return new GoogleGenAI({ apiKey: key });
  } catch {
    return null;
  }
};

const ai = getAI();

export async function analyzeCaseWithGemini(description: string, tenantId?: string): Promise<CaseAnalysis> {
  const model = "gemini-2.5-flash";

  const tenantContextNote = tenantId ? `\nSecurity Boundary: Context strictly isolated for Tenant '${tenantId}'. Do not link or cross-reference outside data.` : '';
  const systemInstruction = `You are an expert legal assistant. Your task is to analyze a user's case description and extract key information.${tenantContextNote}
You must classify the case into one primary area of law and identify up to three relevant specializations.
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
    let jsonStr = '';
    if (!ai) {
      const data = await callGeminiProxy({
        model,
        contents: [{ parts: [{ text: `${systemInstruction}\n\nCase description: ${description}` }] }],
      });
      jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      const response = await ai.models.generateContent({
        model: model,
        contents: description,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });
      jsonStr = response.text || '';
    }

    const result: CaseAnalysis = JSON.parse(jsonStr.trim());
    return result;
  } catch (error) {
    console.error("Error analyzing case with Gemini:", error);
    throw new Error("Failed to analyze case. Please try again.");
  }
}

export async function findPlacesWithMaps(description: string, location?: { latitude: number; longitude: number; }): Promise<MapsSearchResult> {
  const model = 'gemini-2.5-flash';
  const prompt = `Find lawyers or law offices near the user's location that specialize in the following legal case. Provide a helpful summary and list some options. Case description: "${description}"`;

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
    };
  }

  try {
    let text = '';
    let groundingChunks: GroundingChunk[] = [];

    if (!ai) {
      const data = await callGeminiProxy({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      groundingChunks = (data.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];
    } else {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config,
      });
      text = response.text || '';
      groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as unknown as GroundingChunk[];
    }

    return { text, groundingChunks };
  } catch (error) {
    console.error("Error finding places with Maps Grounding:", error);
    return { text: 'Não foi possível buscar sugestões do Google Maps no momento.', groundingChunks: [] };
  }
}

export async function chatWithGemini(history: (Message | ChatMessage)[], newMessage: string): Promise<string> {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are "Legis Connect Assistente IA", a friendly and helpful AI assistant for the Legis Connect platform.
Your purpose is to answer user questions about:
1.  How to use the Legis Connect platform (e.g., "how do I find a lawyer?", "how do I book a consultation?").
2.  General information about common legal areas (e.g., "what is family law?", "what does a labor lawyer do?").
3.  General questions about the status of a legal case (e.g., "what does 'in instruction phase' mean?").

IMPORTANT rules:
- You MUST NOT provide legal advice. If a user asks for advice on their specific situation, you must decline and recommend they consult with a qualified lawyer through the platform.
- Keep your answers concise and easy to understand.
- Be polite and professional.
- Your responses must be in Brazilian Portuguese.`;

  try {
    if (!ai) {
      // Convert history to Gemini format (both Message and ChatMessage shapes supported)
      const formattedHistory = history.map(msg => {
        if ('sender' in msg) {
          // Message shape: { sender, text }
          return { role: (msg as Message).sender === 'client' ? 'user' : 'model', parts: [{ text: (msg as Message).text }] };
        }
        // ChatMessage shape: { role, parts }
        return { role: (msg as ChatMessage).role, parts: (msg as ChatMessage).parts };
      });
      formattedHistory.push({ role: 'user', parts: [{ text: newMessage }] });

      const data = await callGeminiProxy({
        model,
        contents: formattedHistory,
        generationConfig: { systemInstruction },
      });
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      const chat = ai.chats.create({ model, history: history as any, config: { systemInstruction } });
      const response = await chat.sendMessage({ message: newMessage });
      return response.text || '';
    }
  } catch (error) {
    console.warn("[GeminiService] Proxy de IA indisponível ou offline. Usando resposta fallback.");
    return "Olá! Sou o Assistente IA do Legis Connect. Para obter orientação jurídica específica sobre seu caso, recomendamos agendar uma consulta com um de nossos advogados cadastrados na plataforma.";
  }
}
