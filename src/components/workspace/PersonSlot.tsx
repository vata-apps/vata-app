import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('workspace');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestSeqRef = useRef(0);

  const doSearch = useCallback(async (q: string) => {
    const requestId = ++requestSeqRef.current;
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
      if (requestId === requestSeqRef.current) {
        setResults(searchResults);
        setShowDropdown(true);
      }
    } catch {
      if (requestId === requestSeqRef.current) {
        setResults([]);
      }
    } finally {
      if (requestId === requestSeqRef.current) {
        setIsSearching(false);
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
      <div className="mb-3 rounded-md border border-primary/30 bg-primary/5 p-2.5">
        <div className="mb-1 text-[11px] uppercase text-muted-foreground">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{value.displayName}</div>
            <div className="text-[11px] text-muted-foreground">
              {value.type === 'existing' ? value.id : 'will be created'}
            </div>
          </div>
          <button
            type="button"
            aria-label={t('personSlot.clear')}
            onClick={handleClear}
            className="cursor-pointer border-none bg-transparent p-0 text-[11px] text-destructive"
          >
            {'✕'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-3 rounded-md border border-dashed border-border bg-card p-2.5"
    >
      <div className="mb-1 text-[11px] uppercase text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </div>
      <input
        type="text"
        placeholder="Search or type name..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        className="box-border w-full rounded border border-border px-2 py-1 text-xs"
      />
      {showDropdown && (
        <div className="absolute left-2.5 right-2.5 top-full z-10 max-h-[200px] overflow-auto rounded border border-border bg-popover shadow-md">
          {results.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => handleSelectExisting(r)}
              className="block w-full cursor-pointer border-0 border-b border-border bg-transparent px-2.5 py-1.5 text-left text-xs"
            >
              <span className="font-medium">{r.name}</span>
              <span className="ml-2 text-muted-foreground">
                {r.gender} — {r.id}
              </span>
            </button>
          ))}
          {query.trim() && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="block w-full cursor-pointer border-none bg-transparent px-2.5 py-1.5 text-left text-xs font-medium text-primary"
            >
              Create &quot;{query.trim()}&quot;
            </button>
          )}
          {isSearching && (
            <div className="px-2.5 py-1.5 text-xs text-muted-foreground">Searching...</div>
          )}
        </div>
      )}
    </div>
  );
}
