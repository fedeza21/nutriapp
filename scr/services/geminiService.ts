
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Recipe } from "../types";

// Always use the API key from process.env.API_KEY.
// Assume this variable is pre-configured and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface MultimodalInput {
  text?: string;
  imageBase64?: string;
  audioBase64?: string;
}

export const parseMealMultimodal = async (input: MultimodalInput): Promise<any | null> => {
  try {
    const parts: any[] = [];
    if (input.text) parts.push({ text: `Descripción: ${input.text}` });
    if (input.imageBase64) {
      const base64Data = input.imageBase64.includes(',') ? input.imageBase64.split(',')[1] : input.imageBase64;
      parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
    }
    if (input.audioBase64) {
      const base64Data = input.audioBase64.includes(',') ? input.audioBase64.split(',')[1] : input.audioBase64;
      parts.push({ inlineData: { mimeType: "audio/webm", data: base64Data } });
    }

    const prompt = `Analiza la comida. JSON estricto: { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }.`;

    // Always use ai.models.generateContent to query GenAI with both the model name and prompt/contents.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [...parts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER }
          },
          required: ["name", "calories", "protein", "carbs", "fat"]
        }
      }
    });

    // Access .text property directly, do not call as a method.
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error en Gemini Service:", error);
    return null;
  }
};

export const getPersonalizedRecipes = async (profile: UserProfile): Promise<Recipe[]> => {
  try {
    // Prompt optimized for speed
    const prompt = `Genera 4 recetas breves para: Dieta ${profile.dietType}, Meta ${profile.goal}, Salud: ${profile.healthConditions.join(', ')}. JSON ARRAY.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        // Disable thinking budget for maximum speed on basic summarization tasks
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              time: { type: Type.STRING }
            },
            required: ["id", "title", "description", "ingredients", "steps", "calories", "protein", "carbs", "fat", "time"]
          }
        }
      }
    });

    // Access .text property directly
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error generando recetas:", error);
    return [];
  }
};
