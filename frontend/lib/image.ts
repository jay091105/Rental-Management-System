// Helpers for safely using external image URLs with `next/image`
export function isLikelyImageUrl(src?: string | null) {
  if (!src) return false;
  // reject unsplash search pages and obvious HTML endpoints
  if (src.includes('/s/photos/') || src.endsWith('/')) return false;
  // allow relative paths
  if (src.startsWith('/')) return true;
  // allow known image hosts or typical image file extensions
  try {
    const u = new URL(src);
    const host = u.hostname.replace(/^www\./, '');
    const allowedHosts = ['images.unsplash.com', 'cdn.pixabay.com', 'placehold.co', 'localhost', 'unsplash.com'];
    if (allowedHosts.includes(host)) return true;
    return /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(u.pathname);
  } catch (e) {
    return false;
  }
}

export function normalizeImageSrc(src?: string | null) {
  if (!src) return null;
  // if it's already a full absolute URL, return as-is
  if (/^https?:\/\//i.test(src)) return src;
  // if it's a root-relative path, return as-is
  if (src.startsWith('/')) return src;
  // otherwise, treat as null (avoid concatenating unknown values)
  return null;
}
