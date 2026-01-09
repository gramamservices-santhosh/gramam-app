'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import { searchLocations, LOCATION_ICONS } from '@/constants/locations';
import { LocationPoint } from '@/types';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: LocationPoint | null;
  onChange: (location: LocationPoint | null) => void;
  variant?: 'pickup' | 'drop';
}

export default function LocationInput({
  label,
  placeholder,
  value,
  onChange,
  variant = 'pickup',
}: LocationInputProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchLocations>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const results = searchLocations(query);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: typeof suggestions[0]) => {
    onChange({
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
    });
    setQuery(loc.name);
    setIsFocused(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-foreground/80 mb-1.5">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
          'bg-card',
          isFocused ? 'border-primary ring-2 ring-primary/30' : 'border-border'
        )}
      >
        <MapPin
          className={cn(
            'w-5 h-5 flex-shrink-0',
            variant === 'pickup' ? 'text-success' : 'text-primary'
          )}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setIsFocused(true)}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted outline-none"
        />
        {query && (
          <button onClick={handleClear} className="text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {suggestions.map((loc, index) => (
            <button
              key={`${loc.name}-${index}`}
              onClick={() => handleSelect(loc)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-border/50 transition-colors text-left"
            >
              <span className="text-xl">
                {LOCATION_ICONS[loc.type] || '📍'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate">{loc.name}</p>
                <p className="text-xs text-muted">
                  {loc.taluk}, {loc.district}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isFocused && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 p-4 text-center">
          <Search className="w-6 h-6 text-muted mx-auto mb-2" />
          <p className="text-muted text-sm">No locations found</p>
          <p className="text-xs text-muted mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
