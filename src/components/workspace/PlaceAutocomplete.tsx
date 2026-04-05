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

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const places = await searchPlaces(q);
    setResults(places.slice(0, 8).map((p) => ({ id: p.id, name: p.name })));
    setShowDropdown(true);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
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

  if (value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem' }}>{value.name}</span>
        <span
          onClick={() => onChange(null)}
          style={{ fontSize: '0.7rem', color: '#c00', cursor: 'pointer' }}
        >
          {'\u2715'}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search or type place..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        style={{
          width: '100%',
          padding: '0.3rem 0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '0.8rem',
          boxSizing: 'border-box',
        }}
      />
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10,
            maxHeight: '150px',
            overflow: 'auto',
          }}
        >
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                onChange({ type: 'existing', id: r.id, name: r.name });
                setQuery('');
                setShowDropdown(false);
              }}
              style={{
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              {r.name}
            </div>
          ))}
          {query.trim() && (
            <div
              onClick={() => {
                onChange({ type: 'new', name: query.trim() });
                setQuery('');
                setShowDropdown(false);
              }}
              style={{
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#4a90d9',
                fontWeight: 500,
              }}
            >
              Create &quot;{query.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
