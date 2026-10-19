import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const prompt = `You are an expert programming tutor. Analyze this code snippet and return ONLY a valid JSON object without markdown formatting:
{
  "language": "Identified Programming Language",
  "summary": "What this code does in 2 simple sentences",
  "purpose": "Why and where developers use this code in real projects",
  "logicSteps": [
    "Step 1: Simple explanation",
    "Step 2: Simple explanation"
  ]
}

Code:
${code}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanJson = response.text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
