import React from 'react';
import { motion } from 'motion/react';
import { X, Minus, Maximize2 } from 'lucide-react';
import { WindowState } from '../types';
import { APPS_CONFIG, getAppComponent } from '../apps/config';

interface WindowProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

export const Window: React.FC<WindowProps> = ({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const appConfig = APPS_CONFIG[windowState.appId];
  if (!appConfig) return null;

  const AppComponent = getAppComponent(windowState.appId);

  // For a pure CSS/Framer motion dragging approach without massive dependencies
  // We use motion.div's built in drag constraint
  
  if (windowState.isMinimized) return null;

  const initialWidth = appConfig.defaultWidth || 600;
  const initialHeight = appConfig.defaultHeight || 400;

  return (
    <motion.div
      drag={!windowState.isMaximized}
      dragConstraints={{ top: 0, bottom: window.innerHeight - 100, left: -window.innerWidth / 2, right: window.innerWidth / 2 }}
      dragElastic={0}
      dragMomentum={false}
      onMouseDown={onFocus}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        width: windowState.isMaximized ? '100vw' : initialWidth,
        height: windowState.isMaximized ? 'calc(100vh - 48px)' : initialHeight, // 48px is taskbar height
        x: windowState.isMaximized ? 0 : undefined,
        y: windowState.isMaximized ? 0 : undefined,
      }}
      style={{
        zIndex: windowState.zIndex,
        position: 'absolute',
        top: windowState.isMaximized ? 0 : '10vh',
        left: windowState.isMaximized ? 0 : '15vw',
      }}
      className={`
        flex flex-col overflow-hidden bg-white shadow-2xl rounded-xl
        border ${isActive ? 'border-slate-500/50 shadow-slate-900/20' : 'border-slate-300 shadow-slate-900/10'}
        transition-shadow
      `}
    >
      {/* Title Bar (Drag Handle) */}
      <div 
        className={`
          h-10 flex items-center justify-between px-3 select-none
          ${isActive ? 'bg-slate-100' : 'bg-slate-50 text-slate-500'}
          border-b border-slate-200
        `}
        style={{ cursor: windowState.isMaximized ? 'default' : 'grab' }}
        onPointerDown={(e) => {
          // If maximize, prevent drag
          if (windowState.isMaximized) {
            e.stopPropagation();
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <appConfig.icon className={`w-4 h-4 ${appConfig.colorClass}`} />
          <span className="text-sm font-medium text-slate-700 truncate">{appConfig.title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-7 h-7 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-7 h-7 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-7 h-7 rounded-md hover:bg-red-500 hover:text-white flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1 relative overflow-hidden bg-slate-50" onPointerDown={(e) => e.stopPropagation()}>
        <AppComponent />
        {/* Cover layer to prevent pointer events being swallowed by iframe/content when not active */}
        {!isActive && <div className="absolute inset-0 z-50 bg-transparent" />}
      </div>
    </motion.div>
  );
};
