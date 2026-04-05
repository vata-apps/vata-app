import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchIndividuals } from '$db-tree/individuals';
import { getPrimaryName, formatName } from '$db-tree/names';
import type { Gender } from '$/types/database';

export interface PersonSlotValue {
  type: 'existing' | 'new';
  id?: string; // for existing
  displayName: string;
  newName?: string; // for new
  newGender?: Gender; // for new
}

interface PersonSlotProps {
  label: string;
  value?: PersonSlotValue | null;
  defaultGender?: 'M' | 'F';
  required?: boolean;
  onChange: (value: PersonSlotValue | null) => void;
}

interface SearchResult {
  id: string;
  name: string;
  gender: string;
}

export function PersonSlot({
  label,
  value,
  defaultGender,
  required,
  onChange,
}: PersonSlotProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const individuals = await searchIndividuals(q);
      const top = individuals.slice(0, 8);
      const names = await Promise.all(top.map((ind) => getPrimaryName(ind.id)));
      const searchResults = top.map((ind, i) => ({
        id: ind.id,
        name: formatName(names[i]).full,
        gender: ind.gender,
      }));
      setResults(searchResults);
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  }

  function handleSelectExisting(result: SearchResult) {
    onChange({ type: 'existing', id: result.id, displayName: result.name });
    setQuery('');
    setShowDropdown(false);
  }

  function handleCreateNew() {
    onChange({
      type: 'new',
      displayName: query.trim(),
      newName: query.trim(),
      newGender: defaultGender ?? 'U',
    });
    setQuery('');
    setShowDropdown(false);
  }

  function handleClear() {
    onChange(null);
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
      <div
        style={{
          marginBottom: '0.75rem',
          padding: '0.6rem',
          border: '1px solid #c0dcc0',
          borderRadius: '6px',
          background: '#f0f8f0',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            color: '#888',
            textTransform: 'uppercase',
            marginBottom: '0.3rem',
          }}
        >
          {label}
          {required && <span style={{ color: '#c00' }}> *</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{value.displayName}</div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>
              {value.type === 'existing' ? value.id : 'will be created'}
            </div>
          </div>
          <span
            onClick={handleClear}
            style={{ fontSize: '0.7rem', color: '#c00', cursor: 'pointer' }}
          >
            {'\u2715'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        marginBottom: '0.75rem',
        padding: '0.6rem',
        border: '1px dashed #ccc',
        borderRadius: '6px',
        background: '#fff',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: '#888',
          textTransform: 'uppercase',
          marginBottom: '0.3rem',
        }}
      >
        {label}
        {required && <span style={{ color: '#c00' }}> *</span>}
      </div>
      <input
        type="text"
        placeholder="Search or type name..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        style={{
          width: '100%',
          padding: '0.35rem 0.5rem',
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
            left: '0.6rem',
            right: '0.6rem',
            top: '100%',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10,
            maxHeight: '200px',
            overflow: 'auto',
          }}
        >
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => handleSelectExisting(r)}
              style={{
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span style={{ fontWeight: 500 }}>{r.name}</span>
              <span style={{ color: '#888', marginLeft: '0.5rem' }}>
                {r.gender} — {r.id}
              </span>
            </div>
          ))}
          {query.trim() && (
            <div
              onClick={handleCreateNew}
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
          {isSearching && (
            <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#888' }}>
              Searching...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
