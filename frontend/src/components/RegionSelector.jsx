import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { regions } from '../data/regions';

export default function RegionSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Find active region name
  const activeRegion = regions.find(r => r.code === value) || { name: "Central Government", code: "central" };

  // Filter regions based on search
  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state if value changes from outside
  useEffect(() => {
    setSearchTerm("");
  }, [value]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Region (Central / State)
      </label>
      
      {/* Control selector */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-4 py-2.5 text-left text-sm text-slate-200 flex items-center justify-between focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all duration-200"
      >
        <span>{activeRegion.name} ({activeRegion.code})</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 shadow-xl max-h-60 overflow-hidden flex flex-col">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-white/5 flex items-center gap-2 bg-black/20">
            <Search size={14} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search central or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-sm text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none"
              autoFocus
            />
          </div>

          {/* List items */}
          <div className="overflow-y-auto flex-1 py-1">
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region) => {
                const isSelected = region.code === value;
                return (
                  <button
                    key={region.code}
                    type="button"
                    onClick={() => {
                      onChange(region.code);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors duration-150 ${
                      isSelected 
                        ? 'bg-saffron-500/10 text-saffron-400 font-semibold' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{region.name} <span className="text-xs text-slate-500">({region.code})</span></span>
                    {isSelected && <Check size={14} className="text-saffron-400" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No regions found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
