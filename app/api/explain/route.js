import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { code, image } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local" }, { status: 500 });

    let textPrompt = `Analyze this code snippet:\n${code || "See image"}\n\nReturn a JSON object with EXACTLY these keys: "language" (string), "summary" (string), "purpose" (string), "logicSteps" (array of strings).`;
    let contents = [{ parts: [{ text: textPrompt }] }];

    if (image) {
      const [mimeTypePart, base64Data] = image.split(',');
      const mimeType = mimeTypePart.match(/:(.*?);/)[1];
      contents = [{ parts: [{ text: textPrompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }];
    }

    const modelRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelData = await modelRes.json();
    if (!modelRes.ok || !modelData.models) throw new Error(modelData.error?.message || "Invalid Key");

    const validModels = modelData.models.filter(m => m.supportedGenerationMethods?.includes("generateContent")).map(m => m.name);

    let data, success = false, lastError = "No models found";

    for (const modelName of validModels) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents,
          // 🔥 THE FIX: Forcing Gemini at the system level to output ONLY valid JSON
          generationConfig: { responseMimeType: "application/json" } 
        })
      });
      data = await response.json();
      if (response.ok && data.candidates) { success = true; break; }
      lastError = data.error?.message || "Error";
    }

    if (!success) throw new Error(lastError);

    // No regex needed anymore. The API guarantees pure JSON.
    return NextResponse.json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) {
    console.error("Explain API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
