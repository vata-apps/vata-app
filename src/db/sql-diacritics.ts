/**
 * Common Latin accented characters mapped to their plain-ASCII base letter,
 * both cases. SQLite's built-in `COLLATE NOCASE` and `LIKE` only fold ASCII
 * case — an accented name (Côté, Bélanger, Éthier, …) sorts and matches
 * incorrectly against `COLLATE NOCASE`/`LIKE` alone, since e.g. `é` and `e`
 * are unrelated bytes to a byte-wise collation. Folding both the sort key
 * and the search pattern through {@link foldDiacritics} before comparing
 * makes `ORDER BY`/`LIKE` behave close to a locale-aware comparison for
 * every Latin-script name this app is likely to see (French, Spanish,
 * Portuguese, German), without needing a custom SQLite collation.
 */
const DIACRITIC_PAIRS: readonly [accented: string, base: string][] = [
  ['à', 'a'],
  ['á', 'a'],
  ['â', 'a'],
  ['ä', 'a'],
  ['ã', 'a'],
  ['å', 'a'],
  ['À', 'A'],
  ['Á', 'A'],
  ['Â', 'A'],
  ['Ä', 'A'],
  ['Ã', 'A'],
  ['Å', 'A'],
  ['ç', 'c'],
  ['Ç', 'C'],
  ['é', 'e'],
  ['è', 'e'],
  ['ê', 'e'],
  ['ë', 'e'],
  ['É', 'E'],
  ['È', 'E'],
  ['Ê', 'E'],
  ['Ë', 'E'],
  ['î', 'i'],
  ['ï', 'i'],
  ['ì', 'i'],
  ['í', 'i'],
  ['Î', 'I'],
  ['Ï', 'I'],
  ['Ì', 'I'],
  ['Í', 'I'],
  ['ñ', 'n'],
  ['Ñ', 'N'],
  ['ô', 'o'],
  ['ö', 'o'],
  ['ò', 'o'],
  ['ó', 'o'],
  ['õ', 'o'],
  ['Ô', 'O'],
  ['Ö', 'O'],
  ['Ò', 'O'],
  ['Ó', 'O'],
  ['Õ', 'O'],
  ['ù', 'u'],
  ['û', 'u'],
  ['ü', 'u'],
  ['ú', 'u'],
  ['Ù', 'U'],
  ['Û', 'U'],
  ['Ü', 'U'],
  ['Ú', 'U'],
  ['ý', 'y'],
  ['ÿ', 'y'],
  ['Ý', 'Y'],
  ['Ÿ', 'Y'],
  ['œ', 'oe'],
  ['Œ', 'OE'],
  ['æ', 'ae'],
  ['Æ', 'AE'],
];

/**
 * Wrap a SQL expression in a chain of `REPLACE(...)` calls that strip the
 * common Latin diacritics off it, so an `ORDER BY foldDiacritics(col)
 * COLLATE NOCASE` or `foldDiacritics(col) LIKE foldDiacritics($pattern)`
 * compares names the way a French-Canadian genealogist expects — "Côté"
 * next to "Coté"/"Cote", not shoved to the end of the alphabet. Safe to
 * apply to a `LIKE` pattern too: `REPLACE` only substitutes the literal
 * accented characters, never touching `%`/`_` wildcards or the `ESCAPE`
 * backslash.
 */
export function foldDiacritics(expr: string): string {
  return DIACRITIC_PAIRS.reduce(
    (sql, [accented, base]) => `REPLACE(${sql}, '${accented}', '${base}')`,
    expr
  );
}
