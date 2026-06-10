import React, { useState, useEffect } from 'react';
import { Terminal, Code, Clipboard, Check, Calendar as CalendarIcon, Play, AlertCircle, ChevronDown, Zap, Globe } from 'lucide-react';
import RegionSelector from '../components/RegionSelector';
import CodeSnippet from '../components/CodeSnippet';
import JsonViewer from '../components/JsonViewer';
import CalendarGrid from '../components/CalendarGrid';
import StatusBadge from '../components/StatusBadge';

export default function PlaygroundPage() {
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [endpoint, setEndpoint] = useState('holidays');
  
  const [year, setYear] = useState('2026');
  const [region, setRegion] = useState('central');
  const [date, setDate] = useState('2026-01-26');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  
  const [apiUrl, setApiUrl] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [responseTab, setResponseTab] = useState('json');
  const [responseTime, setResponseTime] = useState(null);
  const [httpStatus, setHttpStatus] = useState(null);
  const [longLoad, setLongLoad] = useState(false);

  useEffect(() => {
    let path = '/v1/holidays';
    const params = new URLSearchParams();
    params.append('country', 'IN');

    if (endpoint === 'holidays') {
      path = '/v1/holidays';
      params.append('year', year);
      if (region && region !== 'central') params.append('region', region);
    } else if (endpoint === 'is-holiday') {
      path = '/v1/date/is-holiday';
      params.append('date', date);
      if (region && region !== 'central') params.append('region', region);
    } else if (endpoint === 'next-holiday') {
      path = '/v1/date/next-holiday';
      params.append('date', date);
      if (region && region !== 'central') params.append('region', region);
    } else if (endpoint === 'range') {
      path = '/v1/holidays/range';
      params.append('start', startDate);
      params.append('end', endDate);
      if (region && region !== 'central') params.append('region', region);
    } else if (endpoint === 'calendar') {
      path = '/v1/calendar';
      params.append('year', year);
      if (region && region !== 'central') params.append('region', region);
    }

    setApiUrl(`${baseUrl}${path}?${params.toString()}`);
  }, [baseUrl, endpoint, year, region, date, startDate, endDate]);

  const handleFetch = async () => {
    setLoading(true);
    setLongLoad(false);
    setError(null);
    setResponse(null);
    setResponseTime(null);
    setHttpStatus(null);
    
    const longLoadTimeout = setTimeout(() => {
      setLongLoad(true);
    }, 3000);

    const startTime = performance.now();
    try {
      const res = await fetch(apiUrl);
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTime(elapsed);
      setHttpStatus(res.status);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP error ${res.status}`);
      }
      setResponse(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch from API. Ensure your backend is running.');
    } finally {
      clearTimeout(longLoadTimeout);
      setLoading(false);
      setLongLoad(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const canShowCalendar = endpoint === 'holidays' || endpoint === 'calendar';

  useEffect(() => {
    if (!canShowCalendar && responseTab === 'calendar') {
      setResponseTab('json');
    }
  }, [endpoint, canShowCalendar, responseTab]);

  const endpointOptions = [
    { value: 'holidays', label: '/v1/holidays', desc: 'Holiday List' },
    { value: 'is-holiday', label: '/v1/date/is-holiday', desc: 'Holiday Checker' },
    { value: 'next-holiday', label: '/v1/date/next-holiday', desc: 'Next Holiday' },
    { value: 'range', label: '/v1/holidays/range', desc: 'Date Range' },
    { value: 'calendar', label: '/v1/calendar', desc: 'Full Grid' },
  ];

  const currentEndpoint = endpointOptions.find(e => e.value === endpoint);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron-500/10 border border-saffron-500/20 text-saffron-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Zap size={12} />
          <span>Live API Console</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-3">
          Interactive <span className="text-saffron-gradient">Playground</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Build requests, preview live outputs, and copy production-ready code snippets.
        </p>
      </div>

      {/* ───── Unified Console Card ───── */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-2xl shadow-black/30 overflow-hidden backdrop-blur-sm">

        {/* Console Header Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            {/* Traffic light dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-saffron-500" />
              <span className="font-display font-bold text-sm text-slate-200 tracking-wide">API Console</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge baseUrl={baseUrl} />
            {httpStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                httpStatus >= 200 && httpStatus < 300
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  httpStatus >= 200 && httpStatus < 300 ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                {httpStatus}
              </span>
            )}
            {responseTime !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                <Zap size={10} />
                {responseTime}ms
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span className="font-mono">GET</span>
            </span>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-black/30 border-b border-slate-800/40">
          <Globe size={14} className="text-slate-500 flex-shrink-0" />
          <span className="font-mono text-xs text-blue-400 overflow-x-auto whitespace-nowrap flex-1 scrollbar-none select-all">
            {apiUrl}
          </span>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors text-[11px] font-semibold"
            title="Copy URL"
          >
            {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Clipboard size={12} />}
            <span className="hidden sm:inline">{copiedUrl ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* ───── Main Console Body: Split Layout ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">

          {/* ─── Left Panel: Request Builder ─── */}
          <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/40">
            <div className="flex-1 flex flex-col gap-5 p-5 sm:p-6">
              <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-saffron-500/10 flex items-center justify-center">
                  <ChevronDown size={12} className="text-saffron-500" />
                </span>
                Request Builder
              </h3>

              {/* API Server */}
              <div className="group">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-saffron-400 transition-colors">API Server URL</label>
                <input 
                  type="text" 
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)} 
                  className="w-full bg-black/40 border border-slate-800 focus:border-saffron-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-saffron-500/40 transition-all"
                />
              </div>

              {/* Endpoint Selector */}
              <div className="group">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-saffron-400 transition-colors">Endpoint Route</label>
                <select 
                  value={endpoint} 
                  onChange={(e) => setEndpoint(e.target.value)} 
                  className="w-full bg-black/40 border border-slate-800 focus:border-saffron-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-saffron-500/40 transition-all appearance-none cursor-pointer"
                >
                  {endpointOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>GET {opt.label} — {opt.desc}</option>
                  ))}
                </select>
              </div>

              {/* Region selector */}
              <RegionSelector value={region} onChange={setRegion} />

              {/* Conditional Parameters */}
              {(endpoint === 'holidays' || endpoint === 'calendar') && (
                <div className="group">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-saffron-400 transition-colors">Calendar Year</label>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    className="w-full bg-black/40 border border-slate-800 focus:border-saffron-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-saffron-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="2026">2026</option>
                  </select>
                </div>
              )}

              {(endpoint === 'is-holiday' || endpoint === 'next-holiday') && (
                <div className="group">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-saffron-400 transition-colors">Date Check</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="w-full bg-black/40 border border-slate-800 focus:border-saffron-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-saffron-500/40 transition-all"
                  />
                </div>
              )}

              {endpoint === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-saffron-400 transition-colors">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="w-full bg-black/40 border border-slate-800 focus:border-saffron-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-saffron-500/40 transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-saffron-400 transition-colors">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full bg-black/40 border border-slate-800 focus:border-saffron-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-saffron-500/40 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Send Request Button */}
              <button
                onClick={handleFetch}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 mt-auto py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-saffron-500 to-red-600 hover:from-saffron-600 hover:to-red-700 disabled:opacity-50 hover:shadow-lg hover:shadow-saffron-500/20 active:scale-[0.98] transition-all duration-200"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play size={14} fill="white" />
                )}
                <span>{loading ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>

            {/* Code Snippet — inside left panel, below the form */}
            <div className="border-t border-slate-800/40 p-5 sm:p-6">
              <CodeSnippet url={apiUrl} />
            </div>
          </div>

          {/* ─── Right Panel: Response Viewer ─── */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Response Tab Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/40 bg-slate-950/40">
              <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center">
                  <Code size={12} className="text-indigo-400" />
                </span>
                Response
              </h3>

              <div className="flex gap-1 p-1 rounded-lg bg-black/40 border border-white/5">
                <button
                  onClick={() => setResponseTab('json')}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-all duration-150 ${
                    responseTab === 'json'
                      ? 'bg-saffron-500/15 text-saffron-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Pretty JSON
                </button>
                <button
                  onClick={() => setResponseTab('calendar')}
                  disabled={!canShowCalendar}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-all duration-150 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed ${
                    responseTab === 'calendar'
                      ? 'bg-saffron-500/15 text-saffron-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <CalendarIcon size={11} />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            {/* Response Body */}
            <div className="flex-1 flex flex-col p-5 sm:p-6 relative min-h-[400px]">
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3 text-center px-4">
                  <div className="w-10 h-10 border-3 border-saffron-500/20 border-t-saffron-500 rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-slate-400 animate-pulse">
                    {longLoad ? 'Waking up backend server (this first load takes 30-40s)...' : 'Fetching response...'}
                  </span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-400 text-sm mb-1">Request Failed</h4>
                    <p className="text-red-400/80 text-xs sm:text-sm leading-relaxed">{error}</p>
                    <p className="mt-2 text-slate-500 text-[11px]">
                      Check that the server address matches your running local or cloud port.
                    </p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && !response && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mb-4">
                    <Terminal size={28} className="text-slate-600" />
                  </div>
                  <h4 className="font-display font-bold text-slate-400 text-sm mb-1.5">Ready to Query</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Configure your request parameters on the left and click <strong className="text-saffron-400">Send Request</strong> to see results here.
                  </p>
                </div>
              )}

              {/* Response Data */}
              {!loading && !error && response && (
                <div className="flex-1 flex flex-col animate-fadeIn">
                  {/* Quick response stats */}
                  {response.meta && (
                    <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        <span className="text-slate-300 font-bold">{response.meta.totalResults || '—'}</span> results
                      </span>
                      {response.region && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          Region: <span className="text-slate-300 font-bold font-mono">{response.region}</span>
                        </span>
                      )}
                      {response.year && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          Year: <span className="text-slate-300 font-bold font-mono">{response.year}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {responseTab === 'json' ? (
                    <JsonViewer data={response} />
                  ) : (
                    <div className="flex-1 flex flex-col items-stretch">
                      <CalendarGrid responseData={response} year={parseInt(year, 10)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
