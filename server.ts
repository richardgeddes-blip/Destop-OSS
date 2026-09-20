import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  // Replace legacy port binding with dynamic cloud allocation
  const PORT = Number(process.env.PORT) || 7777;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/voice/recall", async (req, res) => {
    try {
      const text = req.body.text;
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `The user asked: "${text}". Act as a digital librarian agent managing a local Dyslexia-Optimized Desktop Workspace. Summarize a direct, highly-accurate, and concise response.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: "The summarized answer extracted from the library",
              },
              source: {
                type: Type.STRING,
                description: "A fictional but highly plausible filename like 'Lawn_Opening.docx' or 'Market_Analysis_2026.pdf'",
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 relevant tags based on the query",
              }
            },
            required: ["answer", "source", "tags"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText);

      res.json({
        type: "recall",
        answer: data.answer,
        source: data.source,
        tags: data.tags,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Failed to query library.";
      res.status(500).json({ error: `AI Backend Error: ${errorMessage}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
