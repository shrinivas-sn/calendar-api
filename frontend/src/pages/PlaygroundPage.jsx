import React, { useState, useEffect } from 'react';
import { Terminal, Code, Clipboard, Check, Calendar as CalendarIcon, Play, AlertCircle } from 'lucide-react';
import RegionSelector from '../components/RegionSelector';
import CodeSnippet from '../components/CodeSnippet';
import JsonViewer from '../components/JsonViewer';
import CalendarGrid from '../components/CalendarGrid';

export default function PlaygroundPage() {
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [endpoint, setEndpoint] = useState('holidays'); // holidays, is-holiday, next-holiday, range, calendar
  
  // Query parameters states
  const [year, setYear] = useState('2026');
  const [region, setRegion] = useState('central');
  const [date, setDate] = useState('2026-01-26');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  
  // URL and API states
  const [apiUrl, setApiUrl] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  // Response preview tabs: json or calendar
  const [responseTab, setResponseTab] = useState('json');

  // Re-generate API URL on parameter changes
  useEffect(() => {
    let path = '/v1/holidays';
    const params = new URLSearchParams();
    params.append('country', 'IN');

    if (endpoint === 'holidays') {
      path = '/v1/holidays';
      params.append('year', year);
      if (region && region !== 'central') {
        params.append('region', region);
      }
    } else if (endpoint === 'is-holiday') {
      path = '/v1/date/is-holiday';
      params.append('date', date);
      if (region && region !== 'central') {
        params.append('region', region);
      }
    } else if (endpoint === 'next-holiday') {
      path = '/v1/date/next-holiday';
      params.append('date', date);
      if (region && region !== 'central') {
        params.append('region', region);
      }
    } else if (endpoint === 'range') {
      path = '/v1/holidays/range';
      params.append('start', startDate);
      params.append('end', endDate);
      if (region && region !== 'central') {
        params.append('region', region);
      }
    } else if (endpoint === 'calendar') {
      path = '/v1/calendar';
      params.append('year', year);
      if (region && region !== 'central') {
        params.append('region', region);
      }
    }

    setApiUrl(`${baseUrl}${path}?${params.toString()}`);
  }, [baseUrl, endpoint, year, region, date, startDate, endDate]);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP error ${res.status}`);
      }
      setResponse(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch from API. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Helper to check if calendar visual tab can be activated
  const canShowCalendar = endpoint === 'holidays' || endpoint === 'calendar';

  // Force Tab selection back to JSON if calendar tab is selected but endpoint changes to non-compatible
  useEffect(() => {
    if (!canShowCalendar && responseTab === 'calendar') {
      setResponseTab('json');
    }
  }, [endpoint, canShowCalendar, responseTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100 mb-3">
          Interactive <span className="text-saffron-gradient">Playground</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Build requests dynamically, copy code snippets, and preview live holiday outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column - Request builder */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0e0e15]/40 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            <h2 className="font-display font-bold text-base text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
              <Terminal size={16} className="text-saffron-500" />
              <span>API Query Parameters</span>
            </h2>

            {/* API server selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">API Server URL</label>
              <input 
                type="text" 
                value={baseUrl} 
                onChange={(e) => setBaseUrl(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 focus:border-saffron-500 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-saffron-500"
              />
            </div>

            {/* Endpoint selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Endpoint Route</label>
              <select 
                value={endpoint} 
                onChange={(e) => setEndpoint(e.target.value)} 
                className="w-full bg-[#050508] border border-white/10 focus:border-saffron-500 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-saffron-500"
              >
                <option value="holidays">GET /v1/holidays (Holiday List)</option>
                <option value="is-holiday">GET /v1/date/is-holiday (Holiday Checker)</option>
                <option value="next-holiday">GET /v1/date/next-holiday (Next Holiday)</option>
                <option value="range">GET /v1/holidays/range (Date Range)</option>
                <option value="calendar">GET /v1/calendar (Full Grid Layout)</option>
              </select>
            </div>

            {/* Region autocomplete */}
            <RegionSelector value={region} onChange={setRegion} />

            {/* Condition parameters */}
            {(endpoint === 'holidays' || endpoint === 'calendar') && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Calendar Year</label>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  className="w-full bg-[#050508] border border-white/10 focus:border-saffron-500 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-saffron-500"
                >
                  <option value="2026">2026</option>
                </select>
              </div>
            )}

            {(endpoint === 'is-holiday' || endpoint === 'next-holiday') && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date Check</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 focus:border-saffron-500 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-saffron-500"
                />
              </div>
            )}

            {endpoint === 'range' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 focus:border-saffron-500 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 focus:border-saffron-500 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleFetch}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-2 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-saffron-500 to-red-600 hover:from-saffron-600 hover:to-red-700 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-saffron-500/10"
            >
              <Play size={14} fill="white" />
              <span>Send Request</span>
            </button>
          </div>

          {/* Code snippet panel */}
          <CodeSnippet url={apiUrl} />
        </div>

        {/* Right column - Response previewer */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0e0e15]/40 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5 min-h-[500px]">
            {/* Header with tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
              <h2 className="font-display font-bold text-base text-slate-200 flex items-center gap-2">
                <Code size={16} className="text-saffron-500" />
                <span>API Output Response</span>
              </h2>

              {/* Toggles between JSON and visual calendar */}
              <div className="flex gap-1.5 p-1 rounded-lg bg-black/40 border border-white/5">
                <button
                  onClick={() => setResponseTab('json')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-150 ${
                    responseTab === 'json'
                      ? 'bg-saffron-500/10 text-saffron-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pretty JSON
                </button>
                <button
                  onClick={() => setResponseTab('calendar')}
                  disabled={!canShowCalendar}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-150 flex items-center gap-1.5 disabled:opacity-40 disabled:hover:text-slate-400 ${
                    responseTab === 'calendar'
                      ? 'bg-saffron-500/10 text-saffron-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CalendarIcon size={12} />
                  <span>Calendar Grid</span>
                </button>
              </div>
            </div>

            {/* Generated URL bar */}
            <div className="bg-black/50 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-blue-400 overflow-x-auto whitespace-nowrap scrollbar-none w-full">
                {apiUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className="flex-shrink-0 p-1.5 rounded bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                title="Copy Address URL"
              >
                {copiedUrl ? <Check size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
              </button>
            </div>

            {/* Response Display Box */}
            <div className="flex-1 flex flex-col justify-start relative min-h-[350px]">
              {loading && (
                <div className="absolute inset-0 bg-[#0e0e15]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                  <div className="w-10 h-10 border-3 border-saffron-500/30 border-t-saffron-500 rounded-full animate-spin" />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start gap-3 text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <h4 className="font-bold mb-1">Failed to fetch data</h4>
                    <p className="leading-relaxed">{error}</p>
                    <p className="mt-3 text-slate-500 text-[11px]">
                      Check that the server address matches your running local or cloud port.
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && !response && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl text-slate-500">
                  <Terminal size={36} className="mb-3 opacity-40 text-slate-400" />
                  <h4 className="font-display font-semibold text-slate-400 text-sm mb-1">Waiting for Query</h4>
                  <p className="text-xs max-w-xs leading-relaxed">
                    Click the "Send Request" button to issue queries and review output datasets.
                  </p>
                </div>
              )}

              {!loading && !error && response && (
                <div className="flex-1 flex flex-col animate-fadeIn">
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
