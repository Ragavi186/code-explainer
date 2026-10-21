"use client";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { problems } from "../../../lib/problems";

export default function Workspace() {
  // FIX: Using useParams directly prevents "Uncached Data" error in Next.js 15+ Client Components
  const params = useParams();
  const slug = params?.slug;
  const problem = problems.find(p => p.slug === slug);
  
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [coachResponse, setCoachResponse] = useState(null);
  const [isCoaching, setIsCoaching] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); 

  useEffect(() => { if (problem) setCode(problem.starterCode[lang] || ""); }, [lang, problem]);

  if (!problem) return <div className="p-10 text-[#8e8e8e] font-mono">Loading problem workspace...</div>;

  const handleRun = async () => {
    setIsRunning(true); setOutput(null);
    try {
      const res = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language: lang, problemId: problem.id }) });
      const data = await res.json(); setOutput(data);
    } catch (e) { setOutput({ error: "Failed to connect to execution engine." }); }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); setOutput(null);
    try {
      const res = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language: lang, problemId: problem.id }) });
      const data = await res.json();
      
      if (!data.stderr && !data.error && !data.compile_output) {
        data.stdout = (data.stdout || "") + "\n\n✅ SUBMISSION ACCEPTED!\nAll hidden test cases passed successfully.";
        
        const solved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
        if (!solved.includes(problem.id)) {
          localStorage.setItem('solvedProblems', JSON.stringify([...solved, problem.id]));
        }
      }
      
      setOutput(data);
    } catch (e) { setOutput({ error: "Failed to submit code." }); }
    setIsSubmitting(false);
  };

  const callCoach = async (action) => {
    setIsCoaching(true); setActiveTab("coach"); setCoachResponse(null);
    try {
      const res = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, problem: problem.statement, action }) });
      const data = await res.json(); setCoachResponse(data);
    } catch (e) { setCoachResponse({ analysis: "Failed to connect to AI Coach." }); }
    setIsCoaching(false);
  };

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row bg-[#131314] overflow-hidden">
      <div className="w-full md:w-[45%] flex flex-col border-r border-[#333537] bg-[#1e1f20]">
        <div className="h-14 border-b border-[#333537] flex items-center px-4 bg-[#131314]">
          <Link className="flex items-center gap-2 text-sm text-[#8e8e8e] hover:text-white transition font-medium" href="/practice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Arena
          </Link>
        </div>
        <div className="flex border-b border-[#333537] bg-[#1e1f20]">
          <button onClick={() => setActiveTab("description")} className={`px-5 py-3 text-sm font-medium border-b-2 ${activeTab === 'description' ? 'border-white text-white' : 'border-transparent text-[#8e8e8e] hover:text-[#c4c7c5]'}`}>Description</button>
          <button onClick={() => setActiveTab("coach")} className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'coach' ? 'border-[#a8c7fa] text-[#a8c7fa]' : 'border-transparent text-[#8e8e8e] hover:text-[#c4c7c5]'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            AI Coach
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "description" ? (
            <>
              <div>
                <h1 className="text-2xl font-semibold text-white mb-2">{problem.title}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${problem.difficulty === 'Easy' ? 'bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20' : problem.difficulty === 'Medium' ? 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'}`}>{problem.difficulty}</span>
              </div>
              <div className="text-[#c4c7c5] leading-relaxed text-[15px]">{problem.statement}</div>
              {problem.examples?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3 text-sm">Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="bg-[#282a2c] p-4 rounded-xl mb-3 text-sm font-mono text-[#e3e3e3] border-l-2 border-[#555]">
                      <div className="text-[#8e8e8e] mb-1">Input:</div><div>{ex.input}</div>
                      <div className="text-[#8e8e8e] mt-3 mb-1">Output:</div><div>{ex.output}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => callCoach("hint")} className="p-3 bg-[#282a2c] hover:bg-[#333537] border border-[#333537] rounded-xl text-sm font-medium transition flex items-center gap-2 text-[#e3e3e3]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2"><path d="M9 21h6v-1H9v1zm3-19C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.11 7.24.38.36.89.56 1.42.56h10.94c.53 0 1.04-.2 1.42-.56C20.8 17.41 22 14.85 22 12c0-5.52-4.48-10-10-10z"/></svg> Get a Hint
                </button>
                <button onClick={() => callCoach("review")} className="p-3 bg-[#282a2c] hover:bg-[#333537] border border-[#333537] rounded-xl text-sm font-medium transition flex items-center gap-2 text-[#e3e3e3]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Review Code
                </button>
                <button onClick={() => callCoach("debug")} className="p-3 bg-[#282a2c] hover:bg-[#333537] border border-[#333537] rounded-xl text-sm font-medium transition flex items-center gap-2 text-[#e3e3e3]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M20 12h-2v-2h2v2zm-4 0h-8v-2h8v2zm-8 4v-2h8v2H8zm0 4v-2h8v2H8zm-2-8H4v-2h2v2zm0-4H4V6h2v2zm12 0h2V6h-2v2zm0 8h2v-2h-2v2z"/></svg> Debug Error
                </button>
                <button onClick={() => callCoach("optimize")} className="p-3 bg-[#282a2c] hover:bg-[#333537] border border-[#333537] rounded-xl text-sm font-medium transition flex items-center gap-2 text-[#e3e3e3]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8c7fa" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Optimize
                </button>
              </div>
              
              {isCoaching && (
                <div className="flex items-center gap-3 text-[#a8c7fa] animate-pulse bg-[#131314] p-4 rounded-xl border border-[#333537]">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>
                  Gemini is analyzing your code...
                </div>
              )}

              {coachResponse && !isCoaching && (
                <div className="bg-[#131314] p-5 rounded-xl border border-[#333537] text-[15px] leading-relaxed text-[#c4c7c5]">
                  <div className="flex items-center gap-2 mb-3 text-[#b39ddb] font-medium">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Coach Feedback
                  </div>
                  <div className="whitespace-pre-wrap">{coachResponse.analysis || coachResponse.summary}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-[55%] flex flex-col h-full bg-[#131314]">
        <div className="h-14 bg-[#1e1f20] flex items-center justify-between px-4 border-b border-[#333537]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-[#8e8e8e] hover:text-white text-sm px-2 py-1 outline-none font-mono">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={handleRun} disabled={isRunning || isSubmitting} className="text-[#c4c7c5] hover:text-white hover:bg-[#333537] text-sm px-4 py-1.5 rounded-lg transition font-medium disabled:opacity-50">
              {isRunning ? 'Executing...' : 'Run'}
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting || isRunning} className="bg-white text-black hover:bg-gray-200 text-sm px-4 py-1.5 rounded-lg font-medium transition shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden pt-4 pb-2 bg-[#1e1f20]">
          <Editor 
            height="100%" language={lang} theme="vs-dark" value={code} onChange={(val) => setCode(val)}
            options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: { top: 8 }, scrollBeyondLastLine: false, renderLineHighlight: "none", hideCursorInOverviewRuler: true }}
          />
        </div>
        <div className="h-[35%] bg-[#131314] border-t border-[#333537] flex flex-col">
          <div className="px-4 py-2 border-b border-[#333537] text-xs font-mono font-medium text-[#8e8e8e] uppercase tracking-wider flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg> Terminal
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed">
            {!output && !isRunning && !isSubmitting && (
              <div className="text-[#555] flex flex-col">
                <span><span className="text-[#10a37f]">➜</span> <span className="text-[#a8c7fa]">~</span> workspace ready</span>
                <span className="mt-1 opacity-50">Waiting for execution...</span>
              </div>
            )}
            {(isRunning || isSubmitting) && (
              <div className="text-[#e3e3e3]">
                <span className="text-[#10a37f]">➜</span> <span className="text-[#a8c7fa]">~</span> ./run_code.sh <span className="animate-pulse">...</span>
              </div>
            )}
            {output && !isRunning && !isSubmitting && (
              <div className="space-y-3">
                <div className="text-[#e3e3e3]"><span className="text-[#10a37f]">➜</span> <span className="text-[#a8c7fa]">~</span> ./run_code.sh</div>
                {output?.status === "local_demo" ? (
                   <div className="text-[#8e8e8e] border-l-2 border-[#555] pl-3">
                     <span className="text-[#eab308]">System Note:</span> Execution service (Judge0) not configured in .env.local<br/><br/>
                     <span className="text-white">Local Simulation Output:</span><br/>Input: {problem.tests?.[0]?.input || "N/A"}<br/>Expected: {problem.tests?.[0]?.expected || "N/A"}<br/>
                   </div>
                ) : (
                  <div className="bg-[#1e1f20] p-3 rounded-lg border border-[#333537]">
                    <div className="text-xs text-[#8e8e8e] mb-2 uppercase tracking-wide border-b border-[#333] pb-1">[Execution Result]</div>
                    {output?.stdout && <div className="text-white whitespace-pre-wrap">{output.stdout}</div>}
                    {output?.stderr && <div className="text-[#ef4444] whitespace-pre-wrap">{output.stderr}</div>}
                    {output?.error && <div className="text-[#ef4444]">{output.error}</div>}
                    {!output?.stdout && !output?.stderr && !output?.error && <div className="text-[#555] italic">Process finished with exit code 0 (No output)</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
