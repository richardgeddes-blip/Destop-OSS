import React from 'react';
import { Mic, Send } from 'lucide-react';

export const ArchitectureApp: React.FC<{ isCenter?: boolean }> = ({ isCenter }) => {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: 'user' | 'agent', text: string, source?: string, tags?: string[] }[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewState, setViewState] = React.useState<'normal' | 'split' | 'expanded'>('normal');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Connects to the AI Studio backend using Gemini
      const res = await fetch('/api/voice/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage.text })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Backend AI not reachable');
      }
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: 'agent',
        text: data.answer || "No summary provided.",
        source: data.source,
        tags: data.tags
      }]);
      
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: `⚠️ Error: ${err.message || 'Failed to connect to backend.'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F9FA] text-slate-800 p-6 flex flex-col overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
           <div className="text-3xl">🛠️</div>
           <div>
             <h1 className="text-xl font-bold tracking-wide text-slate-900 uppercase">Dyslexia Desktop Architecture & Capabilities</h1>
             <p className="text-sm text-slate-500 font-medium">Glare-Free Paper Cream Canvas (#F8F9FA)</p>
           </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
           <button 
             onClick={() => setViewState(prev => prev === 'split' ? 'normal' : 'split')}
             className={`px-2 py-1.5 border rounded shadow-sm flex items-center justify-center transition-colors ${viewState === 'split' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} 
             title="Split View"
           >
              <div className="w-4 h-4 flex items-center justify-center">◫</div>
           </button>
           <button 
             onClick={() => setViewState(prev => prev === 'expanded' ? 'normal' : 'expanded')}
             className={`px-2 py-1.5 border rounded shadow-sm flex items-center justify-center transition-colors ${viewState === 'expanded' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} 
             title="Expand Surface"
           >
              <div className="w-4 h-4 flex items-center justify-center">⤢</div>
           </button>
        </div>
      </div>
      
      {viewState === 'split' && (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 text-sm font-bold flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           SPLIT VIEW ACTIVE: The center canvas is now logically partitioned 50/50.
        </div>
      )}
      
      {viewState === 'expanded' && (
        <div className="w-full bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6 text-sm font-bold flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           EXPANDED SURFACE ACTIVE: The center canvas is overlaying adjacent 1/8 columns for deep focus.
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><span className="text-yellow-500">▬</span> System Specification: 1/8 & 1/2 Proportion Grid</h2>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded tracking-wider">ACTIVE LAYOUT</span>
           </div>
           <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                 <h3 className="font-bold text-slate-800 mb-1">Left & Right Columns (1/8 Each)</h3>
                 <p>Each outer column takes 1/8 of screen width (12.5%). Two columns per side efficiently stack vertical tools, logs, and live previews.</p>
              </div>
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                 <h3 className="font-bold text-slate-800 mb-1">Center Workspace (1/2)</h3>
                 <p>Occupies 1/2 (50.0%) of screen width in glare-free soft cream (#F8F9FA). Supports single view, expanded view, and dual 50/50 split view.</p>
              </div>
              <div className="border border-slate-100 p-3 rounded bg-slate-50">
                 <h3 className="font-bold text-slate-800 mb-1">Bottom Shelf (1/8 Height)</h3>
                 <p>Anchored underneath the chat interaction, with adjustable/symmetrical placeholder states maintaining visual balance when inactive.</p>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <h3 className="font-bold text-slate-800 mb-2 uppercase text-[10px]">Center Toolbar Controls:</h3>
              <ul className="space-y-1 pl-4 list-disc marker:text-slate-300">
                 <li><strong>◫ Split View:</strong> Toggles a 50/50 split screen inside the center workspace (e.g., live candlestick charts next to research).</li>
                 <li><strong>⤢ Expand Surface:</strong> Temporarily expands the working surface across the side columns for deep focus or wide trading charts.</li>
                 <li><strong>⚡ Quick Peek:</strong> Opens a 1-minute modal overlay without moving the active central workspace.</li>
              </ul>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4 p-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                {msg.text}
              </div>
              {msg.source && (
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                   <span>Source: {msg.source}</span>
                   {msg.tags && msg.tags.length > 0 && (
                     <div className="flex gap-1">
                       {msg.tags.map(t => (
                         <span key={t} className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">{t}</span>
                       ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      )}
      
      {!messages.length && <div className="flex-1 min-h-[10px]" />}

      {/* The bottom chat bar embedded into the container, not floating. */}
      <div className="w-full mt-auto border-t border-slate-200 pt-3 pb-2 flex flex-col shrink-0" style={{ resize: 'vertical', overflow: 'hidden', minHeight: '110px', maxHeight: '50vh' }}>
         <div className="flex items-center justify-between mb-2 px-1 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-700 font-semibold tracking-wide">Conversational Chat & Voice Hub Active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Drag top edge to resize ↑↓</span>
         </div>
         <div className="bg-white border border-slate-300 rounded-lg p-2 flex items-start gap-3 shadow-sm hover:border-slate-400 focus-within:border-slate-500 transition-colors flex-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
               <Mic className="w-4 h-4" />
            </div>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, type a directive, or summon a window..." 
              className="flex-1 h-full outline-none text-slate-700 bg-transparent text-sm placeholder:text-slate-400 resize-none font-sans" 
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 rounded bg-[#111] text-white flex items-center justify-center hover:bg-black disabled:opacity-50 shrink-0 transition-colors shadow-sm mt-0.5"
            >
               <Send className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
};

export const ChromeApp = () => (
  <div className="h-full w-full bg-[#0a0a0a] text-slate-300 p-3 flex flex-col text-[11px] font-mono">
    <div className="flex justify-between text-slate-500 mb-2">
      <span>finance.yahoo.com/live</span>
      <span className="text-emerald-400 flex items-center gap-1 font-sans font-bold text-[10px]"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>LIVE</span>
    </div>
    <div className="flex justify-between items-end mb-4">
      <span className="text-slate-400">NVDA (5-min)</span>
      <span className="text-emerald-400 font-sans text-base font-bold">$129.40 (+3.2%)</span>
    </div>
    <div className="flex gap-2">
       <span className="px-2 py-1 bg-[#1a1a1a] rounded text-[#888] border border-[#222] hover:bg-[#222] cursor-pointer">Market News</span>
       <span className="px-2 py-1 bg-[#1a1a1a] rounded text-[#888] border border-[#222] hover:bg-[#222] cursor-pointer">Irrigation PDF</span>
    </div>
  </div>
);

export const GeminiApp = () => (
  <div className="h-full w-full bg-[#0a0a0a] text-slate-300 p-3 flex flex-col text-xs font-sans">
     <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
           <div className="w-2 h-2 rounded-full bg-blue-500" />
           Turf Aeration Study
        </div>
        <span className="text-slate-500 text-[10px] hover:text-slate-300 cursor-pointer">Copy</span>
     </div>
     <p className="text-[#ccc] leading-relaxed mb-4 text-[11px]">
       Early morning watering (5:30-6:45 AM) reduces evaporative loss by 28%. Split fertilizer applications recommended.
     </p>
     <div className="mt-auto flex justify-between text-[#666] text-[10px]">
        <span>Ready (2 files)</span>
        <span className="hover:text-slate-300 cursor-pointer">Append to Notes</span>
     </div>
  </div>
);

export const NotesApp = () => (
  <div className="h-full w-full bg-[#0a0a0a] text-[#ccc] p-3 flex flex-col text-[11px] font-mono leading-loose">
     <ul className="list-disc pl-4 space-y-1 marker:text-[#555]">
        <li>Layout simplified: title lines only</li>
        <li>Conversational hub is vertically resizable</li>
        <li>1/4 • 1/2 • 1/4 grid proportion active</li>
        <li>Zero VRAM overhead (OpenRouter API)</li>
     </ul>
  </div>
);

export const DesktopMirrorApp = () => (
  <div className="h-full w-full bg-[#0a0a0a] text-slate-300 p-3 flex flex-col text-[11px] font-mono">
     <div className="flex justify-between items-center text-yellow-500 mb-3">
        <span>C:\Users\richa\Desktop</span>
        <span className="text-[#666]">19:36:12</span>
     </div>
     <div className="flex items-center gap-2 mb-2 text-[#ccc]">
        <div className="w-2.5 h-2.5 bg-blue-400/80 rounded-[2px]" /> Lawn_Opening.docx
     </div>
     <div className="flex items-center gap-2 text-[#ccc]">
        <div className="w-2.5 h-2.5 bg-green-400/80 rounded-[2px]" /> Docker_Log.xlsx
     </div>
     <div className="mt-auto flex justify-between items-end text-[#555] text-[10px]">
        <span>Physical Desktop</span>
        <span className="text-emerald-500/80 font-bold tracking-wide">LIVE 1-CLICK ACCESS</span>
     </div>
  </div>
);

export const GooseApp: React.FC<{ isCenter?: boolean }> = ({ isCenter }) => (
  <div className={`h-full w-full bg-[#0a0a0a] text-slate-300 p-4 flex flex-col font-sans ${isCenter ? 'text-sm' : 'text-[11px]'}`}>
     <div className="font-bold text-yellow-500 mb-4 flex justify-between items-center border-b border-[#222] pb-2">
        <span className="uppercase tracking-widest text-xs">Goose AI Assistant</span>
        <div className="flex items-center gap-2">
           <span className="text-xs text-[#666]">Session #74</span>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
     </div>
     
     <div className="flex-1 overflow-y-auto flex flex-col gap-3">
       <div className="flex flex-col gap-1">
         <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Goose</span>
         <p className="text-[#ccc]">Allow Goose to modify <span className="text-yellow-400/90 font-mono">workspace.html</span>?</p>
       </div>
       <div className="flex items-center gap-2 mb-2">
          <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">Allow 1-Click</button>
          <button className="px-3 py-1 bg-[#1a1a1a] text-[#888] text-xs rounded border border-[#333] hover:bg-[#222] transition-colors">Inspect</button>
       </div>
     </div>

     {isCenter && (
       <div className="mt-auto pt-4 border-t border-[#222]">
         <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 focus-within:border-indigo-500/50 transition-colors">
           <SquareTerminal className="w-4 h-4 text-indigo-400" />
           <input 
             type="text"
             placeholder="Message Goose AI..."
             className="flex-1 bg-transparent outline-none text-[#ccc] placeholder-[#555]"
           />
           <button className="text-xs bg-indigo-500/20 text-indigo-400 font-bold px-3 py-1 rounded hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors">
             SEND
           </button>
         </div>
         <div className="text-[10px] text-emerald-500/80 flex items-center gap-1 font-medium mt-2">
            ✓ 3/3 constraints confirmed
         </div>
       </div>
     )}
  </div>
);

export const HermesApp: React.FC<{ isCenter?: boolean }> = ({ isCenter }) => (
  <div className={`h-full w-full bg-[#0a0a0a] text-slate-300 p-4 flex flex-col font-mono leading-relaxed ${isCenter ? 'text-sm' : 'text-[11px]'}`}>
     <div className="flex justify-between items-center text-[#555] mb-4 border-b border-[#222] pb-2">
        <span className="text-green-500 font-bold uppercase tracking-widest text-xs">Hermes Local</span>
        <div className="flex gap-3 text-xs">
          <span className="hover:text-[#ccc] cursor-pointer">Restart</span>
          <span className="hover:text-[#ccc] cursor-pointer">Clear</span>
        </div>
     </div>
     
     <div className="flex-1 overflow-y-auto flex flex-col gap-2">
       <div className="text-[#888]">&gt; checking local services...</div>
       <div className="text-emerald-400/90">Docker: Connected (Up 2h)</div>
       <div className="text-blue-400/90">n8n: Active on localhost:5678</div>
       <div className="text-yellow-500/90">&gt; 0 errors, 0 warnings</div>
     </div>

     {isCenter && (
       <div className="mt-auto pt-4 border-t border-[#222]">
         <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2">
           <span className="text-green-500 font-bold">&gt;</span>
           <input 
             type="text"
             placeholder="Enter PowerShell/CLI command..."
             className="flex-1 bg-transparent outline-none text-[#ccc] placeholder-[#555]"
           />
           <button className="text-xs bg-[#333] text-[#aaa] px-3 py-1 rounded hover:bg-[#444] hover:text-white transition-colors">
             EXECUTE
           </button>
         </div>
       </div>
     )}
  </div>
);

export const OpenRouterApp = () => (
  <div className="h-full w-full bg-[#0a0a0a] text-slate-300 p-3 flex flex-col text-[11px] font-mono">
     <div className="flex justify-between items-center mb-3">
        <span className="text-[#ccc] font-bold">qwen3-coder-next</span>
        <span className="text-emerald-500/80 font-sans font-bold text-[10px]">Active (API)</span>
     </div>
     <div className="flex justify-between items-center mb-4 text-[#888]">
        n8n Automation <span className="text-blue-400/80">:5678 Live</span>
     </div>
     <div className="text-[#555] mt-auto">VRAM Footprint: 0 MB (API Offload)</div>
  </div>
);

export const QuickLibraryApp = () => (
  <div className="w-full h-full bg-[#0a0a0a] flex flex-col p-4 text-[#ccc] font-sans text-sm gap-2">
    <div className="flex justify-between items-center mb-1">
      <h3 className="font-bold text-yellow-500 uppercase tracking-widest text-[11px]">Quick Library (History)</h3>
      <span className="text-[10px] text-[#666]">Local File Sync</span>
    </div>
    <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto mt-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded p-2 hover:border-[#555] cursor-pointer flex flex-col gap-1 transition-colors">
          <div className="font-bold text-[11px] truncate text-[#aaa]">Session_Log_0{i}.md</div>
          <div className="text-[9px] text-[#666]">09-15-2026</div>
          <input 
            type="text" 
            placeholder="Add trigger word..." 
            className="mt-1 bg-[#222] border border-[#444] rounded-[2px] px-1.5 py-1 text-[9px] w-full outline-none focus:border-yellow-500/50 text-[#ccc]"
            onClick={e => e.stopPropagation()}
          />
        </div>
      ))}
    </div>
  </div>
);

