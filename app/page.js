"use client";
import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (!code) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Error generating explanation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">CodeExplainer</h1>
      <p className="text-slate-400 mb-6">Paste any code snippet to get a simple, beginner-friendly breakdown.</p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Paste code here..."
        className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleExplain}
        disabled={loading}
        className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Explain Code"}
      </button>

      {result && (
        <div className="mt-8 space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-900/60 text-blue-300 rounded-full">
              {result.language}
            </span>
            <h2 className="text-xl font-bold mt-3">What it does</h2>
            <p className="text-slate-300 mt-1">{result.summary}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">Why it is used</h2>
            <p className="text-slate-300 mt-1">{result.purpose}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">Core Logic Breakdown</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300 mt-2">
              {result.logicSteps?.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
