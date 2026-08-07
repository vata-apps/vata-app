import type { NameParts } from '$db-tree/names';
import type { Name, NameType, UpdateNameInput } from '$types/database';

/**
 * The editable shape of a name record. Every part is a plain string rather
 * than `string | null` so the controlled inputs never flip between controlled
 * and uncontrolled; {@link toCreateInput} maps blanks back to `null` at the DB
 * boundary.
 */
export interface NameForm {
  type: NameType;
  prefix: string;
  givenNames: string;
  surname: string;
  suffix: string;
  nickname: string;
  isPrimary: boolean;
}

export function toNameForm(name: Name): NameForm {
  return {
    type: name.type,
    prefix: name.prefix ?? '',
    givenNames: name.givenNames ?? '',
    surname: name.surname ?? '',
    suffix: name.suffix ?? '',
    nickname: name.nickname ?? '',
    isPrimary: name.isPrimary,
  };
}

/** A blank record, seeded with the most common type. */
export function emptyNameForm(): NameForm {
  return {
    type: 'birth',
    prefix: '',
    givenNames: '',
    surname: '',
    suffix: '',
    nickname: '',
    isPrimary: false,
  };
}

/**
 * A name is worth saving once it carries at least one of the two parts that
 * identify a person. Prefix, suffix and nickname alone are not enough — this
 * is the required-field rule the draft footer's create action waits on.
 */
export function isNameFormComplete(form: NameForm): boolean {
  return form.givenNames.trim() !== '' || form.surname.trim() !== '';
}

/**
 * The five name parts, trimmed, with empty ones mapped to `null` so a cleared
 * field reaches the column as `NULL` rather than `''` — and, on update, so it
 * is cleared at all (`UpdateNameInput` reads `undefined` as "leave this part
 * alone"). Shaped as {@link NameParts} so an unsaved draft can be handed
 * straight to `formatName`.
 */
export function toNameParts(form: NameForm): NameParts {
  const blankToNull = (raw: string): string | null => raw.trim() || null;

  return {
    prefix: blankToNull(form.prefix),
    givenNames: blankToNull(form.givenNames),
    surname: blankToNull(form.surname),
    suffix: blankToNull(form.suffix),
    nickname: blankToNull(form.nickname),
  };
}

/** The same parts plus the type, ready to create or update a record. */
export function toNamePayload(form: NameForm): UpdateNameInput {
  return { type: form.type, ...toNameParts(form) };
}

/** Whether two states of the same record would persist identically. */
export function isSameNamePayload(a: NameForm, b: NameForm): boolean {
  const left = toNamePayload(a);
  const right = toNamePayload(b);
  return (Object.keys(left) as (keyof typeof left)[]).every((key) => left[key] === right[key]);
}
