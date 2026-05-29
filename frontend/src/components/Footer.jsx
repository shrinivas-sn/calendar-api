import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050508]/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand logo */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-saffron-500" />
            <span className="font-display font-bold text-slate-200">Calendar API</span>
          </div>

          {/* Copyright description */}
          <p className="text-sm text-slate-500 text-center md:text-left">
            Released under the MIT License. Open-source holiday API for India.
          </p>

          {/* Quick links */}
          <div className="flex gap-6 text-sm text-slate-400">
            <NavLink to="/" className="hover:text-saffron-400 transition-colors">
              Home
            </NavLink>
            <NavLink to="/playground" className="hover:text-saffron-400 transition-colors">
              Playground
            </NavLink>
            <NavLink to="/docs" className="hover:text-saffron-400 transition-colors">
              Docs
            </NavLink>
            <NavLink to="/status" className="hover:text-saffron-400 transition-colors">
              Status
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
