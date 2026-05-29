import React, { useState } from 'react';
import { Terminal, Code, Info, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview & Setup' },
    { id: 'endpoints-ref', label: 'API Endpoints' },
    { id: 'response-schema', label: 'Response Schema' },
    { id: 'errors', label: 'Errors & Limits' }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const sampleHolidays = [
    { name: "New Year's Day", date: "2026-01-01", type: "restricted_holiday" },
    { name: "Makar Sankranti", date: "2026-01-14", type: "restricted_holiday" },
    { name: "Republic Day", date: "2026-01-26", type: "gazetted_holiday" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto py-2 pr-6 border-r border-slate-800/60 scrollbar-none hidden lg:block">
          <h2 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest px-2 mb-4 flex items-center gap-1.5">
            <BookOpen size={12} className="text-saffron-500" />
            <span>API Reference</span>
          </h2>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-150 ${
                  activeSection === item.id
                    ? 'bg-saffron-500/10 text-saffron-400 font-bold border-l-2 border-saffron-500 pl-2.5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Documentation Content */}
        <div className="lg:col-span-9 flex flex-col gap-16 docs-card p-6 sm:p-10">
          
          {/* Section: Overview */}
          <section id="overview" className="scroll-mt-24">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100 mb-4">API Overview</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4">
              Welcome to the India Calendar API documentation! This open-source REST API allows you to fetch government holidays (Central and State level) directly from static JSON files generated from official sources.
            </p>
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-400 text-xs sm:text-sm">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Zero Setup:</strong> The API is completely open, requires no registration, API keys, or credit cards, and serves data instantly. Perfect for SaaS apps, HR tools, or checkout counters.
              </p>
            </div>
          </section>

          {/* Section: Base URL */}
          <section id="base-url" className="scroll-mt-24 border-t border-white/5 pt-10">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-100 mb-4">Base URL</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              All requests are issued to the production deployment URL below. Always use HTTPS.
            </p>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 font-mono text-xs sm:text-sm text-blue-400 break-all select-all">
              https://calendar-api-production-a697.up.railway.app
            </div>
          </section>

          {/* Section: API Endpoints Reference Group */}
          <div id="endpoints-ref" className="scroll-mt-24 border-t border-white/5 pt-10">
            <h2 className="font-display font-extrabold text-2xl text-slate-100 mb-2">API Endpoints</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The API provides five lightweight, database-free routes to query holiday data. Review details and parameter schemas below.
            </p>
          </div>

          {/* Section: GET /v1/holidays */}
          <section id="holidays" className="scroll-mt-24 border-t border-white/5 pt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">GET</span>
              <h2 className="font-mono font-bold text-lg sm:text-xl text-slate-100">/v1/holidays</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Returns sorted chronological lists of holidays. If a 2-letter region code is passed, state-specific holidays are dynamically combined with central holidays, and matching duplicates are automatically filtered out.
            </p>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Query Parameters</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 pr-4 font-bold">Parameter</th>
                    <th className="py-2 px-4 font-bold">Required</th>
                    <th className="py-2 px-4 font-bold">Type</th>
                    <th className="py-2 pl-4 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">country</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Must be <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">IN</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">year</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">number</td>
                    <td className="py-3 pl-4 leading-relaxed">4-digit year, e.g. <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">2026</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">region</td>
                    <td className="py-3 px-4 text-slate-500">No</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Uppercase 2-letter state code or <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">central</code>. Defaults to central.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Example Response</h3>
            <JsonViewer data={{
              country: "IN",
              year: 2026,
              region: "KA",
              data: sampleHolidays,
              meta: { apiVersion: "v1", totalResults: 3, generatedAt: "2026-05-28T07:00:00Z" }
            }} />
          </section>

          {/* Section: GET /v1/date/is-holiday */}
          <section id="is-holiday" className="scroll-mt-24 border-t border-white/5 pt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">GET</span>
              <h2 className="font-mono font-bold text-lg sm:text-xl text-slate-100">/v1/date/is-holiday</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Quickly verifies if a specific calendar date is a public holiday.
            </p>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Query Parameters</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 pr-4 font-bold">Parameter</th>
                    <th className="py-2 px-4 font-bold">Required</th>
                    <th className="py-2 px-4 font-bold">Type</th>
                    <th className="py-2 pl-4 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">country</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Must be <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">IN</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">date</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Format <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">YYYY-MM-DD</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">region</td>
                    <td className="py-3 px-4 text-slate-500">No</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Uppercase 2-letter state code or <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">central</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Example Response</h3>
            <JsonViewer data={{
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
            }} />
          </section>

          {/* Section: GET /v1/date/next-holiday */}
          <section id="next-holiday" className="scroll-mt-24 border-t border-white/5 pt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">GET</span>
              <h2 className="font-mono font-bold text-lg sm:text-xl text-slate-100">/v1/date/next-holiday</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Finds the next upcoming holiday(s) chronologically after a given date. Automatically wraps around to check the first holiday of the following year.
            </p>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Query Parameters</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 pr-4 font-bold">Parameter</th>
                    <th className="py-2 px-4 font-bold">Required</th>
                    <th className="py-2 px-4 font-bold">Type</th>
                    <th className="py-2 pl-4 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">country</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Must be <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">IN</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">date</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Base date in format <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">YYYY-MM-DD</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">region</td>
                    <td className="py-3 px-4 text-slate-500">No</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Uppercase 2-letter state code or <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">central</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Example Response</h3>
            <JsonViewer data={{
              country: "IN",
              year: 2026,
              region: "central",
              data: [
                { name: "Hazarat Ali's Birthday", date: "2026-01-03", type: "restricted_holiday", region: ["IN"], description: "Restricted Holiday", source: "https://www.india.gov.in/calendar" }
              ],
              meta: { apiVersion: "v1", totalResults: 1, generatedAt: "2026-05-28T07:00:00Z" }
            }} />
          </section>

          {/* Section: GET /v1/holidays/range */}
          <section id="range" className="scroll-mt-24 border-t border-white/5 pt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">GET</span>
              <h2 className="font-mono font-bold text-lg sm:text-xl text-slate-100">/v1/holidays/range</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Filters holidays within a custom range, supporting boundary traversals.
            </p>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Query Parameters</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 pr-4 font-bold">Parameter</th>
                    <th className="py-2 px-4 font-bold">Required</th>
                    <th className="py-2 px-4 font-bold">Type</th>
                    <th className="py-2 pl-4 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">country</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Must be <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">IN</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">start</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Start date boundary <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">YYYY-MM-DD</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">end</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">End date boundary <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">YYYY-MM-DD</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">region</td>
                    <td className="py-3 px-4 text-slate-500">No</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Uppercase 2-letter state code or <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">central</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Example Response</h3>
            <JsonViewer data={{
              country: "IN",
              year: 2026,
              region: "KA",
              data: [
                { name: "New Year's Day", date: "2026-01-01", type: "restricted_holiday", region: ["IN"], description: "Restricted Holiday", source: "https://www.india.gov.in/calendar" }
              ],
              meta: { apiVersion: "v1", totalResults: 1, generatedAt: "2026-05-28T07:00:00Z" }
            }} />
          </section>

          {/* Section: GET /v1/calendar */}
          <section id="calendar" className="scroll-mt-24 border-t border-white/5 pt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">GET</span>
              <h2 className="font-mono font-bold text-lg sm:text-xl text-slate-100">/v1/calendar</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Constructs a full 365 or 366 day dataset tagged with weekends, holidays, names, classifications and business day evaluations.
            </p>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Query Parameters</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 pr-4 font-bold">Parameter</th>
                    <th className="py-2 px-4 font-bold">Required</th>
                    <th className="py-2 px-4 font-bold">Type</th>
                    <th className="py-2 pl-4 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">country</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Must be <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">IN</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">year</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 font-mono text-slate-500">number</td>
                    <td className="py-3 pl-4 leading-relaxed">4-digit year, e.g. <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">2026</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-saffron-400 font-semibold">region</td>
                    <td className="py-3 px-4 text-slate-500">No</td>
                    <td className="py-3 px-4 font-mono text-slate-500">string</td>
                    <td className="py-3 pl-4 leading-relaxed">Uppercase 2-letter state code or <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-xs">central</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Example Response</h3>
            <JsonViewer data={{
              country: "IN",
              year: 2026,
              region: "KA",
              data: [
                { date: "2026-01-25", day: "Sunday", is_weekend: true, is_holiday: false, holiday_name: null, holiday_type: null, is_working_day: false },
                { date: "2026-01-26", day: "Monday", is_weekend: false, is_holiday: true, holiday_name: "Republic Day", holiday_type: "gazetted_holiday", is_working_day: false },
                { date: "2026-01-27", day: "Tuesday", is_weekend: false, is_holiday: false, holiday_name: null, holiday_type: null, is_working_day: true }
              ],
              meta: { apiVersion: "v1", totalResults: 3, generatedAt: "2026-05-28T07:00:00Z" }
            }} />
          </section>

          {/* Section: Response Schema */}
          <section id="response-schema" className="scroll-mt-24 border-t border-white/5 pt-10">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-100 mb-4">Response Schema</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              All success requests return JSON matching the standard schema format:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
              <li><code className="text-saffron-400 font-semibold font-mono">country</code>: ISO alpha 2 country code (<code className="bg-white/5 font-mono px-1 rounded text-xs">IN</code>).</li>
              <li><code className="text-saffron-400 font-semibold font-mono">year</code>: The calendar year requested.</li>
              <li><code className="text-saffron-400 font-semibold font-mono">region</code>: The state code requested, or <code className="bg-white/5 font-mono px-1 rounded text-xs">central</code>.</li>
              <li><code className="text-saffron-400 font-semibold font-mono">data</code>: Array containing corresponding holiday records.</li>
              <li><code className="text-saffron-400 font-semibold font-mono">meta</code>: Contains payload metadata like <code className="font-mono text-xs">apiVersion</code>, <code className="font-mono text-xs">totalResults</code> and generation timestamp.</li>
            </ul>
          </section>

          {/* Section: Errors & Rate Limits */}
          <section id="errors" className="scroll-mt-24 border-t border-white/5 pt-10">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-100 mb-4">Errors & Rate Limits</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              When queries fail, validation checks fail, or limits are exceeded, the API returns a standardized JSON structure with the corresponding HTTP status code.
            </p>

            {/* Error Schema definition */}
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Error Response Format</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              All error responses include the following three parameters:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed mb-6">
              <li><code className="text-saffron-400 font-semibold font-mono">error</code>: Always set to <code className="bg-white/5 font-mono px-1 rounded text-xs">true</code>.</li>
              <li><code className="text-saffron-400 font-semibold font-mono">message</code>: Human-readable explanation of why the query failed.</li>
              <li><code className="text-saffron-400 font-semibold font-mono">status</code>: The HTTP status code corresponding to the response header.</li>
            </ul>

            {/* Status Catalog Table */}
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Validation Check Catalog</h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold">
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 px-4">API Error Message (`message`)</th>
                    <th className="py-2 pl-4">Trigger Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {/* Status 400 Errors */}
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Missing required parameter: country</td>
                    <td className="py-3 pl-4 leading-relaxed">The `country` query parameter was not provided.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Missing required parameter: year</td>
                    <td className="py-3 pl-4 leading-relaxed">The `year` parameter is required for lists and calendar endpoints.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Invalid year format. Use a 4-digit number</td>
                    <td className="py-3 pl-4 leading-relaxed">The `year` value is not formatted as YYYY (e.g. `26` or `20265`).</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Region parameter must be uppercase 2-letter code or 'central'</td>
                    <td className="py-3 pl-4 leading-relaxed">The state code was lowercase or did not match the 2-letter format.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Missing required parameter: date</td>
                    <td className="py-3 pl-4 leading-relaxed">Required parameter `date` is missing for checkers or next-holiday queries.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Invalid date format. Use YYYY-MM-DD</td>
                    <td className="py-3 pl-4 leading-relaxed">The `date`, `start`, or `end` values are not matching standard ISO formats.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Missing required parameters: start and end</td>
                    <td className="py-3 pl-4 leading-relaxed">The `/holidays/range` endpoint requires both query bounds.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-amber-500">400 Bad Request</td>
                    <td className="py-3 px-4 font-mono text-xs">Start date cannot be after end date</td>
                    <td className="py-3 pl-4 leading-relaxed">The start range parameter occurs chronologically after the end parameter.</td>
                  </tr>

                  {/* Status 404 Errors */}
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-red-400">404 Not Found</td>
                    <td className="py-3 px-4 font-mono text-xs">Only IN is supported in v1</td>
                    <td className="py-3 pl-4 leading-relaxed">The `country` query parameter is not `IN`.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-red-400">404 Not Found</td>
                    <td className="py-3 px-4 font-mono text-xs">Data not available for this year</td>
                    <td className="py-3 pl-4 leading-relaxed">Data has not been scraped or generated for the requested year folder.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-red-400">404 Not Found</td>
                    <td className="py-3 px-4 font-mono text-xs">Region not found</td>
                    <td className="py-3 pl-4 leading-relaxed">The state/UT code provided does not exist in our system database.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-red-400">404 Not Found</td>
                    <td className="py-3 px-4 font-mono text-xs">Data not available for the requested year range</td>
                    <td className="py-3 pl-4 leading-relaxed">The range query dates do not match any year directories on the server.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-red-400">404 Not Found</td>
                    <td className="py-3 px-4 font-mono text-xs">Endpoint not found</td>
                    <td className="py-3 pl-4 leading-relaxed">The requested API route path or method is invalid.</td>
                  </tr>

                  {/* Status 429 Errors */}
                  <tr>
                    <td className="py-3 pr-4 font-mono font-bold text-purple-400">429 Rate Limited</td>
                    <td className="py-3 px-4 font-mono text-xs">Too many requests, please try again later</td>
                    <td className="py-3 pl-4 leading-relaxed">Your IP exceeded 100 queries within a 15-minute window.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 font-mono">Example Validation Error Response (400)</h3>
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400 text-xs sm:text-sm mb-6">
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Errors always return in the standard format below, making handling consistent across environments.
              </p>
            </div>

            <JsonViewer data={{
              error: true,
              message: "Missing required parameter: country",
              status: 400
            }} />
          </section>
        </div>
      </div>
    </div>
  );
}
