# Phase 3: Dates

## Objective

Integrate the in-app module `@vata-apps/gedcom-date` into Vata for complete genealogical date support: parsing, storage, and display. No separate package to install; the module lives in `src/gedcom-date/` (see [ADR-004](../../decisions/adr-004-gedcom-libraries.md)).

## Prerequisites

- MVP2 (GEDCOM) completed
- In-app module `src/gedcom-date/` implemented and path alias `@vata-apps/gedcom-date` configured in `tsconfig.json`

## Step 3.1: Use gedcom-date (in-app)

The in-app module `@vata-apps/gedcom-date` provides:

| Function         | Usage in Vata                                      |
| ---------------- | -------------------------------------------------- |
| `parse`          | Convert user input to structured `GeneDate` object |
| `format`         | Display dates in short/medium/long format          |
| `toSortDate`     | Generate `date_sort` value for database            |
| `validate`       | Validate input in forms before submission          |
| `calculateAge`   | Display age at death and at events                 |
| `formatLifespan` | Compact `1845-1920` display on cards and lists     |
| `compare`        | Sort events chronologically                        |

---

## Step 3.2: Date Utility Hook

### src/hooks/useDate.ts

A thin hook that bridges `@vata-apps/gedcom-date` functions with the app's locale setting.

```typescript
import { useCallback } from 'react';
import {
  parse,
  format,
  validate,
  toSortDate,
  formatLifespan,
  calculateAge,
} from '@vata-apps/gedcom-date';
import type { GeneDate, DisplayFormat, ValidationResult, AgeResult } from '@vata-apps/gedcom-date';
import { fr } from '@vata-apps/gedcom-date/locales/fr';
import { useAppStore } from '$/store/app-store';

const locales = { fr };

export function useDate() {
  const appLocale = useAppStore((s) => s.locale);
  const locale = appLocale === 'fr' ? locales.fr : undefined; // undefined = English default

  const formatDate = useCallback(
    (date: GeneDate, fmt: DisplayFormat = 'medium') => {
      return format(date, fmt, locale);
    },
    [locale]
  );

  return {
    parse,
    format: formatDate,
    validate,
    toSortDate,
    formatLifespan,
    calculateAge,
  };
}
```

---

## Step 3.3: Manager Integration

### EventManager - Date Parsing on Create/Update

When creating or updating an event, the Manager uses `parse` + `toSortDate` to generate the `date_sort` column value.

```typescript
import { parse, toSortDate } from '@vata-apps/gedcom-date';
import { formatEntityId, parseEntityId } from '$/lib/entityId';

class EventManager {
  static async create(input: CreateEventInput): Promise<string> {
    // Generate sort date from original
    let dateSort: string | null = null;
    if (input.dateOriginal) {
      const parsed = parse(input.dateOriginal);
      dateSort = toSortDate(parsed);
    }

    const db = await getTreeDb();
    const result = await db.execute(
      `INSERT INTO events (event_type_id, date_original, date_sort, place_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        input.eventTypeId,
        input.dateOriginal,
        dateSort,
        input.placeId ? parseEntityId(input.placeId) : null,
        input.description,
      ]
    );

    return formatEntityId('E', result.lastInsertId);
  }
}
```

### IndividualManager - Age Calculation

```typescript
import { parse, calculateAge } from '@vata-apps/gedcom-date';

class IndividualManager {
  static getAgeAtDeath(
    birthDateOriginal: string | null,
    deathDateOriginal: string | null
  ): { years: number; approximate: boolean } | null {
    if (!birthDateOriginal || !deathDateOriginal) return null;

    const birth = parse(birthDateOriginal);
    const death = parse(deathDateOriginal);

    return calculateAge(birth, death);
  }
}
```

---

## Step 3.4: Date Input Component

### src/components/common/DateInput.tsx

**MVP1**: Simple HTML input with validation feedback.

```typescript
import { useState, useEffect } from 'react';
import { parse, validate, toSortDate, format } from "@vata-apps/gedcom-date";
import type { GeneDate } from "@vata-apps/gedcom-date";
import { useDate } from '$/hooks/useDate';

interface DateInputProps {
  value: string;
  onChange: (value: string, sortDate: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function DateInput({
  value,
  onChange,
  label = 'Date',
  placeholder = 'Ex: 15 JAN 1845, ABT 1850, BET 1840 AND 1845',
  required = false,
  error,
}: DateInputProps) {
  const { format: formatDate } = useDate();
  const [internalValue, setInternalValue] = useState(value);
  const [parsedDate, setParsedDate] = useState<GeneDate | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setInternalValue(value);
    if (value) {
      const result = validate(value);
      if (result.valid && result.date) {
        setParsedDate(result.date);
        setValidationError(null);
      } else {
        setParsedDate(null);
        setValidationError(result.error?.message ?? null);
      }
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);

    if (!newValue.trim()) {
      setParsedDate(null);
      setValidationError(null);
      onChange('', null);
      return;
    }

    const result = validate(newValue);
    if (result.valid && result.date) {
      setParsedDate(result.date);
      setValidationError(null);
      onChange(newValue, toSortDate(result.date));
    } else {
      setParsedDate(null);
      setValidationError(result.error?.message ?? null);
      onChange(newValue, null);
    }
  };

  const showError = touched && internalValue && validationError;

  return (
    <div>
      <label>
        {label}
        {required && <span>*</span>}
      </label>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: showError ? '1px solid red' : '1px solid #ccc',
        }}
      />
      {showError && (
        <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {validationError}
        </div>
      )}
      {parsedDate && (
        <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
          Interpreted as: {formatDate(parsedDate, 'long')}
        </div>
      )}
    </div>
  );
}
```

---

## Phase 3 Deliverables

### Files Created

```
src/gedcom-date/
├── types.ts       (type definitions)
├── parse.ts       (GEDCOM date parser)
├── format.ts      (date formatting, en/fr locales)
├── sort.ts        (sort date generation, comparison)
└── index.ts       (module exports)
```

### Final Checklist

- [x] In-app module `@vata-apps/gedcom-date` implemented and path alias configured
- [x] Date parsing works correctly (74 tests)
- [x] Date formatting works correctly (en/fr locales)
- [x] Sort date generation works
- [x] Age calculation works
- [x] Integrated in GEDCOM importer
- [ ] `useDate` hook created with locale support (deferred to Phase 4/5)
- [ ] `DateInput` component with validation and preview (deferred to Phase 5)
- [ ] EventManager uses `parse` + `toSortDate` on create/update (deferred to Phase 4)

**Status: COMPLETE** (core module done, UI integration deferred)
