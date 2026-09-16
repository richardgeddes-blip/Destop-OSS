import React, { useState } from 'react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);

  const handleNum = (num: string) => {
    if (display === '0') setDisplay(num);
    else setDisplay(display + num);
  };

  const handleOp = (op: string) => {
    setPrevious(display);
    setDisplay('0');
    setOperator(op);
  };

  const calculate = () => {
    if (!previous || !operator) return;
    const prev = parseFloat(previous);
    const current = parseFloat(display);
    let result = 0;
    if (operator === '+') result = prev + current;
    if (operator === '-') result = prev - current;
    if (operator === 'x') result = prev * current;
    if (operator === '/') result = prev / current;
    setDisplay(result.toString());
    setPrevious(null);
    setOperator(null);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevious(null);
    setOperator(null);
  };

  const btnClass = "bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg h-12 flex items-center justify-center text-xl font-medium transition-colors";
  const opClass = "bg-blue-600 hover:bg-blue-500 active:bg-blue-400 text-white rounded-lg h-12 flex items-center justify-center text-xl font-medium transition-colors";

  return (
    <div className="flex flex-col h-full bg-slate-800 p-4 select-none">
      <div className="bg-slate-900 rounded-xl p-4 mb-4 text-right overflow-hidden shadow-inner flex flex-col justify-end min-h-[80px]">
        {previous && <div className="text-slate-400 text-sm h-5">{previous} {operator}</div>}
        <div className="text-white text-3xl font-light tracking-wider truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        <button className={`${btnClass} col-span-2 bg-red-500/20 text-red-400 hover:bg-red-500/30`} onClick={handleClear}>AC</button>
        <button className={btnClass} onClick={() => setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)}>+/-</button>
        <button className={opClass} onClick={() => handleOp('/')}>÷</button>
        
        <button className={btnClass} onClick={() => handleNum('7')}>7</button>
        <button className={btnClass} onClick={() => handleNum('8')}>8</button>
        <button className={btnClass} onClick={() => handleNum('9')}>9</button>
        <button className={opClass} onClick={() => handleOp('x')}>×</button>
        
        <button className={btnClass} onClick={() => handleNum('4')}>4</button>
        <button className={btnClass} onClick={() => handleNum('5')}>5</button>
        <button className={btnClass} onClick={() => handleNum('6')}>6</button>
        <button className={opClass} onClick={() => handleOp('-')}>−</button>
        
        <button className={btnClass} onClick={() => handleNum('1')}>1</button>
        <button className={btnClass} onClick={() => handleNum('2')}>2</button>
        <button className={btnClass} onClick={() => handleNum('3')}>3</button>
        <button className={opClass} onClick={() => handleOp('+')}>+</button>
        
        <button className={`${btnClass} col-span-2`} onClick={() => handleNum('0')}>0</button>
        <button className={btnClass} onClick={() => { if (!display.includes('.')) setDisplay(display + '.'); }}>.</button>
        <button className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 text-white rounded-lg h-12 flex items-center justify-center text-xl font-medium transition-colors shadow-lg" onClick={calculate}>=</button>
      </div>
    </div>
  );
};
