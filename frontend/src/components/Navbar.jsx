import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/playground", label: "Playground" },
    { to: "/docs", label: "Docs" },
    { to: "/status", label: "Status" }
  ];

  const GithubIcon = () => (
    <svg 
      viewBox="0 0 24 24" 
      width="20" 
      height="20" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="transition-colors duration-200"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex items-center gap-3 group hover:opacity-95 transition-opacity duration-200">
            <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <img src="/images/favicon.svg" alt="Calendar API Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-100 group-hover:text-white transition-colors duration-200">
              Calendar <span className="text-saffron-gradient">API</span>
            </span>
          </NavLink>

          {/* Right Action side container: links and Github icon */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 h-16 ${
                      isActive
                        ? "border-saffron-500 text-saffron-500 font-semibold"
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-100 transition-colors duration-200"
              aria-label="GitHub repository"
            >
              <GithubIcon />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-900 px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? "bg-saffron-500/10 text-saffron-400 font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-4 pb-2 border-t border-white/5 flex items-center justify-between px-3">
            <span className="text-sm text-slate-400">View code</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
