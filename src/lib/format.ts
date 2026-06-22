export function formatDuration(seconds?: number | null) {
  if (!seconds) return "--";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function formatNumber(value?: number | null, digits = 0) {
  if (value === undefined || value === null || Number.isNaN(value)) return "--";
  return value.toFixed(digits);
}

export function tagValues(tags: { field: string; value: string }[], field: string) {
  return tags.filter((tag) => tag.field === field).map((tag) => tag.value);
}
