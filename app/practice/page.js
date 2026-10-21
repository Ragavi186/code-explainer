"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { problems } from "../../lib/problems";

export default function PracticeDashboard() {
  const [filter, setFilter] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [solvedIds, setSolvedIds] = useState([]); // FIX: Safely track solved IDs in state

  useEffect(() => {
    // FIX: Only access localStorage after the component mounts on the client-side
    const ids = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
    setSolvedIds(ids);
    const solvedProbs = problems.filter(p => ids.includes(p.id));
    setStats({
      total: solvedProbs.length,
      easy: solvedProbs.filter(p => p.difficulty === 'Easy').length,
      medium: solvedProbs.filter(p => p.difficulty === 'Medium').length,
      hard: solvedProbs.filter(p => p.difficulty === 'Hard').length
    });
  }, []);

  const filteredProblems = filter === "All" ? problems : problems.filter(p => p.difficulty === filter);

  return (
    <div className="absolute inset-0 flex bg-[#131314] text-[#e3e3e3] overflow-hidden">
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} bg-[#1e1f20] flex-col transition-all duration-300 overflow-hidden flex shrink-0 border-r border-[#333537]`}>
        <div className="p-4 flex items-center justify-between min-w-[260px]">
          <Link className="flex-1 flex items-center gap-2 bg-[#282a2c] hover:bg-[#333537] text-sm px-4 py-2.5 rounded-full transition font-medium" href="/practice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18M9 21V9"></path></svg>
            Arena Home
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-2 p-2 hover:bg-[#282a2c] rounded-full text-[#c4c7c5] transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 min-w-[260px]">
          <div className="mb-4 pb-4 border-b border-[#333537] space-y-1">
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-[#c4c7c5] hover:bg-[#282a2c]/50" href="/">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Code Explainer
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition bg-[#282a2c] text-white" href="/practice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              Practice Arena
            </Link>
          </div>
          <div className="text-xs font-semibold px-2 py-1 mb-2 text-[#c4c7c5]">My Progress</div>
          <div className="px-3 py-2.5 bg-[#131314] rounded-xl text-sm text-[#10a37f] border border-[#333537] font-medium">
            {stats.total} Problems Solved
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="mb-6 p-2 hover:bg-[#282a2c] rounded-full text-[#c4c7c5] transition border border-[#333537]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        )}
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
          <section className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Coding Arena</h1>
            <p className="text-[#c4c7c5]">Master data structures and algorithms with AI-assisted coaching.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="bg-[#1e1f20] border border-[#333537] p-5 rounded-2xl">
                <div className="text-sm text-[#8e8e8e] mb-1">Total Solved</div>
                <div className="text-3xl font-medium text-white">{stats.total}<span className="text-lg text-[#555]">/20</span></div>
              </div>
              <div className="bg-[#1e1f20] border border-[#333537] p-5 rounded-2xl">
                <div className="text-sm text-[#10a37f] mb-1">Easy</div>
                <div className="text-2xl font-medium text-white">{stats.easy}</div>
              </div>
              <div className="bg-[#1e1f20] border border-[#333537] p-5 rounded-2xl">
                <div className="text-sm text-[#eab308] mb-1">Medium</div>
                <div className="text-2xl font-medium text-white">{stats.medium}</div>
              </div>
              <div className="bg-[#1e1f20] border border-[#333537] p-5 rounded-2xl">
                <div className="text-sm text-[#ef4444] mb-1">Hard</div>
                <div className="text-2xl font-medium text-white">{stats.hard}</div>
              </div>
            </div>
          </section>

          <section className="bg-[#1e1f20] border border-[#333537] rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-[#333537] flex items-center justify-between bg-[#282a2c]/50">
              <div className="flex gap-2">
                {["All", "Easy", "Medium", "Hard"].map(diff => (
                  <button key={diff} onClick={() => setFilter(diff)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === diff ? 'bg-[#333537] text-white' : 'text-[#c4c7c5] hover:bg-[#333537]/50'}`}>
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[#333537]">
              {filteredProblems.map((p, idx) => {
                // FIX: State-based condition avoids Next.js server-side mismatch
                const isSolved = solvedIds.includes(p.id);
                return (
                  <Link className="flex items-center justify-between p-5 hover:bg-[#282a2c] transition group" href={`/practice/${p.slug}`} key={p.id}>
                    <div className="flex items-center gap-4">
                      <span className="text-[#8e8e8e] w-6 text-sm font-mono">{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="font-medium text-[#e3e3e3] group-hover:text-white transition flex items-center gap-2">
                          {p.title} {isSolved && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </h3>
                        <p className="text-xs text-[#8e8e8e] mt-1">{p.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${p.difficulty === 'Easy' ? 'bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20' : p.difficulty === 'Medium' ? 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'}`}>{p.difficulty}</span>
                      <button className="text-[#c4c7c5] group-hover:text-[#131314] bg-[#333537] group-hover:bg-white px-4 py-1.5 rounded-lg text-sm font-medium transition opacity-0 group-hover:opacity-100">{isSolved ? 'Review' : 'Solve'}</button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
