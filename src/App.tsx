import React, { useState } from 'react';
import { Search, ChevronDown, MonitorSmartphone, X, Zap, Square, Maximize2 } from 'lucide-react';
import { APPS_CONFIG } from './apps/config';
import { SlotMapping, SlotPosition } from './types';
import { SeatCard } from './components/SeatCard';

const INITIAL_STATE: SlotMapping = {
  'center': { appId: 'goose', tags: ['agent tasks'] },
  'left-1': { appId: 'chrome', tags: ['markets'] },
  'left-2': { appId: 'gemini', tags: ['lawn setup'] },
  'left-3': { appId: 'notes', tags: ['memos'] },
  'left-4': { appId: 'architecture', tags: ['architecture'] },
  'right-1': { appId: 'hermes', tags: ['docker'] },
  'right-2': { appId: 'openrouter', tags: ['models'] },
  'right-3': { appId: 'notes', tags: ['notes'] },
  'right-4': { appId: 'notes', tags: ['scratchpad'] },
  'bottom-1': { appId: 'desktopMirror', tags: ['desktop files'] },
  'bottom-2': { appId: 'todoList', tags: ['pending tasks'] },
  'bottom-3': { appId: 'personalNotepad', tags: ['scratchpad'] },
  'bottom-4': { appId: 'quickLibrary', tags: ['history'] },
};

