import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Terminal, 
  Code, 
  Globe, 
  CheckCircle, 
  Info, 
  Clock, 
  Search, 
  ArrowRight, 
  Clipboard, 
  AlertCircle,
  FileText
} from 'lucide-react';

const regions = [
  { code: "central", name: "Central Government" },
  { code: "AN", name: "Andaman & Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "CH", name: "Chandigarh" },
  { code: "DL", name: "Delhi (NCT)" },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "HR", name: "Haryana" },
  { code: "JH", name: "Jharkhand" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MH", name: "Maharashtra" },
  { code: "ML", name: "Meghalaya" },
  { code: "MN", name: "Manipur" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "PY", name: "Puducherry" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TR", name: "Tripura" },
  { code: "TS", name: "Telangana" },
  { code: "UK", name: "Uttarakhand" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "WB", name: "West Bengal" }
];

const sampleHolidays = [
  { name: "New Year's Day", date: "2026-01-01", type: "restricted_holiday" },
  { name: "Makar Sankranti", date: "2026-01-14", type: "restricted_holiday" },
  { name: "Republic Day", date: "2026-01-26", type: "gazetted_holiday" },
  { name: "Ugadi Festival", date: "2026-03-19", type: "gazetted_holiday", stateOnly: true }
];

function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'property';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [endpoint, setEndpoint] = useState('holidays'); // holidays, is-holiday, next-holiday, range, calendar
  
  // Query parameters states
  const [year, setYear] = useState('2026');
  const [region, setRegion] = useState('central');
  const [date, setDate] = useState('2026-01-26');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  
  // generated URL and output response states
  const [apiUrl, setApiUrl] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // API docs active tab
  const [activeDocTab, setActiveDocTab] = useState('holidays');

  // Automatically update generated URL whenever parameters change
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
      setError(err.message || 'Failed to fetch from API');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Background Decorative Glows */}
      <div className="glow-backdrop">
        <div className="glow-circle-1"></div>
        <div className="glow-circle-2"></div>
      </div>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--glass-border)', padding: '1.25rem 0', backdropFilter: 'blur(10px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--saffron-gradient)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
            }}>
              <Calendar size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.5px' }}>
              Calendar <span className="text-saffron-gradient">API</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#playground" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Playground</a>
            <a href="#docs" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Docs</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '6rem 0 4rem', textAlign: 'center', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.25)', padding: '0.35rem 0.85rem', borderRadius: '30px', marginBottom: '2rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Version 1.0.0 Live</span>
          </div>
          
          <h1 style={{ fontSize: '3.75rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
            Free & Open <span className="text-saffron-gradient">Indian Calendar API</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', marginInline: 'auto' }}>
            Access reliable central and state-level public holidays, observances, and calendar utilities. Zero setup, no keys required, and open-source.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
            <a href="#playground" className="btn btn-primary" style={{ padding: '0.9rem 2.25rem' }}>
              Explore Playground <ArrowRight size={18} />
            </a>
            <a href="#docs" className="btn btn-secondary" style={{ padding: '0.9rem 2.25rem' }}>
              Read Documentation
            </a>
          </div>

          {/* Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ color: '#ea580c', marginBottom: '0.75rem' }}><Globe size={24} /></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Zero Signup</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tokens, API keys, or credit cards required.</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ color: '#6366f1', marginBottom: '0.75rem' }}><CheckCircle size={24} /></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>State-Level Support</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Central holidays merged seamlessly with regional dates.</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ color: '#10b981', marginBottom: '0.75rem' }}><Terminal size={24} /></div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>High Performance</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fast responses directly served from optimized files.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Playground Section */}
      <section id="playground" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Interactive <span className="text-saffron-gradient">Playground</span></h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginInline: 'auto' }}>Configure parameters, generate queries, and inspect responses instantly.</p>
          </div>

          {/* Config Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Control Panel */}
            <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={18} color="#ea580c" /> API Request Settings
              </h3>

              {/* API Base URL Setting */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>API Server Base URL</label>
                <input 
                  type="text" 
                  value={baseUrl} 
                  onChange={(e) => setBaseUrl(e.target.value)} 
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Endpoint selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Query Endpoint</label>
                <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="form-select">
                  <option value="holidays">GET /v1/holidays (Fetch Holidays List)</option>
                  <option value="is-holiday">GET /v1/date/is-holiday (Check Holiday Date)</option>
                  <option value="next-holiday">GET /v1/date/next-holiday (Find Upcoming)</option>
                  <option value="range">GET /v1/holidays/range (Fetch Date Range)</option>
                  <option value="calendar">GET /v1/calendar (Generate Year Calendar)</option>
                </select>
              </div>

              {/* Region Parameter */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Region (Central / State)</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-select">
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>

              {/* Conditional Inputs */}
              {(endpoint === 'holidays' || endpoint === 'calendar') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Year</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)} className="form-select">
                    <option value="2026">2026</option>
                  </select>
                </div>
              )}

              {(endpoint === 'is-holiday' || endpoint === 'next-holiday') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="form-input"
                  />
                </div>
              )}

              {endpoint === 'range' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <button onClick={handleFetch} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                Send Request
              </button>
            </div>

            {/* Response Viewer */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={18} color="#ea580c" /> Live HTTP Output
              </h3>

              {/* URL Display */}
              <div style={{ 
                background: 'rgba(0,0,0,0.4)', 
                border: '1px solid var(--glass-border)', 
                padding: '0.75rem 1rem', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                gap: '1rem'
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#8b9dff', wordBreak: 'break-all', overflow: 'hidden' }}>{apiUrl}</span>
                <button onClick={handleCopy} className="btn-icon" title="Copy to clipboard" style={{ flexShrink: 0 }}>
                  <Clipboard size={16} />
                </button>
              </div>

              {copied && (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.5rem', borderRadius: '8px', color: '#10b981', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>
                  Endpoint URL copied to clipboard!
                </div>
              )}

              {/* Response Window */}
              <div style={{ flex: 1, position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {loading && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 100 + '%', height: 100 + '%', background: 'rgba(5, 5, 8, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', zIndex: 10 }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(234, 88, 12, 0.2)', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  </div>
                )}

                {error && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: '#ef4444', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Failed to retrieve data</h4>
                      <p style={{ fontSize: '0.85rem' }}>{error}. Make sure your backend server is running locally on port 3000, or edit the "API Server Base URL" parameter if hosted elsewhere.</p>
                    </div>
                  </div>
                )}

                {!loading && !error && !response && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Terminal size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.9rem' }}>Click "Send Request" to invoke the API query and view the payload.</p>
                  </div>
                )}

                {response && (
                  <pre className="code-block" style={{ flex: 1, margin: 0, maxHeight: '400px' }} dangerouslySetInnerHTML={{ __html: syntaxHighlight(response) }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" style={{ padding: '4rem 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>API <span className="text-saffron-gradient">Documentation</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>Everything you need to integrate calendar data into your applications.</p>
          </div>

          {/* Doc Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <button onClick={() => setActiveDocTab('holidays')} className={`btn ${activeDocTab === 'holidays' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              GET /holidays
            </button>
            <button onClick={() => setActiveDocTab('is-holiday')} className={`btn ${activeDocTab === 'is-holiday' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              GET /is-holiday
            </button>
            <button onClick={() => setActiveDocTab('next-holiday')} className={`btn ${activeDocTab === 'next-holiday' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              GET /next-holiday
            </button>
            <button onClick={() => setActiveDocTab('range')} className={`btn ${activeDocTab === 'range' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              GET /range
            </button>
            <button onClick={() => setActiveDocTab('calendar')} className={`btn ${activeDocTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              GET /calendar
            </button>
          </div>

          {/* Doc Content panels */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            {activeDocTab === 'holidays' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span className="badge badge-get">GET</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>/v1/holidays</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Returns a list of government holidays for a specific year. By default, it loads central public holidays. If a region code (like KA) is provided, it merges central holidays with state-specific holidays, removes duplicates, and sorts them chronologically.
                </p>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Query Parameters</h4>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><code style={{ fontSize: '0.8rem' }}>country</code> <span style={{ color: '#ef4444' }}>[required]</span>: Must be <code style={{ fontSize: '0.8rem' }}>IN</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>year</code> <span style={{ color: '#ef4444' }}>[required]</span>: 4-digit year, e.g. <code style={{ fontSize: '0.8rem' }}>2026</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>region</code> [optional]: Upper-case 2-letter state code (e.g. <code style={{ fontSize: '0.8rem' }}>KA</code>, <code style={{ fontSize: '0.8rem' }}>MH</code>) or <code style={{ fontSize: '0.8rem' }}>central</code>.</li>
                </ul>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Example Response</h4>
                <pre className="code-block" dangerouslySetInnerHTML={{ __html: syntaxHighlight({
                  country: "IN",
                  year: 2026,
                  region: "KA",
                  data: sampleHolidays,
                  meta: { apiVersion: "v1", totalResults: 4, generatedAt: "2026-05-28T07:00:00Z" }
                }) }} />
              </div>
            )}

            {activeDocTab === 'is-holiday' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span className="badge badge-get">GET</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>/v1/date/is-holiday</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Checks if a particular calendar date falls on a public holiday, and returns a boolean value. Supports filtering for region-specific state holidays.
                </p>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Query Parameters</h4>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><code style={{ fontSize: '0.8rem' }}>country</code> <span style={{ color: '#ef4444' }}>[required]</span>: Must be <code style={{ fontSize: '0.8rem' }}>IN</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>date</code> <span style={{ color: '#ef4444' }}>[required]</span>: Date string in format <code style={{ fontSize: '0.8rem' }}>YYYY-MM-DD</code> (e.g., <code style={{ fontSize: '0.8rem' }}>2026-01-26</code>)</li>
                  <li><code style={{ fontSize: '0.8rem' }}>region</code> [optional]: Upper-case 2-letter state code or <code style={{ fontSize: '0.8rem' }}>central</code>.</li>
                </ul>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Example Response</h4>
                <pre className="code-block" dangerouslySetInnerHTML={{ __html: syntaxHighlight({
                  country: "IN",
                  year: 2026,
                  region: "central",
                  data: [
                    {
                      date: "2026-01-26",
                      is_holiday: true,
                      holidays: [
                        { name: "Republic Day", date: "2026-01-26", type: "gazetted_holiday", region: ["IN"], description: "Gazetted Holiday", source: "https://www.india.gov.in/calendar" }
                      ]
                    }
                  ],
                  meta: { apiVersion: "v1", totalResults: 1, generatedAt: "2026-05-28T07:00:00Z" }
                }) }} />
              </div>
            )}

            {activeDocTab === 'next-holiday' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span className="badge badge-get">GET</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>/v1/date/next-holiday</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Locates the very next upcoming public holiday(s) after a given date. If there are no holidays left in the year, it automatically wraps around to check the first holiday of the following year (if data exists).
                </p>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Query Parameters</h4>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><code style={{ fontSize: '0.8rem' }}>country</code> <span style={{ color: '#ef4444' }}>[required]</span>: Must be <code style={{ fontSize: '0.8rem' }}>IN</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>date</code> <span style={{ color: '#ef4444' }}>[required]</span>: Base date string in format <code style={{ fontSize: '0.8rem' }}>YYYY-MM-DD</code> (e.g. <code style={{ fontSize: '0.8rem' }}>2026-01-01</code>)</li>
                  <li><code style={{ fontSize: '0.8rem' }}>region</code> [optional]: Upper-case 2-letter state code or <code style={{ fontSize: '0.8rem' }}>central</code>.</li>
                </ul>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Example Response</h4>
                <pre className="code-block" dangerouslySetInnerHTML={{ __html: syntaxHighlight({
                  country: "IN",
                  year: 2026,
                  region: "central",
                  data: [
                    { name: "Hazarat Ali's Birthday", date: "2026-01-03", type: "restricted_holiday", region: ["IN"], description: "Restricted Holiday", source: "https://www.india.gov.in/calendar" }
                  ],
                  meta: { apiVersion: "v1", totalResults: 1, generatedAt: "2026-05-28T07:00:00Z" }
                }) }} />
              </div>
            )}

            {activeDocTab === 'range' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span className="badge badge-get">GET</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>/v1/holidays/range</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Filters holidays that occur between a specified start and end date (inclusive). This endpoint is capable of fetching data traversing year boundaries (e.g. from December to January).
                </p>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Query Parameters</h4>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><code style={{ fontSize: '0.8rem' }}>country</code> <span style={{ color: '#ef4444' }}>[required]</span>: Must be <code style={{ fontSize: '0.8rem' }}>IN</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>start</code> <span style={{ color: '#ef4444' }}>[required]</span>: Start date boundary in format <code style={{ fontSize: '0.8rem' }}>YYYY-MM-DD</code>.</li>
                  <li><code style={{ fontSize: '0.8rem' }}>end</code> <span style={{ color: '#ef4444' }}>[required]</span>: End date boundary in format <code style={{ fontSize: '0.8rem' }}>YYYY-MM-DD</code>.</li>
                  <li><code style={{ fontSize: '0.8rem' }}>region</code> [optional]: Upper-case 2-letter state code or <code style={{ fontSize: '0.8rem' }}>central</code>.</li>
                </ul>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Example Response</h4>
                <pre className="code-block" dangerouslySetInnerHTML={{ __html: syntaxHighlight({
                  country: "IN",
                  year: 2026,
                  region: "KA",
                  data: [
                    { name: "New Year's Day", date: "2026-01-01", type: "restricted_holiday", region: ["IN"], description: "Restricted Holiday", source: "https://www.india.gov.in/calendar" }
                  ],
                  meta: { apiVersion: "v1", totalResults: 1, generatedAt: "2026-05-28T07:00:00Z" }
                }) }} />
              </div>
            )}

            {activeDocTab === 'calendar' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span className="badge badge-get">GET</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>/v1/calendar</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Generates the complete calendar list (all 365 or 366 days) for a specified year. For each day, it marks weekends, matches holiday data, and calculates working day status (is_working_day is false if the day is a weekend or public holiday).
                </p>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Query Parameters</h4>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><code style={{ fontSize: '0.8rem' }}>country</code> <span style={{ color: '#ef4444' }}>[required]</span>: Must be <code style={{ fontSize: '0.8rem' }}>IN</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>year</code> <span style={{ color: '#ef4444' }}>[required]</span>: Target 4-digit calendar year, e.g. <code style={{ fontSize: '0.8rem' }}>2026</code></li>
                  <li><code style={{ fontSize: '0.8rem' }}>region</code> [optional]: Upper-case 2-letter state code or <code style={{ fontSize: '0.8rem' }}>central</code>.</li>
                </ul>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Example Response</h4>
                <pre className="code-block" dangerouslySetInnerHTML={{ __html: syntaxHighlight({
                  country: "IN",
                  year: 2026,
                  region: "KA",
                  data: [
                    { date: "2026-01-25", day: "Sunday", is_weekend: true, is_holiday: false, holiday_name: null, holiday_type: null, is_working_day: false },
                    { date: "2026-01-26", day: "Monday", is_weekend: false, is_holiday: true, holiday_name: "Republic Day", holiday_type: "gazetted_holiday", is_working_day: false },
                    { date: "2026-01-27", day: "Tuesday", is_weekend: false, is_holiday: false, holiday_name: null, holiday_type: null, is_working_day: true }
                  ],
                  meta: { apiVersion: "v1", totalResults: 3, generatedAt: "2026-05-28T07:00:00Z" }
                }) }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '3rem 0 2rem', background: '#050508' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#ea580c" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Calendar API</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Released under the MIT License. Made for developers by Antigravity.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <a href="#playground" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Playground</a>
            <a href="#docs" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
