import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grip, Power } from 'lucide-react';
import { APPS_CONFIG } from '../apps/config';

interface TaskbarProps {
  openWindows: { id: string; appId: string; isMinimized: boolean; isActive: boolean }[];
  onStartToggle: () => void;
  isStartOpen: boolean;
  onWindowClick: (id: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  openWindows,
  onStartToggle,
  isStartOpen,
  onWindowClick,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 flex items-center justify-between px-2 z-[9999] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      {/* Left side: Start Button & Pinned/Open Apps */}
      <div className="flex items-center gap-1 h-full py-1.5">
        <button
          onClick={onStartToggle}
          className={`
            w-9 h-full rounded-md flex items-center justify-center transition-all duration-200 group relative
            ${isStartOpen ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-300'}
          `}
        >
          <Grip className={`w-5 h-5 transition-transform ${isStartOpen ? 'rotate-90' : 'group-hover:scale-110'}`} />
        </button>

        <div className="w-px h-5 bg-slate-700/50 mx-1" />

        {/* Window Indicators */}
        <div className="flex items-center gap-1 h-full">
          {openWindows.map((win) => {
            const config = APPS_CONFIG[win.appId];
            if (!config) return null;
            return (
              <button
                key={win.id}
                onClick={() => onWindowClick(win.id)}
                className={`
                  w-10 h-full rounded-md flex items-center justify-center transition-all relative
                  ${win.isActive ? 'bg-slate-700/60 shadow-inner' : 'hover:bg-slate-800'}
                `}
                title={config.title}
              >
                <config.icon className={`w-5 h-5 ${config.colorClass} ${win.isMinimized ? 'opacity-50' : 'opacity-100'}`} />
                {/* Active/Open dot indicator */}
                <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-[2px] rounded-full transition-all ${win.isActive ? 'bg-indigo-400 w-3' : 'bg-slate-500'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side: System Tray */}
      <div className="flex items-center h-full py-1.5 px-2 gap-3 text-sm text-slate-300 font-medium">
        <div className="flex items-center gap-2 hover:bg-slate-800 h-full px-2 rounded-md cursor-default transition-colors">
          <div className="flex flex-col items-end leading-none justify-center gap-0.5">
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[10px] text-slate-400">{time.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Start Menu Popup */}
      <AnimatePresence>
        {isStartOpen && (
          <StartMenu onClose={onStartToggle} onOpenApp={(appId) => { onWindowClick(appId); onStartToggle(); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

const StartMenu: React.FC<{ onClose: () => void; onOpenApp: (appId: string) => void }> = ({ onClose, onOpenApp }) => {
  return (
    <>
      <div className="fixed inset-0 z-[-1]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-14 left-2 w-[400px] bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl rounded-xl overflow-hidden flex flex-col p-4 origin-bottom-left"
      >
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Search apps, settings, and web..." 
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md h-10 px-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            autoFocus
          />
        </div>
        
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Pinned Apps</h3>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.values(APPS_CONFIG).map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg hover:bg-slate-800/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner border border-slate-700/30">
                <app.icon className={`w-6 h-6 ${app.colorClass}`} />
              </div>
              <span className="text-xs text-slate-300 font-medium truncate w-full text-center">{app.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-slate-600">
              U
            </div>
            <span className="text-sm font-medium text-slate-200">User</span>
          </div>
          <button className="w-8 h-8 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
            <Power className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </>
  );
};
