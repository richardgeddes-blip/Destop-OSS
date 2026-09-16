import React from 'react';
import { Zap, Maximize2 } from 'lucide-react';
import { AppConfig, SlotPosition } from '../types';

interface SeatCardProps {
  config: AppConfig;
  slotId: SlotPosition;
  tags: string[];
  onSwapWithCenter: (slotId: SlotPosition) => void;
  onOpenPeek: (appId: string) => void;
}

export const SeatCard: React.FC<SeatCardProps> = ({
  config,
  slotId,
  tags,
  onSwapWithCenter,
  onOpenPeek,
}) => {
  const RenderComponent = config.render;

  return (
    <div className="flex-1 h-full w-full bg-[#0a0a0a] rounded-sm overflow-hidden flex flex-col relative group border border-white/20">
      {/* Header Bar precisely matching the screenshot */}
      <div 
        className="h-[26px] bg-[#121212] flex items-center justify-between px-2 shrink-0 border-b border-[#222] cursor-pointer"
        onClick={() => onSwapWithCenter(slotId)}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <config.icon className="w-3 h-3 text-[#777] shrink-0" />
          <span className="text-[10px] text-[#d4d4d4] font-bold tracking-wider truncate uppercase">{config.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 pl-2">
           {tags.length > 0 && (
             <div className="px-1.5 py-[1px] bg-[#fff3cd] text-[#856404] text-[9px] font-bold rounded-sm shadow-sm leading-none flex items-center">
               "{tags[0]}"
             </div>
           )}
           <button 
             onClick={(e) => { e.stopPropagation(); onOpenPeek(config.id); }}
             className="flex items-center gap-0.5 text-[9px] font-bold text-[#888] hover:text-yellow-400 transition-colors"
           >
              <Zap className="w-2.5 h-2.5 text-yellow-500" /> Peek
           </button>
           <Maximize2 className="w-2.5 h-2.5 text-[#555] hover:text-[#e0e0e0] transition-colors ml-1" />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative cursor-pointer" onClick={() => onSwapWithCenter(slotId)}>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none flex items-center justify-center">
           <div className="bg-[#121212]/95 text-[#e0e0e0] text-[10px] px-3 py-1.5 rounded font-bold border border-[#333] shadow-xl backdrop-blur-sm">Swap to Center ⤢</div>
        </div>
        <RenderComponent isCenter={false} />
      </div>
    </div>
  );
};
