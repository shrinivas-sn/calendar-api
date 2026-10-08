import React, { useState } from 'react';
import { Activity, Server } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function StatusPage() {
  const [baseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100 mb-3">
          Service status
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          A live check of the API from your browser, and how the service is run.
        </p>
      </div>

      <div className="interactive-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-saffron-500/10 flex items-center justify-center text-saffron-500">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-200 text-lg">System Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Checked dynamically on load</p>
          </div>
        </div>

        <StatusBadge baseUrl={baseUrl} />
      </div>

      <div className="docs-card p-6 sm:p-8">
        <h3 className="font-display font-bold text-base text-slate-200 mb-6 flex items-center gap-2">
          <Server size={16} className="text-saffron-500" />
          <span>Operational Details</span>
        </h3>

        <div className="space-y-4 text-xs sm:text-sm">
          {[
            ['API version', 'v1'],
            ['Hosting', 'Render, free plan'],
            ['Cold start', 'The first request after 15 minutes without traffic can take about a minute'],
            ['API address', 'calendar-api-d7a8.onrender.com'],
            ['Rate limit', '100 requests per 15 minutes per IP address'],
            ['Response caching', 'Successful responses are cacheable for 1 hour'],
            ['Data storage', 'JSON files in the public GitHub repository, no database'],
            ['Data source', 'india.gov.in holiday calendar'],
            ['Data refresh', 'Checked automatically on the 1st of every month'],
          ].map(([label, value], i, rows) => (
            <div
              key={label}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 ${i < rows.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <span className="text-slate-400 font-medium">{label}</span>
              <span className="text-slate-300 sm:text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
