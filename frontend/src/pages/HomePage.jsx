import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Terminal, Check, Copy, Play } from 'lucide-react';
import RegionSelector from '../components/RegionSelector';
import JsonViewer from '../components/JsonViewer';

const ENDPOINTS = [
  { path: '/v1/holidays', returns: 'All holidays in a year, for the Central Government or one state', params: 'country, year, region, scope' },
  { path: '/v1/date/is-holiday', returns: 'Whether a date is a holiday, and which holidays fall on it', params: 'country, date, region, scope' },
  { path: '/v1/date/next-holiday', returns: 'The next holiday after a given date', params: 'country, date, region, scope' },
  { path: '/v1/holidays/range', returns: 'Holidays between two dates, up to 5 calendar years', params: 'country, start, end, region, scope' },
  { path: '/v1/calendar', returns: 'Every day of a year with weekend, holiday and working-day flags', params: 'country, year, region, scope, restricted' },
];

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
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
        {/* Left Column: Heading, Value Props, CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.12]">
            Indian public holidays API
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
            Official gazetted and restricted holidays for the Central Government and all 36 States and Union Territories, as JSON. No API key, no sign-up.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <NavLink
              to="/playground"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-saffron-600 hover:bg-saffron-500 active:bg-saffron-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>Try it in the playground</span>
              <ArrowRight size={16} />
            </NavLink>
            <NavLink
              to="/docs"
              className="text-sm font-semibold text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 rounded"
            >
              Read the docs
            </NavLink>
          </div>
        </div>

        {/* Right Column: Live Artifact in the Hero */}
        <div className="lg:col-span-6">
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-saffron-500" />
                <span className="text-xs font-mono text-slate-300 font-semibold">Example request</span>
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

      {/* Endpoints */}
      <section className="mb-16 pt-12 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Endpoints
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              All endpoints are GET requests and need <code className="font-mono text-slate-300">country=IN</code>.
            </p>
          </div>
          <NavLink
            to="/docs"
            className="text-xs font-semibold text-saffron-400 hover:text-saffron-300 flex items-center gap-1"
          >
            <span>Full reference</span>
            <ArrowRight size={13} />
          </NavLink>
        </div>

        <ul className="divide-y divide-slate-800 border-y border-slate-800">
          {ENDPOINTS.map((endpoint) => (
            <li key={endpoint.path} className="py-4 grid gap-1 md:grid-cols-12 md:gap-6 md:items-baseline">
              <span className="md:col-span-4 font-mono text-sm text-slate-100">{endpoint.path}</span>
              <span className="md:col-span-5 text-sm text-slate-300">{endpoint.returns}</span>
              <span className="md:col-span-3 font-mono text-xs text-slate-400">{endpoint.params}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-400 mt-4">
          Data and source code:{' '}
          <a
            href="https://github.com/shrinivas-sn/calendar-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600"
          >
            github.com/shrinivas-sn/calendar-api
          </a>
        </p>
      </section>

      {/* Guides */}
      <section className="pt-12 border-t border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Guides
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Gazetted vs restricted holidays, HR leave calculations, and code examples in Node.js, Python and Go.
        </p>
        <NavLink
          to="/guides"
          className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-saffron-400 hover:text-saffron-300"
        >
          <span>Read the guides</span>
          <ArrowRight size={13} />
        </NavLink>
      </section>
    </div>
  );
}
