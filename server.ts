import dotenv from "dotenv";

// Load environment variables as early as possible
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Helper: call Gemini REST API directly — bypasses SDK and AI Studio proxy
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const url = `${GEMINI_BASE}/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Helper: call Gemini with chat history
async function callGeminiChat(message: string, history: any[], systemInstruction: string): Promise<string> {
  const url = `${GEMINI_BASE}/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const contents = [
    ...(history || []).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.parts?.[0]?.text || "" }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];
  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "8080");

  console.log("API Key loaded:", GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 8)}...` : "MISSING");

  app.use(express.json());
  app.use(cors());

  // Visa Database
  let visaDatabase: Record<string, Record<string, string>> = {};

  const fetchVisaDatabase = async () => {
    try {
      console.log("Fetching visa database...");
      const response = await fetch("https://cdn.jsdelivr.net/gh/ilyankou/passport-index-dataset@master/passport-index-tidy.csv");
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const csvText = await response.text();
      const lines = csvText.trim().split("\n");
      console.log("CSV sample:", lines.slice(0, 3).join(" | "));

      const db: Record<string, Record<string, string>> = {};
      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(",").map((c: string) => c.trim().replace(/^"|"$/g, ""));
        const passport = cols[0];
        const destination = cols[1];
        const requirement = cols[2];

        if (!passport || !destination || !requirement) continue;
        if (!db[passport]) db[passport] = {};

        let status = "Visa Required";
        const req = requirement.trim();

        if (req === "VF" || req === "3") {
          status = "Visa Free";
        } else if (!isNaN(Number(req)) && Number(req) > 0) {
          status = "Visa Free";
        } else if (req === "VOA") {
          status = "Visa on Arrival";
        } else if (req === "ETA") {
          status = "e-Visa";
        } else if (req === "-1" || req === "NA") {
          status = "Visa Required";
        }

        db[passport][destination] = status;
        count++;
      }

      visaDatabase = db;
      console.log(`Visa database loaded: ${count} entries, ${Object.keys(db).length} passports`);

      if (db["FR"]) {
        console.log("France->Germany:", db["FR"]["DE"]);
        console.log("France->US:", db["FR"]["US"]);
      }

    } catch (error) {
      console.error("Error loading visa database:", error);
    }
  };

  fetchVisaDatabase();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/visa-database", (req, res) => {
    res.json(visaDatabase);
  });

  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const systemInstruction = `You are "Travel Buddy", a friendly travel assistant for VisaNavigator. Help with itineraries, visa queries, safety tips, hotel and flight recommendations.
FLIGHTS: always use Skyscanner links format [✈️ Search Flights on Skyscanner](https://www.skyscanner.net/transport/flights/ORIGIN/DEST/).
HOTELS: always use Booking.com links format [🏨 Search Hotels on Booking.com](https://www.booking.com/search.html?ss=CITY).
Give 3 hotel options at budget, mid-range, and luxury price points.
For budget plans include flight estimate, hotels, day by day itinerary, daily budget breakdown, total cost estimate, top 3 activities with costs, money saving tips.
For itineraries structure as Day 1 with morning afternoon evening.
Always end with one helpful follow-up question. Use markdown and emojis.`;

    try {
      const botText = await callGeminiChat(message, history || [], systemInstruction);
      res.json({ text: botText });
    } catch (error: any) {
      console.error("Chat error:", error.message || error);
      res.status(500).json({ error: error.message || "Chat failed" });
    }
  });

  app.post("/api/visa-info", async (req, res) => {
    const { origin, dest, type } = req.body;

    const prompt = `Act as a professional visa and travel consultant.
Nationality: ${origin}
Destination: ${dest}
Visa Type: ${type}

Provide the following in JSON format only, no extra text:
{
  "status": "Visa Free" | "Visa Required" | "Visa on Arrival" | "e-Visa",
  "description": "Short summary of the requirement",
  "details": "Detailed explanation including stay duration and key documents",
  "tip": "One helpful travel tip for this specific route",
  "officialEmbassyUrl": "The direct URL to the official government or embassy visa information page. MUST be a direct .gov or official link. DO NOT provide a google search link."
}

Be strictly accurate.`;

    try {
      const text = await callGemini(prompt);
      const clean = text.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(clean));
    } catch (error: any) {
      console.error("Error in /api/visa-info:", error.message || error);
      res.status(500).json({ error: "Failed to fetch visa info" });
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
