/**
 * Escape a string so it can be safely embedded in a RegExp pattern.
 *
 * @internal
 */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
