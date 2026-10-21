import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { code, language, problemId } = await req.json();
    
    // Map languages to Judge0 CE IDs
    const langMap = { javascript: 63, python: 71 };
    const language_id = langMap[language];

    const apiKey = process.env.JUDGE0_API_KEY;
    
    // DEMO MODE: If no API key, return a safe simulated response so UI doesn't break
    if (!apiKey) {
      await new Promise(r => setTimeout(r, 800)); // simulate latency
      return NextResponse.json({ 
        status: "local_demo", 
        message: "No Judge0 API Key found. Real execution disabled." 
      });
    }

    // REAL EXECUTION via Judge0 RapidAPI
    const submitRes = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        source_code: code,
        language_id: language_id,
        // In a full production app, we would query the DB for the problem's hidden test cases
        stdin: "Demo Input"
      })
    });

    const data = await submitRes.json();
    return NextResponse.json({
      stdout: data.stdout,
      stderr: data.stderr,
      compile_output: data.compile_output,
      time: data.time,
      memory: data.memory
    });

  } catch (error) {
    console.error("Execution Error:", error);
    return NextResponse.json({ error: "Execution engine failed." }, { status: 500 });
  }
}
