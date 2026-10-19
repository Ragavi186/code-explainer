"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleExplain = async () => {
    if ((!code.trim() && !image) || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, image }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Error generating explanation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetChat = () => {
    setCode("");
    setImage(null);
    setResult(null);
  };

  return (
    <div className="flex h-screen bg-[#212121] text-[#ECECEC] font-sans overflow-hidden">
      {/* Sidebar (ChatGPT Style) */}
      <div className="hidden md:flex w-[260px] bg-[#171717] flex-col border-r border-[#2f2f2f]">
        <div className="p-3">
          <button 
            onClick={resetChat}
            className="w-full flex items-center justify-between bg-transparent hover:bg-[#2f2f2f] text-sm px-3 py-2.5 rounded-lg transition"
          >
            <div className="flex items-center gap-2 font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              DevChat
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 text-xs text-[#8e8e8e]">
          <div className="font-semibold px-2 py-1 mb-1">Today</div>
          <div className="px-2 py-2 truncate bg-[#2f2f2f]/50 rounded-lg text-[#ECECEC] cursor-pointer">Code Analysis Request</div>
        </div>
        <div className="p-4 border-t border-[#2f2f2f] text-xs flex items-center gap-2 cursor-pointer hover:bg-[#2f2f2f] transition m-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white">R</div>
          <div className="font-medium">Ragavi R</div>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Header - Model Switcher */}
        <header className="h-14 flex items-center px-4 md:px-6 absolute top-0 w-full z-10">
          <button className="flex items-center gap-2 text-[#ECECEC] font-semibold text-lg hover:bg-[#2f2f2f] px-3 py-1.5 rounded-xl transition">
            DevChat <span className="text-[#8e8e8e] text-base font-normal">3.8 Flash</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </header>

        {/* Scrollable Chat Area */}
        <main className="flex-1 overflow-y-auto pt-16 pb-36 px-4 md:px-0">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {!result && !loading && !image && !code && (
              <div className="flex flex-col items-center justify-center mt-32 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <h2 className="text-2xl font-semibold text-white">How can I help with your code today?</h2>
              </div>
            )}

            {/* User Prompt */}
            {(code || image) && (result || loading) && (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-[#2f2f2f] text-[#ECECEC] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm">
                  {image && <img src={image} alt="Code Snippet" className="max-w-full h-auto rounded-lg mb-3 border border-[#3e3e3e]" />}
                  {code && <pre className="font-mono text-sm whitespace-pre-wrap">{code}</pre>}
                </div>
              </div>
            )}

            {/* AI Loading State */}
            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border border-[#3e3e3e] flex items-center justify-center bg-white shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div className="flex items-center gap-2 text-[15px] text-[#b4b4b4] pt-1">
                  <span className="w-2 h-2 rounded-full bg-[#ECECEC] animate-pulse" />
                  Analyzing code structure...
                </div>
              </div>
            )}

            {/* AI Response Card */}
            {result && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border border-[#3e3e3e] flex items-center justify-center bg-white shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div className="flex-1 space-y-6 text-[15px] leading-7">
                  
                  <div className="flex items-center gap-3">
                     <span className="font-medium text-white">DevChat</span>
                     <span className="text-xs font-mono px-2 py-0.5 bg-[#2f2f2f] text-[#ECECEC] rounded-md border border-[#3e3e3e]">
                      {result.language}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-1">What it does</h3>
                    <p className="text-[#d1d1d1]">{result.summary}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-1">Real-World Purpose</h3>
                    <p className="text-[#d1d1d1]">{result.purpose}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">Logic Walkthrough</h3>
                    <div className="space-y-3">
                      {result.logicSteps?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-[#2f2f2f] border border-[#3e3e3e] flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-[#d1d1d1]">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                     <button onClick={() => handleCopy(JSON.stringify(result, null, 2))} className="flex items-center gap-2 text-xs text-[#8e8e8e] hover:text-[#ECECEC] transition">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                       {copied ? "Copied" : "Copy"}
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#2f2f2f] rounded-2xl border border-[#3e3e3e] focus-within:border-[#676767] shadow-lg flex flex-col transition">
              
              {/* Image Preview Area */}
              {image && (
                <div className="px-4 pt-4 pb-2 relative">
                  <div className="w-16 h-16 rounded-xl border border-[#3e3e3e] overflow-hidden relative group">
                    <img src={image} alt="Upload preview" className="w-full h-full object-cover opacity-80" />
                    <button onClick={() => setImage(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end p-2">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="p-2.5 text-[#b4b4b4] hover:text-[#ECECEC] hover:bg-[#3e3e3e] rounded-xl transition ml-1"
                  title="Attach screenshot"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Message DevChat..."
                  rows={image ? 1 : 1}
                  style={{ minHeight: '44px', maxHeight: '200px' }}
                  className="flex-1 bg-transparent py-3 px-3 text-[15px] text-[#ECECEC] placeholder-[#8e8e8e] resize-none focus:outline-none"
                />

                <button
                  onClick={handleExplain}
                  disabled={loading || (!code.trim() && !image)}
                  className={`p-1.5 m-1.5 rounded-lg flex items-center justify-center transition ${code.trim() || image ? 'bg-white text-black' : 'bg-[#3e3e3e] text-[#8e8e8e]'}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                </button>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#737373] mt-3">
              DevChat can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
