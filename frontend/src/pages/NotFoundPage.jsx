import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-saffron-500 mb-6 shadow-lg">
        <Compass size={32} />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
        404 — Page Not Found
      </h1>
      <p className="text-slate-400 text-base max-w-md mx-auto mb-8">
        The requested documentation page or endpoint view doesn't exist or has moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-saffron-600 hover:bg-saffron-500 active:bg-saffron-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-[background-color,transform] active:scale-[0.99]"
        >
          <Home size={15} />
          <span>Back to Home</span>
        </Link>
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={15} />
          <span>API Documentation</span>
        </Link>
      </div>
    </div>
  );
}
