import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Tag, Copy, Check, ArrowUpRight } from 'lucide-react';
import { CALENDAR_GUIDES } from '../content/guidesData';
import CodeSnippet from '../components/CodeSnippet';
import GuideText from '../components/GuideText';

export default function GuidesPage() {
  const { id } = useParams();
  const matchedGuide = id ? CALENDAR_GUIDES.find((g) => g.id === id) : null;
  const [selectedGuideState, setSelectedGuideState] = useState(CALENDAR_GUIDES[0]);
  const selectedGuide = matchedGuide || selectedGuideState;
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Guides
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
          How Indian public holidays work, and how to use this API in HR and payroll systems.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar - Guide Directory */}
        <aside className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Available Guides ({CALENDAR_GUIDES.length})
          </h2>
          {CALENDAR_GUIDES.map((guide) => {
            const isActive = selectedGuide?.id === guide.id;
            return (
              <Link
                key={guide.id}
                to={`/guides/${guide.id}`}
                onClick={() => setSelectedGuideState(guide)}
                className={`block p-4 rounded-xl border text-left transition-[border-color,background-color] duration-150 ${
                  isActive
                    ? 'bg-slate-900 border-saffron-500/80 shadow-md shadow-saffron-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-saffron-400">
                    <Tag size={10} />
                    {guide.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock size={10} />
                    {guide.readTime}
                  </span>
                </div>
                <h3 className={`text-sm font-bold leading-normal line-clamp-2 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                  {guide.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  {guide.summary}
                </p>
              </Link>
            );
          })}
        </aside>

        {/* Right Article Content */}
        <article className="lg:col-span-8 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 sm:p-6 shadow-xl">
          {/* Article Header */}
          <div className="border-b border-slate-800/80 pb-4 mb-5">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-saffron-500/10 border border-saffron-500/20 text-saffron-400 text-xs font-semibold">
                {selectedGuide.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                {selectedGuide.readTime}
              </span>
              <span className="text-xs text-slate-500">Updated {selectedGuide.date}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-normal mb-3">
              {selectedGuide.title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {selectedGuide.summary}
            </p>
          </div>

          {/* Article Sections */}
          <div className="space-y-6">
            {selectedGuide.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {section.heading}
                </h3>
                {section.content && (
                  <GuideText text={section.content} />
                )}
                {section.code && (
                  <div className="mt-4 relative group">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-200 overflow-x-auto">
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-500">
                        <span>Code Reference</span>
                        <button
                          onClick={() => handleCopy(section.code, idx)}
                          className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 text-[11px] transition-colors"
                        >
                          {copiedCodeIndex === idx ? (
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
                      <pre className="text-slate-100 whitespace-pre overflow-x-auto leading-relaxed">
                        {section.code}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
              <Link
                to="/playground"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400 hover:text-saffron-300 transition-colors"
              >
                <span>Try these requests in the playground</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
        </article>
      </div>
    </div>
  );
}
