import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export default function StatusBadge({ baseUrl }) {
  const [status, setStatus] = useState('checking');
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    let active = true;
    
    // A slow request does not prove that the host is sleeping.
    const timeoutId = setTimeout(() => {
      if (active) {
        setStatus('slow');
      }
    }, 2000);

    const checkStatus = async () => {
      const startTime = performance.now();
      try {
        const rawBaseUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const pingUrl = `${rawBaseUrl.replace(/\/$/, '')}/health`;
        const res = await fetch(pingUrl, { cache: 'no-store' });
        const health = res.ok ? await res.json() : null;
        
        if (!active) return;
        clearTimeout(timeoutId);

        if (res.ok && health?.status === 'ok' && health?.service === 'calendar-api') {
          const duration = Math.round(performance.now() - startTime);
          setLatency(duration);
          setStatus('online');
        } else {
          setStatus('unavailable');
        }
      } catch {
        if (!active) return;
        clearTimeout(timeoutId);
        setStatus('unavailable');
      }
    };

    checkStatus();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [baseUrl]);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/5 text-xs text-slate-400">
        <Activity size={12} className="animate-pulse" />
        <span>Checking Status...</span>
      </div>
    );
  }

  if (status === 'slow') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
        <Activity size={12} className="animate-spin text-amber-400" />
        <span>Still checking the API...</span>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
        <ShieldCheck size={12} />
        <span>API responding {latency !== null ? `(${latency}ms)` : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
      <ShieldAlert size={12} />
      <span>Unable to verify API</span>
    </div>
  );
}
