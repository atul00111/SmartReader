require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// In-memory cache: repeated lookups of the same word skip the
// Gemini call entirely and return instantly. Simple FIFO eviction
// once it hits CACHE_MAX_SIZE, so memory stays bounded.
const cache = new Map();
const CACHE_MAX_SIZE = 500;

app.get("/", (req, res) => {
    res.send("SmartReader backend is running");
});

app.post("/explain", async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Missing or invalid 'text'" });
    }

    const key = text.trim().toLowerCase();

    const cached = cache.get(key);
    if (cached) {
        return res.json(cached);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `Word: ${key}

Give:
- pronunciation
- meaning in 1-2 simple sentences
- definition in 10-15 words`,

            config: {
                thinkingConfig: {
                    thinkingLevel: "minimal"
                },

                responseMimeType: "application/json",

                responseSchema: {
                    type: "object",
                    properties: {
                        pronunciation: { type: "string" },
                        meaning: { type: "string" },
                        definition: { type: "string" }
                    },
                    required: [
                        "pronunciation",
                        "meaning",
                        "definition"
                    ]
                }
            }
        });

        const result = JSON.parse(response.text);

        console.log(result);

        if (cache.size >= CACHE_MAX_SIZE) {
            cache.delete(cache.keys().next().value);
        }
        cache.set(key, result);

        res.json(result);

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            error: "Failed to generate explanation"
        });
    }
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});