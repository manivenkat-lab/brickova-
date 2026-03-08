
import { GoogleGenAI } from "@google/genai";

// Using gemini-3-flash-preview for rapid narrative generation
export const generatePropertyDescription = async (details: {
  title: string;
  location: string;
  bhk: string;
  amenities: string[];
}) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class luxury real estate copywriter. Write a 3-paragraph, evocative and professional description for this property listing on "Brickova" (a direct owner marketplace). 
      Property: ${details.title}
      Location: ${details.location}
      Config: ${details.bhk}
      Amenities: ${details.amenities.join(', ')}
      
      Tone: Exclusive, elite, and high-tech. Focus on the value of a direct transaction.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Flash Error:", error);
    return "";
  }
};

// Using gemini-3-pro-preview for deep real estate intelligence
export const getMarketAdvice = async (userQuery: string, propertiesContext: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are the Brickova Global Investment Assistant.
      Context of current inventory: ${propertiesContext}
      
      User Question: ${userQuery}
      
      Provide a data-driven, helpful response about the real estate market or specific property matches. Mention blockchain verification as a trust factor where relevant.`,
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Pro Error:", error);
    return "I'm currently analyzing the global market. Please try again shortly.";
  }
};
