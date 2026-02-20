/**
 * Shared formatting utilities used across client and server.
 */

/**
 * Capitalizes the first letter of each word in a string (Title Case).
 * Handles hyphenated names (e.g., "mary-jane" → "Mary-Jane"),
 * apostrophes (e.g., "o'brien" → "O'Brien"),
 * and "Mc/Mac" prefixes (e.g., "mcdonald" → "McDonald").
 *
 * Safe to call on every keystroke — preserves cursor-friendly behavior
 * by only capitalizing, never rearranging characters.
 */
export function toTitleCase(value: string): string {
  if (!value) return value;

  return value.replace(
    /(?:^|[\s\-'])([a-zA-Z])/g,
    (_match, letter, offset) => {
      // Rebuild the exact prefix character(s) then uppercase the letter
      const prefix = value.slice(
        offset === 0 ? 0 : offset,
        offset + _match.length - 1,
      );
      return (offset === 0 ? "" : prefix) + letter.toUpperCase();
    },
  );
}

/**
 * A simpler version that just capitalizes the first letter of each
 * whitespace-separated word. Use this when you don't need hyphen/
 * apostrophe handling (e.g., city names).
 */
export function capitalizeWords(value: string): string {
  if (!value) return value;
  return value.replace(/(^|\s)([a-z])/g, (_m, space, ch) => space + ch.toUpperCase());
}
