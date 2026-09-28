type ClassValue = string | number | null | false | undefined | Record<string, boolean | null | undefined> | ClassValue[];

function flatten(value: ClassValue, out: string[]) {
  if (!value && value !== 0) return;
  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => flatten(item, out));
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, condition]) => {
      if (condition) out.push(key);
    });
  }
}

/** Lightweight conditional className joiner — no external dependency required. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  values.forEach((value) => flatten(value, out));
  return out.join(' ');
}
