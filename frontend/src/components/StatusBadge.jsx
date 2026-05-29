import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export default function StatusBadge({ baseUrl }) {
  const [status, setStatus] = useState('checking'); // checking, online, offline
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const startTime = performance.now();
      try {
        const pingUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(pingUrl);
        if (res.ok || res.status === 404) { // 404 from root is still a response showing it's online
          const duration = Math.round(performance.now() - startTime);
          setLatency(duration);
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (err) {
        setStatus('offline');
      }
    };

    checkStatus();
  }, [baseUrl]);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/5 text-xs text-slate-400">
        <Activity size={12} className="animate-pulse" />
        <span>Checking Status...</span>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
        <ShieldCheck size={12} />
        <span>API Live {latency ? `(${latency}ms)` : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
      <ShieldAlert size={12} />
      <span>API Offline</span>
    </div>
  );
}
