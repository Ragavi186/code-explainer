"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
  const [inputCode, setInputCode] = useState("");
  const [inputImage, setInputImage] = useState(null);

  const [currentChatId, setCurrentChatId] = useState("init");
  const [code, setCode] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatTitle, setChatTitle] = useState("New Analysis");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [history, setHistory] = useState([]);
  
  const titleInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestions = [
    "Explain this code step-by-step",
    "Find potential bugs here",
    "Optimize for better performance",
    "What is the time complexity?"
  ];

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setInputImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleExplain = async () => {
    if ((!inputCode.trim() && !inputImage) || loading) return;
    
    const activeCode = inputCode;
    const activeImage = inputImage;
    setCode(activeCode);
    setImage(activeImage);
    setInputCode("");
    setInputImage(null);
    setLoading(true);
    setResult(null);
    
    const activeId = currentChatId === "init" ? Date.now() : currentChatId;
    if (currentChatId === "init") setCurrentChatId(activeId);
    
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activeCode, image: activeImage }),
      });
      const data = await res.json();
      
      // Error handling added
      if (data.error) {
        setResult({ summary: `API Error: ${data.error}`, purpose: "Failed to connect", logicSteps: ["Please check your API key or network."] });
      } else {
        setResult(data);
      }
      
      setHistory(prev => {
        const newSession = { id: activeId, title: chatTitle === "New Analysis" ? "Code Analysis" : chatTitle, code: activeCode, image: activeImage, result: data.error ? null : data };
        const exists = prev.find(h => h.id === activeId);
        if (exists) return prev.map(h => h.id === activeId ? newSession : h);
        return [newSession, ...prev];
      });
      if (chatTitle === "New Analysis") setChatTitle("Code Analysis");
    } catch (err) {
      alert("Error generating explanation");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleExplain(); }
  };

  const resetChat = () => {
    setCurrentChatId(Date.now());
    setCode(""); setImage(null); setResult(null); setInputCode(""); setInputImage(null); setChatTitle("New Analysis");
    setLoading(false); // FIX: Stop infinite spinning when clicking "New Chat"
  };

  const loadChat = (session) => {
    setCurrentChatId(session.id);
    setCode(session.code); setImage(session.image); setResult(session.result); setChatTitle(session.title);
    setLoading(false); // FIX
  };

  const renderUserMessage = (msg) => {
    if (!msg.includes('```')) return <div className="whitespace-pre-wrap text-[15px]">{msg}</div>;
    const parts = msg.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const rawCode = part.slice(3, -3).replace(/^[a-z]*\n/i, '');
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-[#3e3e3e]">
            <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '16px', background: '#1e1f20' }}>
              {rawCode.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-wrap text-[15px] leading-relaxed">{part}</span>;
    });
  };

  return (
    <div className="absolute inset-0 flex bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden">
      {/* Sidebar Layout */}
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} bg-[#1e1f20] flex-col transition-all duration-300 overflow-hidden flex shrink-0`}>
        <div className="p-4 flex items-center justify-between min-w-[260px]">
          <button onClick={resetChat} className="flex-1 flex items-center gap-2 bg-[#282a2c] hover:bg-[#333537] text-sm px-4 py-2.5 rounded-full transition font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg>
            New chat
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="ml-2 p-2 hover:bg-[#282a2c] rounded-full text-[#c4c7c5] transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 min-w-[260px]">
          <div className="mb-4 pb-4 border-b border-[#333537] space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition bg-[#282a2c] text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Code Explainer
            </Link>
            <Link href="/practice" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-[#c4c7c5] hover:bg-[#282a2c]/50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              Practice Arena
            </Link>
          </div>

          <div className="text-xs font-semibold px-2 py-1 mb-2 text-[#c4c7c5]">Recent Chats</div>
          <div className="space-y-1">
            {!history.find(h => h.id === currentChatId) && (
               <div className="group flex items-center justify-between px-3 py-2.5 bg-[#282a2c] rounded-xl text-sm cursor-pointer border border-[#333537]">
                {isEditingTitle ? (
                  <input ref={titleInputRef} value={chatTitle} onChange={(e) => setChatTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)} className="bg-transparent border-none outline-none text-[#e3e3e3] w-full" />
                ) : (
                  <span className="truncate flex-1 text-white" onDoubleClick={() => setIsEditingTitle(true)}>{chatTitle}</span>
                )}
                {!isEditingTitle && (
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }} className="text-[#8e8e8e] hover:text-white transition opacity-60 group-hover:opacity-100 p-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                )}
              </div>
            )}
            
            {history.map(session => (
              <div key={session.id} onClick={() => loadChat(session)} className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${currentChatId === session.id ? 'bg-[#282a2c] border border-[#333537] text-white' : 'hover:bg-[#282a2c]/50 text-[#c4c7c5]'}`}>
                {isEditingTitle && currentChatId === session.id ? (
                  <input ref={titleInputRef} value={chatTitle} onChange={(e) => setChatTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)} className="bg-transparent border-none outline-none text-[#e3e3e3] w-full" />
                ) : (
                  <span className="truncate flex-1" onDoubleClick={() => { if(currentChatId === session.id) setIsEditingTitle(true); }}>{session.title}</span>
                )}
                {!isEditingTitle && currentChatId === session.id && (
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }} className="text-[#8e8e8e] hover:text-white transition opacity-60 group-hover:opacity-100 p-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-t border-[#333537] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">R</div>
          <div className="font-medium text-sm text-[#e3e3e3]">Ragavi R</div>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col relative h-full w-full">
        <header className="h-16 flex items-center gap-2 px-4 absolute top-0 w-full z-10 bg-gradient-to-b from-[#131314] to-transparent">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#282a2c] rounded-full text-[#c4c7c5] transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button>
          )}
          <span className="text-xl font-medium text-[#e3e3e3] px-2 tracking-tight flex items-center gap-2">
            DevChat 
            <span className="text-[#8e8e8e] text-base font-mono font-normal ml-1">&lt; / &gt;</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto pt-20 pb-40 px-4 md:px-0">
          <div className="max-w-3xl mx-auto space-y-8">
            {!result && !loading && !image && !code && (
              <div className="flex flex-col items-center justify-center mt-20 md:mt-28 space-y-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-[#282a2c] border border-[#333537] text-[#e3e3e3] flex items-center justify-center shadow-lg mx-auto">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                </div>
                
                <div className="text-center space-y-3">
                  <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight pb-1">How can I help you code?</h1>
                  <p className="text-[#8e8e8e]">Ask a question or paste your code snippet below.</p>
                </div>
              </div>
            )}

            {(code || image) && (result || loading) && (
              <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[85%] bg-[#282a2c] rounded-[24px] rounded-tr-md px-6 py-4 shadow-sm text-[#e3e3e3]">
                  {image && <img src={image} alt="Upload" className="max-w-full h-auto rounded-xl mb-3" />}
                  {code && renderUserMessage(code)}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border border-[#333537] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3e3e3" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div className="flex items-center gap-2 text-[15px] text-[#a8c7fa] font-medium pt-1">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>
                  Analyzing logic...
                </div>
              </div>
            )}

            {result && (
              <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full border border-[#333537] flex items-center justify-center shrink-0 mt-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3e3e3" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div className="flex-1 space-y-6 text-[15px] leading-7 bg-[#1e1f20] p-6 rounded-[24px]">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Quick Summary</h3>
                    <p className="text-[#c4c7c5]">{result.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Real-World Purpose</h3>
                    <p className="text-[#c4c7c5]">{result.purpose}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#a8c7fa] mb-4">Breakdown</h3>
                    <div className="space-y-4">
                      {result.logicSteps?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-[#282a2c] rounded-2xl border border-[#333537]">
                          <div className="min-w-[28px] h-7 rounded-full bg-[#131314] text-[#a8c7fa] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">{idx + 1}</div>
                          <p className="text-[#e3e3e3] leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-8 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            {!code && !loading && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setInputCode(s)} className="px-4 py-2 bg-[#1e1f20] border border-[#333537] rounded-full text-xs font-medium text-[#c4c7c5] hover:bg-[#282a2c] hover:text-white transition">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="relative bg-[#1e1f20] rounded-[32px] focus-within:bg-[#282a2c] transition-colors flex flex-col shadow-lg border border-[#333537]">
              {inputImage && (
                <div className="px-6 pt-5 pb-1 relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-[#444]">
                    <img src={inputImage} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setInputImage(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end p-2 pl-3">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="p-3 text-[#c4c7c5] hover:bg-[#333537] hover:text-white rounded-full transition shrink-0" title="Attach file">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message DevChat or paste code using ``` ..."
                  rows={inputImage ? 1 : 1}
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                  className="flex-1 bg-transparent py-4 px-3 text-[16px] text-[#e3e3e3] placeholder-[#8e8e8e] resize-none focus:outline-none leading-relaxed"
                />

                <button onClick={handleExplain} disabled={loading || (!inputCode.trim() && !inputImage)} className={`p-3 m-1 rounded-full flex items-center justify-center transition shrink-0 ${inputCode.trim() || inputImage ? 'bg-white text-black' : 'bg-[#333537] text-[#131314]'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[12px] text-[#8e8e8e]">DevChat can make mistakes. Verify critical code logic.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
