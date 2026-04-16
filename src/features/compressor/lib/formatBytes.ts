// ═══════════════════════════════════════════════════
// formatBytes — human-readable byte sizes
// ═══════════════════════════════════════════════════

const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const formatted = exponent === 0 ? value.toFixed(0) : value.toFixed(fractionDigits);
  return `${formatted} ${UNITS[exponent]}`;
}

export function formatPercent(ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  return `${Math.round(clamped * 100)}%`;
}
