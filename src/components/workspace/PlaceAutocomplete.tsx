import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchPlaces } from '$db-tree/places';

export interface PlaceValue {
  type: 'existing' | 'new';
  id?: string;
  name: string;
}

interface PlaceAutocompleteProps {
  value?: PlaceValue | null;
  onChange: (value: PlaceValue | null) => void;
}

export function PlaceAutocomplete({ value, onChange }: PlaceAutocompleteProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestSeqRef = useRef(0);

  const doSearch = useCallback(async (q: string) => {
    const requestId = ++requestSeqRef.current;
    if (q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const places = await searchPlaces(q);
      if (requestId === requestSeqRef.current) {
        setResults(places.slice(0, 8).map((p) => ({ id: p.id, name: p.name })));
        setShowDropdown(true);
      }
    } catch {
      if (requestId === requestSeqRef.current) {
        setResults([]);
      }
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void doSearch(val);
    }, 300);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs">{value.name}</span>
        <button
          type="button"
          aria-label="Clear place"
          onClick={() => onChange(null)}
          className="cursor-pointer border-none bg-transparent p-0 text-[11px] text-destructive"
        >
          {'✕'}
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Search or type place..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        className="box-border w-full rounded border border-border px-2 py-1 text-xs"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-10 max-h-[150px] overflow-auto rounded border border-border bg-popover shadow-md">
          {results.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => {
                onChange({ type: 'existing', id: r.id, name: r.name });
                setQuery('');
                setShowDropdown(false);
              }}
              className="block w-full cursor-pointer border-0 border-b border-border bg-transparent px-2.5 py-1.5 text-left text-xs"
            >
              {r.name}
            </button>
          ))}
          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                onChange({ type: 'new', name: query.trim() });
                setQuery('');
                setShowDropdown(false);
              }}
              className="block w-full cursor-pointer border-none bg-transparent px-2.5 py-1.5 text-left text-xs font-medium text-primary"
            >
              Create &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
