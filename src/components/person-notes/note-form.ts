import type { Note, UpdateNoteInput } from '$types/database';

/** The editable shape of a note record — everything but its fixed target. */
export interface NoteForm {
  text: string;
  isPrivate: boolean;
}

export function toNoteForm(note: Note): NoteForm {
  return { text: note.text, isPrivate: note.isPrivate };
}

/** A blank record — private by default, matching the mockup: a note is opt-out of GEDCOM export, not opt-in. */
export function emptyNoteForm(): NoteForm {
  return { text: '', isPrivate: true };
}

export function isNoteFormComplete(form: NoteForm): boolean {
  return form.text.trim() !== '';
}

export function toNotePayload(form: NoteForm): Required<UpdateNoteInput> {
  return { text: form.text.trim(), isPrivate: form.isPrivate };
}

/** Whether two states of the same record would persist identically. */
export function isSameNotePayload(a: NoteForm, b: NoteForm): boolean {
  return a.text.trim() === b.text.trim() && a.isPrivate === b.isPrivate;
}