export default function App() {
  const [slots, setSlots] = useState<SlotMapping>(INITIAL_STATE);
  const [peekAppId, setPeekAppId] = useState<string | null>(null);
  const [recallInput, setRecallInput] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSwap = (clickedSlotId: SlotPosition) => {
    if (clickedSlotId === 'center') return;
    setSlots((prev) => {
      const newSlots = { ...prev };
      const currentCenter = newSlots['center'];
      newSlots['center'] = newSlots[clickedSlotId];
      newSlots[clickedSlotId] = currentCenter;
      return newSlots;
    });
  };

  const executeRecall = () => {
    const query = recallInput.toLowerCase().trim();
    if (!query) return;

    // Search through perimeter slots for a matching tag
    for (const [position, config] of Object.entries(slots)) {
      if (position === 'center') continue;
      if (config.tags.some(tag => tag.toLowerCase().includes(query))) {
        handleSwap(position as SlotPosition);
        setRecallInput('');
        return;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const CenterAppRender = APPS_CONFIG[slots['center'].appId].render;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] text-[#e0e0e0] overflow-hidden font-sans select-none">
      
      {/* Exact Top Bar from Screenshot */}
      <header className="h-[34px] bg-[#111] border-b border-[#222] flex items-center px-3 shrink-0 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-[11px] tracking-widest bg-yellow-400/10 px-2 py-1 rounded-sm border border-yellow-400/20 cursor-pointer hover:bg-yellow-400/20">
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
             APPS ▼
          </div>
          
          <div className="flex items-center gap-4 text-[#888] text-[10px] font-medium uppercase tracking-wider relative">
             <div 
               className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer"
               onClick={() => setActiveDropdown(activeDropdown === 'voice' ? null : 'voice')}
             >
                <MonitorSmartphone className="w-3 h-3 text-[#555]"/> Voice: Concise <ChevronDown className="w-3 h-3 text-[#444]"/>
                {activeDropdown === 'voice' && (
                  <div className="absolute top-full mt-2 left-0 w-32 bg-[#121212] border border-[#333] rounded shadow-xl py-1 z-50">
                    <div className="px-3 py-1.5 hover:bg-[#222] cursor-pointer text-[#ccc]">Concise</div>
                    <div className="px-3 py-1.5 hover:bg-[#222] cursor-pointer text-[#888]">Detailed</div>
                    <div className="px-3 py-1.5 hover:bg-[#222] cursor-pointer text-[#888]">Muted</div>
                  </div>
                )}
             </div>
             <div 
               className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer relative"
               onClick={() => setActiveDropdown(activeDropdown === 'layout' ? null : 'layout')}
             >
                Layout <ChevronDown className="w-3 h-3 text-[#444]"/>
                {activeDropdown === 'layout' && (
                  <div className="absolute top-full mt-2 left-0 w-40 bg-[#121212] border border-[#333] rounded shadow-xl py-1 z-50">
                    <div className="px-3 py-1.5 bg-[#222] text-[#ccc]">1/8 • 1/8 • 1/2 • 1/8 • 1/8</div>
                    <div className="px-3 py-1.5 hover:bg-[#222] cursor-pointer text-[#888]">1/4 • 1/2 • 1/4</div>
                  </div>
                )}
             </div>
             <div className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer">
                Audio: Task-Only <ChevronDown className="w-3 h-3 text-[#444]"/>
             </div>
             <div className="flex items-center gap-1 hover:text-[#ccc] cursor-pointer">
                Profiles <ChevronDown className="w-3 h-3 text-[#444]"/>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-[450px]">
           <div className="flex items-center bg-[#1a1a1a] border border-[#333] focus-within:border-yellow-500/50 rounded flex-1 h-[22px] px-2 gap-2 text-[10px] transition-colors">
              <Search className="w-3 h-3 text-yellow-500 shrink-0" />
              <span className="text-yellow-500 font-bold shrink-0">RECALL:</span>
              <input 
                type="text" 
                value={recallInput}
                onChange={e => setRecallInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && executeRecall()}
                placeholder="Type trigger word (e.g., markets, docker, lawn setup)..." 
                className="flex-1 bg-transparent outline-none text-[#ccc] placeholder-[#555] font-mono" 
              />
              <button 
                onClick={executeRecall}
                className="bg-[#333] text-[#aaa] px-2 py-[1px] rounded-[2px] hover:bg-[#444] hover:text-white transition-colors ml-auto"
              >
                Enter
              </button>
           </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider text-[#aaa] uppercase">
           <button className="flex items-center gap-1.5 hover:text-yellow-400 text-[#888] transition-colors border border-[#333] px-2 py-0.5 rounded-sm">
              <span className="text-yellow-500 font-mono font-normal">{"</>"}</span> Code / CLI
           </button>
           <button className="flex items-center gap-1 bg-[#fff3cd] text-[#856404] px-2 py-[3px] rounded-sm shadow-sm hover:bg-yellow-200" onClick={() => window.open('/features.md', '_blank')}>
              Manual & Shortcuts
           </button>
           <button 
             onClick={toggleFullscreen}
             className={`border ${isFullscreen ? 'border-yellow-500 text-yellow-500' : 'border-[#333] text-[#aaa]'} hover:text-[#fff] px-2 py-0.5 rounded-sm flex items-center justify-center transition-colors`}
             title="Toggle Fullscreen"
           >
              <Square className="w-3 h-3" />
           </button>
           <button 
             className="hover:text-[#fff] text-yellow-500 border border-[#333] px-2 py-0.5 rounded-sm flex items-center justify-center transition-colors"
             title="Popout Window"
           >
              <Maximize2 className="w-3 h-3" />
           </button>
           <span className="text-[#666] tracking-widest pl-2 border-l border-[#333]">1/8 • 1/8 • 1/2 • 1/8 • 1/8</span>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 flex flex-col overflow-hidden p-1 gap-1">
        
        {/* Top Section (7/8 Height) */}
        <div className="flex-1 flex gap-1 min-h-0">
          {/* Left Outer Pillar (12.5%) */}
          <aside className="w-[12.5%] h-full flex flex-col gap-1 shrink-0">
            <SeatCard config={APPS_CONFIG[slots['left-1'].appId]} slotId="left-1" tags={slots['left-1'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
            <SeatCard config={APPS_CONFIG[slots['left-2'].appId]} slotId="left-2" tags={slots['left-2'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </aside>

          {/* Left Inner Pillar (12.5%) */}
          <aside className="w-[12.5%] h-full flex flex-col gap-1 shrink-0">
            <SeatCard config={APPS_CONFIG[slots['left-3'].appId]} slotId="left-3" tags={slots['left-3'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
            <SeatCard config={APPS_CONFIG[slots['left-4'].appId]} slotId="left-4" tags={slots['left-4'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </aside>

          {/* Center Workspace (50%) */}
          <section className="w-1/2 h-full bg-[#F8F9FA] flex flex-col shrink-0 border border-[#222] rounded-sm overflow-hidden relative">
            <div className="flex-1 overflow-hidden">
               <CenterAppRender isCenter={true} />
            </div>
          </section>

          {/* Right Inner Pillar (12.5%) */}
          <aside className="w-[12.5%] h-full flex flex-col gap-1 shrink-0">
            <SeatCard config={APPS_CONFIG[slots['right-1'].appId]} slotId="right-1" tags={slots['right-1'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
            <SeatCard config={APPS_CONFIG[slots['right-2'].appId]} slotId="right-2" tags={slots['right-2'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </aside>

          {/* Right Outer Pillar (12.5%) */}
          <aside className="w-[12.5%] h-full flex flex-col gap-1 shrink-0">
            <SeatCard config={APPS_CONFIG[slots['right-3'].appId]} slotId="right-3" tags={slots['right-3'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
            <SeatCard config={APPS_CONFIG[slots['right-4'].appId]} slotId="right-4" tags={slots['right-4'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </aside>
        </div>

        {/* Bottom Section (1/8 Height) */}
        <div className="h-[12.5%] flex gap-1 shrink-0">
          <div className="w-1/4 h-full">
            <SeatCard config={APPS_CONFIG[slots['bottom-1'].appId]} slotId="bottom-1" tags={slots['bottom-1'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </div>
          <div className="w-1/4 h-full">
            <SeatCard config={APPS_CONFIG[slots['bottom-2'].appId]} slotId="bottom-2" tags={slots['bottom-2'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </div>
          <div className="w-1/4 h-full">
            <SeatCard config={APPS_CONFIG[slots['bottom-3'].appId]} slotId="bottom-3" tags={slots['bottom-3'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </div>
          <div className="w-1/4 h-full">
            <SeatCard config={APPS_CONFIG[slots['bottom-4'].appId]} slotId="bottom-4" tags={slots['bottom-4'].tags} onSwapWithCenter={handleSwap} onOpenPeek={setPeekAppId} />
          </div>
        </div>

      </main>

      {/* 1-Minute Peek Modal */}
      {peekAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm p-12">
          <div className="w-full max-w-4xl h-[70vh] bg-[#0a0a0a] border border-[#333] rounded-sm shadow-2xl flex flex-col overflow-hidden relative">
            <div className="h-10 bg-[#121212] flex items-center justify-between px-4 border-b border-[#222]">
              <div className="flex items-center gap-2 text-yellow-400">
                <Zap className="w-4 h-4" />
                <span className="font-bold text-[11px] uppercase tracking-widest">Quick Peek Active</span>
              </div>
              <button 
                onClick={() => setPeekAppId(null)}
                className="w-6 h-6 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] rounded-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 relative overflow-auto">
               {(() => {
                 const PeekRender = APPS_CONFIG[peekAppId].render;
                 return <PeekRender isCenter={true} />
               })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
