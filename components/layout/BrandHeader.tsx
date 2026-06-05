'use client';

import { useEffect, useState } from 'react';

export function BrandHeader() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6 py-3 shrink-0"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
        boxShadow: '0 1px 0 rgba(52, 211, 153, 0.08), 0 2px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left: Logo + brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Lightning bolt logo */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              boxShadow: '0 0 12px rgba(52, 211, 153, 0.2)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
                fill="#34d399"
                stroke="#34d399"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <div
              className="text-sm font-bold tracking-[0.2em] uppercase"
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                color: '#34d399',
                textShadow: '0 0 12px rgba(52, 211, 153, 0.4)',
              }}
            >
              CINERNET
            </div>
            <div className="text-[10px] text-slate-500 tracking-wider uppercase">
              Electrical Topology Platform
            </div>
          </div>
        </div>

        <div
          className="h-8 w-px mx-1"
          style={{ background: 'linear-gradient(to bottom, transparent, #334155, transparent)' }}
        />

        <div>
          <div className="text-xs font-semibold text-slate-200 tracking-wide">
            Lommel Glass Factory
          </div>
          <div className="text-[10px] text-slate-500 tracking-wider">
            LV Distribution Topology — Sekcja Alpha
          </div>
        </div>
      </div>

      {/* Right: Clock + live indicator */}
      <div className="flex items-center gap-5">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-red-400"
            style={{ animation: 'live-pulse 1.5s ease-in-out infinite' }}
          />
          LIVE
        </div>

        <div className="text-right">
          <div
            className="text-base font-bold tabular-nums"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              color: '#e2e8f0',
            }}
          >
            {time}
          </div>
          <div className="text-[10px] text-slate-500 capitalize">{date}</div>
        </div>
      </div>
    </header>
  );
}
