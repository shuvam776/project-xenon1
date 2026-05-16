/**
 * Formats seconds into a human-readable duration string.
 * Examples: "2h 15m", "45m", "30s", "0s"
 */
export function formatTimeOnSite(totalSeconds: number | undefined | null): string {
  if (!totalSeconds || totalSeconds <= 0) return "0s";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
