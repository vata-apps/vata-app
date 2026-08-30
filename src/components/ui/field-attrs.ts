/**
 * Attributes that keep browser autofill and password-manager overlays
 * (1Password, LastPass, Bitwarden, Dashlane) off a field.
 *
 * Vata's forms hold names, dates, places and notes — never credentials — so no
 * field should attract a "save / fill password" prompt. Spread onto the native
 * `<input>` / `<textarea>` before the caller's own props, so an explicit
 * `autoComplete` can still override it on the rare field that wants one.
 */
export const noAutofillProps = {
  autoComplete: 'off',
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const;
