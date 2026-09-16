import { GoogleGenAI } from "@google/genai";
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = ['gemini-3.0-flash', 'gemini-3.0-pro', 'gemini-2.0-flash'];
  for (const model of models) {
    try {
      console.log("Trying", model);
      const response = await ai.models.generateContent({ model, contents: "test" });
      console.log(model, "WORKS!");
      return;
    } catch (e) {
      console.error(model, "FAILS:", e.message);
    }
  }
}
run();
