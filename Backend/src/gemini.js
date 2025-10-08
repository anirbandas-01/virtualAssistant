import axios from "axios"
import dotenv from "dotenv";
dotenv.config();

const geminiResponse = async (userPrompt, assistantName, userName)=> {
    try {
        const apiUrl = process.env.GEMINI_API_URL;
        const apiKey= process.env.GEMINI_API_KEY;

        if (!apiUrl || !apiKey) {
         console.error("❌ Missing GEMINI credentials in .env.");
         return JSON.stringify({ type: "error", response: "Missing API Credential." });
         }
        
        const systemPrompt = `
        You are ${assistantName}, an intelligent and friendly AI assistant created by ${userName}.
        You are a friendly, helpful, and conversational virtual assistant. 
        You analyze the user's message and output ONLY a single valid JSON object (no markdown or code blocks).
        Your tone should be warm, human-like, and slightly expressive.


        Output format:
        {
          "type": "<intent>",
          "userInput": "<cleaned user message>",
          "response": "<short natural spoken reply>"
        }

        Valid "type" values include:
        get_date, get_time, get_day, get_month, google_search, youtube_search, youtube_play,
        settings_open, music_open, camera_open, notes_open, whatsapp_open, gmail_open,
        facebook_open, instagram_open, calculator_open, greeting, how_are_you, thank_you, weather.

       Example:
       User says: "What’s the date today?"
       Output:
       {
       "type": "get_date",
       "userInput": "What’s the date today?",
       "response": "Today's date is October 6, 2025."
       }

       Now respond ONLY with valid JSON.
       `;

       const result = await axios.post( 
            `${apiUrl}?key=${apiKey}`,
            {
            contents: [
                {
                role: "user",
                parts: [{text: userPrompt }],
                },
              ],
              system_instruction: {
                role: "system",
                parts: [{ text: systemPrompt }],
              },
            },
            { headers: { "Content-Type": "application/json" }}
        );

        const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("Gemini raw output:", text);
        return text; 
    } catch (error) {
        console.error("Gemini API Error:",error.response?.data || error.message);
        return JSON.stringify({ type: "error", response: "Gemini API error." });
    }
};

export default geminiResponse;  