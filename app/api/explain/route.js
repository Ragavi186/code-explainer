import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { code, image } = await req.json();

    if (!code && !image) {
      return NextResponse.json({ error: "Code or image is required" }, { status: 400 });
    }

    let promptContent = [];

    if (image) {
      const [mimeTypePart, base64Data] = image.split(',');
      const mimeType = mimeTypePart.match(/:(.*?);/)[1];
      
      promptContent.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      promptContent.push("Analyze the code provided in this image.");
    }

    if (code) {
      promptContent.push(`Analyze this code snippet:\n${code}`);
    }

    promptContent.push(`
Explain:
1. What programming language it is
2. What the code does in 2 simple sentences
3. Why and where developers use this in real projects
4. Step-by-step logic breakdown in plain terms.`);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptContent,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            language: { type: "STRING" },
            summary: { type: "STRING" },
            purpose: { type: "STRING" },
            logicSteps: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["language", "summary", "purpose", "logicSteps"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze code" }, { status: 500 });
  }
}
