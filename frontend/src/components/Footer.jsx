import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Footer() {
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex items-center gap-2 group hover:opacity-90 transition-opacity duration-200">
            <img src="/images/favicon.svg" alt="Calendar API Logo" className="w-7 h-7 object-contain" />
            <span className="font-display font-bold text-slate-200">Calendar API</span>
          </NavLink>

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
