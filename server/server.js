require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/explain", async (req, res) => {
    const { text } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `
        Word: ${text}

        Give:
        - pronunciation
        - meaning in 1-2 simple sentences
        - definition in 10-15 words
        `,

            config: {
                thinkingConfig: {
                    thinkingLevel: "MINIMAL"
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

        res.json(result);

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            error: "Failed to generate explanation"
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});