export const TodoListApp = () => (
  <div className="w-full h-full bg-[#0a0a0a] flex flex-col p-4 text-[#ccc] font-sans gap-2 overflow-y-auto">
    <div className="flex justify-between items-center border-b border-[#222] pb-2 mb-1">
      <h3 className="font-bold text-yellow-500 uppercase tracking-widest text-[11px]">System To-Do</h3>
      <span className="text-[10px] text-[#666]">Pending Logic</span>
    </div>
    <ul className="flex flex-col gap-2.5 text-[10px] md:text-[11px] leading-relaxed">
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5 accent-yellow-500" /> 
        <span><b className="text-white">File Organization:</b> Goose to sort local workspace files. <span className="text-yellow-500 font-mono text-[9px] block">→ High Priority | Ready for Goose</span></span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5 accent-yellow-500" /> 
        <span><b className="text-white">RECALL Bar:</b> Wire search input to trigger app/file swaps. <span className="text-[#666] font-mono text-[9px] block">→ UI Built | Needs Local State/n8n</span></span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5 accent-yellow-500" /> 
        <span><b className="text-white">Hermes Link:</b> Connect center terminal to localhost:5678 (n8n). <span className="text-[#666] font-mono text-[9px] block">→ UI Built | Needs API Hook</span></span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5 accent-yellow-500" /> 
        <span><b className="text-white">Quick Library:</b> Sync with local .md files. <span className="text-[#666] font-mono text-[9px] block">→ UI Built | Needs Local FS Read</span></span>
      </li>
      <li className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5 accent-yellow-500" /> 
        <span><b className="text-white">OpenRouter:</b> Validate ~/.n8n/openrouter_config.json locally. <span className="text-[#666] font-mono text-[9px] block">→ Pending Local Setup</span></span>
      </li>
    </ul>
  </div>
);

export const PersonalNotepadApp = () => (
  <div className="w-full h-full bg-[#111] flex flex-col p-4 text-[#ccc] font-sans border border-[#222] shadow-inner relative group">
    <div className="flex justify-between items-center border-b border-[#222] pb-2 mb-2">
      <h3 className="font-bold text-[#888] uppercase tracking-widest text-[11px]">Notepad</h3>
    </div>
    <textarea 
      className="w-full flex-1 bg-transparent outline-none resize-none text-[11px] placeholder-[#555]" 
      placeholder="Type your notes here..."
      defaultValue="Scratchpad ready. Enter raw thoughts here..."
    />
  </div>
);
