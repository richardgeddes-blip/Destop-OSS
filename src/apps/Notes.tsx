import React, { useState, useEffect } from 'react';

export const NotesApp: React.FC = () => {
  const [text, setText] = useState(() => localStorage.getItem('desktop_notes') || '');

  useEffect(() => {
    localStorage.setItem('desktop_notes', text);
  }, [text]);

  return (
    <div className="flex flex-col h-full bg-yellow-50/50">
      <div className="bg-yellow-200/50 p-2 text-sm font-medium text-yellow-800 border-b border-yellow-300/50">
        Scratchpad
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none text-slate-800"
        placeholder="Type your notes here... (They are saved locally)"
        autoFocus
      />
    </div>
  );
};
