import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Terminal, Globe, CheckCircle, Flame, Sparkles, Clipboard, Check } from 'lucide-react';
import RegionSelector from '../components/RegionSelector';
import JsonViewer from '../components/JsonViewer';

export default function HomePage() {
  const [baseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [demoRegion, setDemoRegion] = useState('KA');
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);
  const [copiedQuickStart, setCopiedQuickStart] = useState(false);

  const quickStartCmd = `curl -X GET "${baseUrl}/v1/holidays?country=IN&year=2026&region=KA"`;

  const handleCopyQuickStart = () => {
    navigator.clipboard.writeText(quickStartCmd);
    setCopiedQuickStart(true);
    setTimeout(() => setCopiedQuickStart(false), 2000);
  };

  const handleDemoFetch = async () => {
    setDemoLoading(true);
    setDemoError(null);
    setDemoResponse(null);
    try {
      const url = `${baseUrl}/v1/holidays?country=IN&year=2026&region=${demoRegion}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP error ${res.status}`);
      // Show only top 3 results in demo response for brevity
      if (data && Array.isArray(data.data)) {
        data.data = data.data.slice(0, 3);
      }
      setDemoResponse(data);
    } catch (err) {
      setDemoError(err.message || 'Failed to fetch. Make sure API backend is running.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/20 text-saffron-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <Flame size={12} />
            <span>Developer-First & 100% Free</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.1] mb-6">
            Keyless, Open-Source <br />
            <span className="text-saffron-gradient">Indian Calendar API</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fast, database-free REST API serving Indian public holidays and calendar parameters. Supporting the Central Government plus all 36 States and Union Territories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <NavLink
              to="/playground"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-saffron-500 to-red-600 shadow-lg shadow-saffron-500/10 hover:shadow-saffron-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Explore Playground
              <ArrowRight size={16} />
            </NavLink>
            <NavLink
              to="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Read API Docs
            </NavLink>
          </div>
        </div>
      </section>

      {/* Quick Start command widget */}
      <section className="pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0e0e15] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative group">
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded bg-saffron-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Terminal size={10} />
            <span>Quick Start</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-2">
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre py-2 w-full">
              {quickStartCmd}
            </pre>
            <button
              onClick={handleCopyQuickStart}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
            >
              {copiedQuickStart ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard size={12} />
                  <span>Copy Command</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors duration-200">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
              <Globe size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-200 mb-2">No Authentication</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No registration, API keys, limits or billing. Directly integrate using standard clean URL queries.
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <CheckCircle size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-200 mb-2">State-Level Accuracy</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              State-specific restrictions merged seamlessly with central gazetted holidays, cleaned and sorted at runtime.
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors duration-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-200 mb-2">Edge-Optimized</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Database-free static JSON layout guarantees response times under 100ms globally, supported by Cloudflare.
            </p>
          </div>
        </div>
      </section>

      {/* Mini Live Demo Section (shows value instantly like mfapi) */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-100 mb-3">
            See It In <span className="text-saffron-gradient">Action</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Make a real API call right now by choosing a state region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="md:col-span-4 bg-[#0e0e15]/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <RegionSelector value={demoRegion} onChange={setDemoRegion} />
            
            <button
              onClick={handleDemoFetch}
              disabled={demoLoading}
              className="w-full inline-flex items-center justify-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-saffron-500 to-red-600 hover:from-saffron-600 hover:to-red-700 disabled:opacity-50 transition-all shadow-md shadow-saffron-500/5"
            >
              {demoLoading ? 'Fetching...' : 'Test Request'}
            </button>
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-8">
            {demoLoading && (
              <div className="h-48 flex items-center justify-center bg-black/30 border border-white/5 rounded-2xl">
                <div className="w-8 h-8 border-2 border-saffron-500/30 border-t-saffron-500 rounded-full animate-spin" />
              </div>
            )}

            {demoError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm rounded-2xl">
                {demoError}
              </div>
            )}

            {!demoLoading && !demoError && !demoResponse && (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 text-xs sm:text-sm">
                <Terminal size={24} className="mb-2 opacity-40" />
                <span>Select a state and click "Test Request" to load holiday data payload.</span>
              </div>
            )}

            {!demoLoading && !demoError && demoResponse && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-500 px-1">
                  <span>Showing top 3 holiday items:</span>
                  <span className="text-emerald-400 font-medium">Status: 200 OK</span>
                </div>
                <JsonViewer data={demoResponse} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
