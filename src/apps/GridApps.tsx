import React from 'react';
import { Mic, Send, SquareTerminal, RefreshCw, Copy, Check, Radio, Database, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

export const ArchitectureApp: React.FC<{ isCenter?: boolean }> = ({ isCenter }) => {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: 'user' | 'agent', text: string, source?: string, tags?: string[] }[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewState, setViewState] = React.useState<'normal' | 'split' | 'expanded'>('normal');
  const [activeTab, setActiveTab] = React.useState<'spec' | 'mic_setup' | 'library_docs'>('mic_setup');
  const [endpointUrl, setEndpointUrl] = React.useState('http://localhost:8080/webhook/digital-me-voice');
  const [connectionStatus, setConnectionStatus] = React.useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleResetConnections = () => {
    // Reset to the canonical Desktop OSS Core endpoint on port 8080
    setEndpointUrl('http://localhost:8080/webhook/digital-me-voice');
    setConnectionStatus('idle');
    setTestResult('Connections reset to default: http://localhost:8080/webhook/digital-me-voice (Legacy port 8081 references cleared).');
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setTestResult('Probing endpoint with test speech payload...');
    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_voice_input: 'test recall status' })
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus('connected');
        setTestResult(`✅ Connected successfully! Response: ${JSON.stringify(data)}`);
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setTestResult(`⚠️ Local server not responding (${err.message}). Verify 'python desktop_oss_core.py' is running on port 8080. Workspace will use AI Studio cloud fallback.`);
    }
  };

  const handleCopyInstructions = () => {
    const text = `================================================================================
DESKTOP OSS CORE: MICROPHONE SETUP & DIGITAL LIBRARY ARCHITECTURE
================================================================================

1. MICROPHONE & VOICE SETUP
• Hardware & Audio Capture:
  - No Direct Audio Capture: desktop_oss_core.py contains no audio drivers and does not record raw microphone streams (.wav / .mp3).
  - Upstream Dictation Required: Speech-to-text transcription must be handled upstream by Windows Voice Typing (Win + H), browser speech recognition, or an external dictation utility.
• Voice Webhook Receiver:
  - Host & Port: Python HTTPServer listening on http://localhost:8080
  - Endpoint Path: POST /webhook/digital-me-voice
  - CORS Headers: OPTIONS request returns Access-Control-Allow-Origin: * to allow direct calls from local web applications and browser interfaces.
• Expected JSON Payload:
  { "raw_voice_input": "show me lawn aeration schedule" }
• Query Processing & Word Matching:
  - Text Normalization: Converts raw_voice_input to lowercase.
  - Tokenization: Extracts all alphanumeric words via regex: \\b\\w+\\b
  - Sequential Search: Iterates through each extracted word and runs the query:
    SELECT content_chunk FROM digital_library WHERE trigger_tags LIKE '%<word>%'
  - Execution Stop: Halts on the first matching database record and returns:
    { "status": "success", "matched_context": "<full text of matched file>" }
  - Fallback State: Returns "No records located." if no word matches a tag.

================================================================================
2. DIGITAL LIBRARY ARCHITECTURE & ORGANIZATION
================================================================================
• Storage Engine & File System:
  - Database Engine: Local SQLite3 (sqlite3 module)
  - Directory Path: C:\\Users\\richa\\.digital_me
  - Database File: C:\\Users\\richa\\.digital_me\\digital_me.db
  - Directory Creation: Auto-initialized on startup via os.makedirs(..., exist_ok=True)
• Database Schema (Table: digital_library):
  - id: INTEGER PRIMARY KEY AUTOINCREMENT (unique record identifier)
  - file_name: TEXT UNIQUE (filename with extension, e.g., Session_Log_01.md)
  - file_path: TEXT (absolute path to file on disk)
  - content_chunk: TEXT (full file text, whitespace-compressed)
  - trigger_tags: TEXT (comma-separated keyword tags used for lookup)
• File Ingestion & Indexing (run_scan):
  - Monitored Directory Roots: Recursively scans (os.walk) three user paths:
      1. C:\\Users\\richa\\.digital_me
      2. C:\\Users\\richa\\Desktop
      3. C:\\Users\\richa\\Documents
  - Allowed File Extensions: Exclusively parses files ending with: .txt, .md, .json
• Text Parsing & Tag Generation Logic:
  1. Read: Opens file with UTF-8 encoding (errors='ignore').
  2. Clean: Replaces consecutive whitespace (\\s+) with single spaces and strips margins.
  3. Filter: Ignores empty files.
  4. Tag Extraction: Extracts all words of 4 or more characters (\\b\\w{4,}\\b) in lowercase.
  5. Tag Deduplication: Takes the first 10 unique qualifying words.
  6. Join: Formats tags as comma-separated text (e.g., "turf,aeration,schedule,morning").
  7. Save: Executes INSERT OR REPLACE INTO digital_library (...) to update records cleanly without creating duplicates.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // First attempt: Call local Desktop OSS Core webhook
      let handled = false;
      try {
        const localRes = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_voice_input: userMessage.text })
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          setMessages(prev => [...prev, {
            role: 'agent',
            text: localData.matched_context || "No records located.",
            source: 'desktop_oss_core.py (Port 8080)',
            tags: ['local_core', 'sqlite3']
          }]);
          handled = true;
        }
      } catch {
        // Local server unreachable, smoothly fallback to cloud relay
      }

      if (!handled) {
        // Fallback: Connects to the AI Studio backend using Gemini
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
          source: data.source || 'Cloud Relay',
          tags: data.tags
        }]);
      }
      
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="text-3xl">🛠️</div>
           <div>
             <h1 className="text-xl font-bold tracking-wide text-slate-900 uppercase">Dyslexia Desktop OSS & Architecture</h1>
             <p className="text-sm text-slate-500 font-medium">Glare-Free Paper Cream Canvas (#F8F9FA) • Port 8080 Core</p>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-4 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('mic_setup')}
          className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'mic_setup' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          <Mic className="w-3.5 h-3.5 text-yellow-400" />
          Microphone & Voice Hookup (Setup & Reset)
        </button>
        <button
          onClick={() => setActiveTab('library_docs')}
          className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'library_docs' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          Digital Library Docs & Schema
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'spec' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          <SquareTerminal className="w-3.5 h-3.5 text-blue-400" />
          System Grid Specification
        </button>
      </div>

      {viewState === 'split' && (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           SPLIT VIEW ACTIVE: Center canvas partitioned 50/50.
        </div>
      )}
      
      {viewState === 'expanded' && (
        <div className="w-full bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           EXPANDED SURFACE ACTIVE: Center canvas overlaying adjacent 1/8 columns for deep focus.
        </div>
      )}

      {/* TAB 1: MICROPHONE SETUP & RESET */}
      {activeTab === 'mic_setup' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm text-xs text-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-yellow-500" />
                Microphone Hookup & Endpoint Reset Tool
              </h2>
              <p className="text-[11px] text-slate-500">Configure or reset connections to the local Desktop OSS Core voice webhook.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetConnections}
                className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm text-xs"
                title="Reset all connections to standard port 8080"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Hookup Connections
              </button>
              <button
                onClick={handleCopyInstructions}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center gap-1.5 transition-colors border border-slate-200 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Instructions'}
              </button>
            </div>
          </div>

          {/* Connection Status & Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Active Voice Webhook Endpoint:</span>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-800"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'testing'}
                  className="px-3 py-1 bg-slate-900 text-white rounded font-bold hover:bg-black shrink-0 disabled:opacity-50"
                >
                  {connectionStatus === 'testing' ? 'Probing...' : 'Test'}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-bold">Status:</span>
                {connectionStatus === 'connected' && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Port 8080 Responsive
                  </span>
                )}
                {connectionStatus === 'error' && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Unreachable (Cloud Relay Active)
                  </span>
                )}
                {connectionStatus === 'idle' && (
                  <span className="text-slate-500 font-medium">Ready to probe</span>
                )}
              </div>
              {testResult && (
                <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-[11px] font-mono text-slate-600">
                  {testResult}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Upstream Dictation Hookup (Speech-to-Text):</span>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900">1. Windows 10 Native:</span> Press <kbd className="px-1 py-0.5 bg-white border rounded font-mono font-bold">Win + H</kbd> in any input bar to activate native speech typing.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900">2. External Python/n8n:</span> Send POST request with JSON payload <code className="bg-white px-1 py-0.5 border rounded">{"{\"raw_voice_input\": \"...\"}"}</code> to port 8080.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900">3. Connection Reset:</span> Click "Reset Hookup Connections" if old models were targeting port 8081 or outdated socket configs.
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
            <strong>Note on Microphone Connections:</strong> The Desktop OSS core script (<code>desktop_oss_core.py</code>) intentionally does not capture raw sound-card hardware directly, ensuring zero audio driver conflicts on Boot Camp Windows 10. Voice queries are passed as transcribed text into <code>/webhook/digital-me-voice</code>.
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL LIBRARY DOCS */}
      {activeTab === 'library_docs' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm text-xs text-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Digital Library Architecture & SQLite3 Schema
              </h2>
              <p className="text-[11px] text-slate-500">Auto-indexing rules and database specification for <code>library_index.db</code> (WAL Mode)</p>
            </div>
            <button
              onClick={handleCopyInstructions}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center gap-1.5 transition-colors border border-slate-200 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Full Spec!' : 'Copy Spec'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 p-3 rounded bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">1. Storage Location</h3>
              <p className="text-slate-600 text-[11px] font-mono mb-1">C:\Users\richa\DigitalLibrary\library_index.db</p>
              <p className="text-slate-500 text-[11px]">Auto-created on launch with WAL mode. Requires zero external database server.</p>
            </div>
            <div className="border border-slate-200 p-3 rounded bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">2. Monitored Roots</h3>
              <ul className="text-slate-600 text-[11px] list-disc pl-4 space-y-0.5">
                <li><code>DigitalLibrary</code></li>
                <li><code>Desktop</code></li>
                <li><code>Documents</code></li>
              </ul>
              <p className="text-slate-500 text-[10px] mt-1">Filters for <code>.txt</code>, <code>.md</code>, <code>.json</code>, <code>.docx</code>, <code>.pdf</code></p>
            </div>
            <div className="border border-slate-200 p-3 rounded bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-1">3. Indexing & Tags</h3>
              <p className="text-slate-600 text-[11px]">Extracts words of 4+ characters, deduplicates, and saves top 10 unique keywords as <code>trigger_tags</code>.</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-2 uppercase text-[10px]">Table Schema: <code>digital_library</code></h3>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2 border-b border-slate-200">Column</th>
                    <th className="p-2 border-b border-slate-200">Type</th>
                    <th className="p-2 border-b border-slate-200">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr><td className="p-2 font-mono font-bold text-slate-900">id</td><td className="p-2 font-mono">INTEGER PRIMARY KEY AUTOINCREMENT</td><td className="p-2">Row identifier</td></tr>
                  <tr><td className="p-2 font-mono font-bold text-slate-900">file_name</td><td className="p-2 font-mono">TEXT UNIQUE</td><td className="p-2">Unique file name (e.g., Session_01.md)</td></tr>
                  <tr><td className="p-2 font-mono font-bold text-slate-900">file_path</td><td className="p-2 font-mono">TEXT</td><td className="p-2">Absolute path on disk</td></tr>
                  <tr><td className="p-2 font-mono font-bold text-slate-900">content_chunk</td><td className="p-2 font-mono">TEXT</td><td className="p-2">Cleaned, whitespace-normalized document body</td></tr>
                  <tr><td className="p-2 font-mono font-bold text-slate-900">trigger_tags</td><td className="p-2 font-mono">TEXT</td><td className="p-2">Comma-separated keyword tags for instant lookup</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRID SPEC */}
      {activeTab === 'spec' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm">
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
      )}

      {/* Messages */}
      {messages.length > 0 && (
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
     <div className="flex items-center gap-2 mb-3 text-[#ccc]">
        <div className="w-2.5 h-2.5 bg-green-400/80 rounded-[2px]" /> Docker_Log.xlsx
     </div>
     <div className="mt-auto flex justify-between items-center pt-2 border-t border-[#222]">
        <a 
          href="/2026-09-21_desktop_oss_v3.zip" 
          download="2026-09-21_desktop_oss_v3.zip"
          className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded border border-yellow-500/40 text-[10px] font-bold tracking-wide transition-colors"
        >
          ⬇ 2026-09-21_desktop_oss_v3.zip
        </a>
        <span className="text-emerald-500/80 font-bold tracking-wide text-[10px]">VERIFIED V3 READY</span>
     </div>
  </div>
);

export const GooseApp: React.FC<{ isCenter?: boolean }> = ({ isCenter }) => {
  const [activeCard, setActiveCard] = React.useState<'approve' | 'recall' | null>('approve');
  const [showBasement, setShowBasement] = React.useState(false);
  const [approvedAction, setApprovedAction] = React.useState(false);

  return (
    <div className={`h-full w-full ${isCenter ? 'bg-[#F8F9FA] text-slate-800' : 'bg-[#0a0a0a] text-slate-300'} p-4 flex flex-col font-sans select-none overflow-y-auto`}>
      {/* Header Bar */}
      <div className={`flex justify-between items-center pb-2.5 mb-3 border-b ${isCenter ? 'border-slate-200' : 'border-[#222]'}`}>
        <div className="flex items-center gap-2">
          <SquareTerminal className={`w-4 h-4 ${isCenter ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <span className={`font-bold uppercase tracking-wider text-xs ${isCenter ? 'text-slate-900' : 'text-yellow-500'}`}>
            Goose Home Base {isCenter ? '(Quiet Center Half)' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap ${isCenter ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
            STANDBY • LOCAL LOOP
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Silent / Quiet Notice */}
        {isCenter && !activeCard && !showBasement && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-300 rounded-lg bg-white/70">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-3">
              <SquareTerminal className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">Central Focus Canvas Silent & Ready</h3>
            <p className="text-slate-500 text-xs max-w-md leading-relaxed mb-4">
              Streaming text, scrolling logs, and conversational noise are silenced. Temporary cards slide in only when you trigger a recall or when an action requires 1-click approval.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveCard('recall')}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Simulate Recall Card
              </button>
              <button 
                onClick={() => setActiveCard('approve')}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Simulate Approval Card
              </button>
            </div>
          </div>
        )}

        {/* Temporary Slide-in Interaction Card: Click-to-Approve */}
        {activeCard === 'approve' && (
          <div className={`p-4 rounded-lg border shadow-sm transition-all ${isCenter ? 'bg-white border-amber-300 shadow-amber-50' : 'bg-[#141414] border-amber-600/40'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isCenter ? 'text-slate-900' : 'text-amber-400'}`}>
                  Action Requested • Click-to-Approve
                </span>
              </div>
              <button 
                onClick={() => setActiveCard(null)}
                className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100"
                title="Dismiss Card"
              >
                ✕ Dismiss
              </button>
            </div>
            <p className={`text-xs mb-3 ${isCenter ? 'text-slate-600' : 'text-slate-300'}`}>
              Goose requests permission to index new files in <code className="font-mono bg-slate-100 text-slate-800 px-1 rounded">C:\Users\richa\DigitalLibrary\00_INBOX</code>.
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setApprovedAction(true);
                  setTimeout(() => setActiveCard(null), 1200);
                }}
                disabled={approvedAction}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
              >
                {approvedAction ? '✓ Approved & Executed' : '✓ 1-Click Approve'}
              </button>
              <button 
                onClick={() => setActiveCard(null)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Deny & Silence
              </button>
            </div>
          </div>
        )}

        {/* Temporary Slide-in Interaction Card: Recall */}
        {activeCard === 'recall' && (
          <div className={`p-4 rounded-lg border shadow-sm transition-all ${isCenter ? 'bg-white border-indigo-200' : 'bg-[#141414] border-indigo-900'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isCenter ? 'text-slate-900' : 'text-indigo-400'}`}>
                  Document Recall Result
                </span>
              </div>
              <button 
                onClick={() => setActiveCard(null)}
                className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100"
              >
                ✕ Dismiss
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 mb-3 font-mono">
              <div><strong>File:</strong> Lawn_Opening.docx</div>
              <div><strong>Location:</strong> C:\Users\richa\DigitalLibrary\01_ACTIVE_PROJECTS</div>
              <div><strong>Summary:</strong> Aeration and seed scheduling instructions for spring cycle.</div>
            </div>
            <button 
              onClick={() => setActiveCard(null)}
              className="px-3 py-1 bg-slate-200 text-slate-800 rounded text-xs font-semibold hover:bg-slate-300"
            >
              Close Recall
            </button>
          </div>
        )}

        {/* V3 Folder Basement View Toggle */}
        <div className={`p-3 rounded-lg border transition-all ${isCenter ? 'bg-white border-slate-200' : 'bg-[#111] border-[#222]'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-xs font-bold ${isCenter ? 'text-slate-900' : 'text-white'}`}>
                V3 Folder Matrix Basement
              </h4>
              <p className="text-[11px] text-slate-500">
                Ground-level storage on <code className="font-mono">C:\Users\richa\DigitalLibrary\</code>
              </p>
            </div>
            <button 
              onClick={() => setShowBasement(!showBasement)}
              className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                showBasement 
                  ? 'bg-slate-800 text-white border-slate-900' 
                  : isCenter 
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' 
                    : 'bg-[#222] text-[#ccc] border-[#333] hover:bg-[#333]'
              }`}
            >
              {showBasement ? '▲ Hide Basement' : '▼ Expand Basement'}
            </button>
          </div>

          {showBasement && (
            <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between mb-1">
                  <span>00_INBOX</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono">Quarantine</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Touchdown zone for raw, unvetted incoming clutter.</p>
                <div className="text-[10px] font-mono text-slate-400">Path: ...\DigitalLibrary\00_INBOX</div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between mb-1">
                  <span>01_ACTIVE_PROJECTS</span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-mono">Workspace</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Live Express UI, server.ts, and active work files.</p>
                <div className="text-[10px] font-mono text-slate-400">Path: ...\01_ACTIVE_PROJECTS</div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between mb-1">
                  <span>02_ARCHIVES</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">Certified Zip</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Verified zips checked via zipfile.testzip().</p>
                <div className="text-[10px] font-mono text-slate-400">Path: ...\02_ARCHIVES</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Zip Package Download Reference */}
        <div className={`p-3 rounded-lg border flex items-center justify-between ${isCenter ? 'bg-amber-50/70 border-amber-200' : 'bg-[#181814] border-amber-800/40'}`}>
          <div>
            <div className="text-xs font-bold text-amber-900">Certified V3 Package Built & Ready</div>
            <div className="text-[11px] text-amber-700 font-mono">2026-09-21_desktop_oss_v3.zip (68.5 KB)</div>
          </div>
          <a 
            href="/2026-09-21_desktop_oss_v3.zip" 
            download="2026-09-21_desktop_oss_v3.zip"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold tracking-wide shadow-sm transition-colors whitespace-nowrap"
          >
            ⬇ Download Zip
          </a>
        </div>
      </div>
    </div>
  );
};

export const ServicesApp: React.FC<{ isCenter?: boolean }> = ({ isCenter }) => (
  <div className={`h-full w-full bg-[#0a0a0a] text-slate-300 p-4 flex flex-col font-mono leading-relaxed ${isCenter ? 'text-sm' : 'text-[11px]'}`}>
     <div className="flex justify-between items-center text-[#555] mb-4 border-b border-[#222] pb-2">
        <span className="text-green-500 font-bold uppercase tracking-widest text-xs">Local Services &amp; Docker</span>
        <div className="flex gap-3 text-xs">
          <span className="hover:text-[#ccc] cursor-pointer">Restart</span>
          <span className="hover:text-[#ccc] cursor-pointer">Clear</span>
        </div>
     </div>
     
     <div className="flex-1 overflow-y-auto flex flex-col gap-2">
       <div className="text-[#888]">&gt; checking local services...</div>
       <div className="text-emerald-400/90">Docker: Connected (Up 2h)</div>
       <div className="text-blue-400/90">n8n: Active on http://localhost:5678</div>
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
        <input type="checkbox" className="mt-0.5 accent-yellow-500" defaultChecked readOnly /> 
        <span><b className="text-white">Goose Engine:</b> Ground-level loop active on localhost:5678 (n8n). <span className="text-emerald-500 font-mono text-[9px] block">→ Active Ground Engine</span></span>
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
