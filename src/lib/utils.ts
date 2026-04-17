/**
 * Format a number into compact display: 100, 1K, 10K, 1M, etc.
 */
export function formatNumber(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K"
  return n.toString()
}

/**
 * Get CSS color string for a service category.
 */
export function getCategoryColor(
  cat: string,
): string {
  const colors: Record<string, string> = {
    compute: "#3b82f6", // blue
    storage: "#22c55e", // green
    ai: "#a855f7", // purple
    security: "#ef4444", // red
    integration: "#eab308", // yellow
  }
  return colors[cat] ?? "#9ea3b5"
}

/**
 * Tailwind-friendly category color class name (for text color).
 */
export function getCategoryColorClass(cat: string): string {
  const classes: Record<string, string> = {
    compute: "text-blue-500",
    storage: "text-green-500",
    ai: "text-purple-500",
    security: "text-red-500",
    integration: "text-yellow-500",
  }
  return classes[cat] ?? "text-gray-400"
}
