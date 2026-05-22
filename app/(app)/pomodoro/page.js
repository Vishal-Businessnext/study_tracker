'use client';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const MODES = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long:  { label: 'Long Break', minutes: 15 },
};

export default function PomodoroPage() {
  const [mode, setMode] = useState('focus');
  const [seconds, setSeconds] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef();

  useEffect(() => { setSeconds(MODES[mode].minutes * 60); setRunning(false); }, [mode]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(ref.current);
          setRunning(false);
          toast.success(`${MODES[mode].label} complete!`);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, mode]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
      <div className="card max-w-md mx-auto text-center">
        <div className="flex justify-center gap-2 mb-6">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} onClick={() => setMode(k)} className={`btn ${mode === k ? 'bg-brand-600 text-white' : 'btn-ghost border border-gray-300 dark:border-gray-700'}`}>{v.label}</button>
          ))}
        </div>
        <div className="text-7xl font-bold tabular-nums mb-6">{mm}:{ss}</div>
        <div className="flex justify-center gap-3">
          <button className="btn-primary" onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Start'}</button>
          <button className="btn-ghost border border-gray-300 dark:border-gray-700" onClick={() => { setRunning(false); setSeconds(MODES[mode].minutes * 60); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
