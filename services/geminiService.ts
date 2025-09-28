import { GoogleGenAI, Type } from "@google/genai";
import { Review, AnalysisResult, Sentiment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      enum: [Sentiment.Positive, Sentiment.Negative, Sentiment.Neutral],
      description: "The overall sentiment of the review."
    },
    intent: {
      type: Type.STRING,
      description: "A short phrase describing the primary topic or purpose of the review (e.g., 'Praise for service', 'Complaint about product quality')."
    }
  },
  // FIX: Add required field to the schema to ensure the model returns both properties.
  required: ["sentiment", "intent"]
};

export const analyzeReview = async (reviewText: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the sentiment and primary intent of the following customer review. Categorize sentiment as Positive, Negative, or Neutral. Describe the intent in a short phrase.\n\nReview: "${reviewText}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Ensure sentiment is one of the allowed enum values
    if (!Object.values(Sentiment).includes(result.sentiment)) {
        result.sentiment = Sentiment.Unknown;
    }

    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing review:", error);
    throw new Error("Failed to analyze review due to an API error.");
  }
};

export const generateResponse = async (review: Review, analysis: AnalysisResult): Promise<string> => {
  const prompt = `
    You are a professional customer support representative. Your task is to write a polite, professional, and personalized response to a customer review.

    Key Instructions:
    - **Start the response by addressing the customer by their name.** For example: "Hi ${review.author}," or "Hello ${review.author},".
    - **Maintain a professional and empathetic tone.** Acknowledge their specific feedback (their main point is about: "${analysis.intent}").
    - **Match your tone to the review's sentiment.** If they're happy, share their enthusiasm. If they're upset, be apologetic and helpful.
    - **Do NOT use overly casual or generic terms** like "my friend," "oh dear," or any other unprofessional language.
    - Keep the response concise.
    - Do not add a closing sign-off like "Sincerely" or your name.

    Here is the review information:
    - **Customer Name:** ${review.author}
    - **Sentiment:** ${analysis.sentiment}
    - **Review:** "${review.text}"

    Please write the response now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response due to an API error.");
  }
};