import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        reply: "Prompt is required",
      });
    }
    
    const model = genAI.getGenerativeModel({
      model:"gemini-2.5-flash-lite", 
    });

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    res.json({
      reply: response,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      reply: error.message,
    });
  }
};
