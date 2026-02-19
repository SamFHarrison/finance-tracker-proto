/**
 * Escape a string so it can be safely embedded in a RegExp pattern.
 *
 * @internal
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
