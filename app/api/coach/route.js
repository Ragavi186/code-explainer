import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { code, problem, action } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local" }, { status: 500 });

    const prompt = `Problem: ${problem}\nCode: ${code}\nAction requested: ${action}\nProvide professional coding advice.\n\nReturn a JSON object with EXACTLY this key: "analysis" (string).`;

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
          contents: [{ parts: [{ text: prompt }] }],
          // 🔥 THE FIX: Enforcing strict JSON mode
          generationConfig: { responseMimeType: "application/json" } 
        })
      });
      data = await response.json();
      if (response.ok && data.candidates) { success = true; break; }
      lastError = data.error?.message || "Error";
    }

    if (!success) throw new Error(lastError);

    return NextResponse.json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) {
    console.error("Coach API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
