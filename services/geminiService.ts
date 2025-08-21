
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set in environment variables. Help Assistant will return a placeholder message.");
}

// Initialize AI client, even if API_KEY is missing, to avoid runtime errors on access.
// The sendMessageToGemini function will handle the missing key case.
const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY_PLACEHOLDER" });

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const sendMessageToGemini = async (message: string, systemInstruction?: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key not configured. Please set the API_KEY environment variable to use the AI Help Assistant.";
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: message,
      config: {
        ...(systemInstruction && { systemInstruction }),
        // Defaults to thinking enabled. For low latency with gemini-2.5-flash-preview-04-17:
        // thinkingConfig: { thinkingBudget: 0 }
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) { // Check for common API key error message
            return "Error: The provided Gemini API key is not valid. Please check your API_KEY environment variable.";
        }
         if (error.message.includes("fetch failed") || error.message.includes("NetworkError")) {
             return "Error: Network connection issue. Could not reach Gemini API. Please check your internet connection.";
         }
        return `Error communicating with AI assistant: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI assistant.";
  }
};
