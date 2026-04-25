/** OMDb often returns "N/A"; some CDNs block hotlinking without a referrer policy on <img>. */
const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <rect fill="#1a1d24" width="600" height="900"/>
      <text x="50%" y="48%" fill="#8b96a8" font-family="system-ui,sans-serif" font-size="28" text-anchor="middle">No poster</text>
    </svg>`
  );

export function normalizePosterUrl(url) {
  if (url == null || typeof url !== 'string') return null;
  const t = url.trim();
  if (!t || /^n\/?a$/i.test(t)) return null;
  // Backend may return relative API paths (serve from Spring Boot)
  if (t.startsWith('/api/')) return `http://localhost:8080${t}`;
  // Prefer HTTPS to avoid mixed-content blocking on HTTPS deployments
  return t.startsWith('http://') ? `https://${t.slice(7)}` : t;
}

export function posterSrcOrPlaceholder(url) {
  return normalizePosterUrl(url) ?? PLACEHOLDER;
}

export { PLACEHOLDER as POSTER_PLACEHOLDER };
