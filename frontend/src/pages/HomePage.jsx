import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Terminal, BookOpen, Check, Copy, Sparkles, CheckCircle2, Play, Code2 } from 'lucide-react';
import RegionSelector from '../components/RegionSelector';
import JsonViewer from '../components/JsonViewer';

export default function HomePage() {
  const [baseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [demoRegion, setDemoRegion] = useState('KA');
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);
  const [copiedQuickStart, setCopiedQuickStart] = useState(false);
  const [activeTab, setActiveTab] = useState('curl');

  const quickStartCmd = `curl -s "${baseUrl}/v1/holidays?country=IN&year=2026&region=${demoRegion}"`;

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
      if (data && Array.isArray(data.data)) {
        data.data = data.data.slice(0, 3);
      }
      setDemoResponse(data);
      setActiveTab('response');
    } catch (err) {
      setDemoError(err.message || 'Failed to fetch. Make sure API backend is reachable.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* ─── Hero Section: Asymmetric 2-Column Split ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 sm:mb-24">
        {/* Left Column: Heading, Value Props, CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.12]">
            Indian Public Holidays &amp; Calendar <span className="text-saffron-500">REST API</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
            Free, keyless REST API serving official Gazetted and Restricted holiday schedules for the Central Government plus all 36 States and Union Territories.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <NavLink
              to="/playground"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-saffron-600 hover:bg-saffron-500 active:bg-saffron-700 shadow-sm hover:shadow transition-[transform,background-color] active:scale-[0.99]"
            >
              <span>Explore Interactive Playground</span>
              <ArrowRight size={16} />
            </NavLink>
            <NavLink
              to="/docs"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-[background-color,border-color]"
            >
              <span>API Reference</span>
            </NavLink>
          </div>

          {/* Architectural Metrics Strip */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">37</div>
              <div className="text-xs text-slate-400 mt-0.5">States &amp; UTs</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">5</div>
              <div className="text-xs text-slate-400 mt-0.5">REST Routes</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">0 Key</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant Access</div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Artifact in the Hero */}
        <div className="lg:col-span-6">
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-saffron-500" />
                <span className="text-xs font-mono text-slate-300 font-semibold">api-live-demo</span>
              </div>
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-md border border-white/5 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'curl' ? 'bg-saffron-500/20 text-saffron-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab('response')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'response' ? 'bg-saffron-500/20 text-saffron-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Payload
                </button>
              </div>
            </div>

            {/* Live Controller Bar */}
            <div className="p-4 bg-slate-900/40 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[180px]">
                <RegionSelector value={demoRegion} onChange={setDemoRegion} />
              </div>
              <button
                onClick={handleDemoFetch}
                disabled={demoLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-saffron-600 hover:bg-saffron-500 active:bg-saffron-700 disabled:opacity-50 transition-colors"
              >
                {demoLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play size={12} fill="white" />
                )}
                <span>Run Request</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-4 bg-black/80 font-mono text-xs text-slate-300 min-h-[200px] max-h-[260px] overflow-y-auto">
              {activeTab === 'curl' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1 border-b border-slate-800">
                    <span># Copy and execute directly in your terminal</span>
                    <button
                      onClick={handleCopyQuickStart}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedQuickStart ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                    {quickStartCmd}
                  </pre>
                  <p className="text-slate-500 text-[11px]">
                    Tip: Click "Run Request" above to execute inside the browser.
                  </p>
                </div>
              ) : (
                <div>
                  {demoError && (
                    <div className="text-red-400 text-xs py-2">{demoError}</div>
                  )}
                  {demoResponse ? (
                    <JsonViewer data={demoResponse} />
                  ) : (
                    <div className="text-slate-500 text-xs py-8 text-center">
                      Click "Run Request" to fetch live JSON payload for region <strong className="text-slate-300">{demoRegion}</strong>.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Endpoints Matrix ─── */}
      <section className="mb-16 sm:mb-24 pt-12 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              API Endpoint Matrix
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              5 lightweight endpoints tailored for leave calculations, calendar renderers, and HRMS validation.
            </p>
          </div>
          <NavLink
            to="/docs"
            className="text-xs font-semibold text-saffron-400 hover:text-saffron-300 flex items-center gap-1"
          >
            <span>View Complete API Reference</span>
            <ArrowRight size={13} />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200 font-semibold">/v1/holidays</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              List all gazetted &amp; restricted holidays for Central Government or a specific State/UT.
            </p>
            <div className="text-[11px] font-mono text-slate-500">Params: country, year, region</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200 font-semibold">/v1/is-holiday</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Instant boolean check whether a specific calendar date is a public holiday in a given region.
            </p>
            <div className="text-[11px] font-mono text-slate-500">Params: country, date, region</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200 font-semibold">/v1/next-holiday</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Returns the immediate upcoming public holiday from today or an arbitrary reference date.
            </p>
            <div className="text-[11px] font-mono text-slate-500">Params: country, date, region</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200 font-semibold">/v1/range</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Query all holiday events falling between two calendar dates (start and end bounds).
            </p>
            <div className="text-[11px] font-mono text-slate-500">Params: country, year, start, end, region</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
              <span className="text-slate-200 font-semibold">/v1/calendar</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Month-by-month structured calendar matrix with total working day counts.
            </p>
            <div className="text-[11px] font-mono text-slate-500">Params: country, year, region</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-saffron-400 uppercase tracking-wider mb-1">Open Source</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need raw datasets or offline ICS files? Access raw files directly in the repository.
              </p>
            </div>
            <a
              href="https://github.com/shrinivas-sn/calendar-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 mt-3"
            >
              <span>GitHub Repository</span>
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Section 3: Technical Guides Callout ─── */}
      <section className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400">
            <BookOpen size={13} />
            <span>Developer Guides</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Architecture, Compliance Rules &amp; Integration Recipes
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Read in-depth articles on Central vs State gazette rules, HRMS sandwich leave calculations, and multi-language SDK examples.
          </p>
        </div>
        <NavLink
          to="/guides"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors flex-shrink-0"
        >
          <span>Read Technical Guides</span>
          <ArrowRight size={14} />
        </NavLink>
      </section>
    </div>
  );
}
