// withBase：把站內乾淨路徑（如 "/about"、"/portrait.png"）補上 GitHub Pages project-pages
// 的 base 前綴（import.meta.env.BASE_URL，見 astro.config.mjs 的 `base`）。
// 外部絕對網址（http(s):// 開頭）與 mailto: 一律原樣返回，不做任何處理。
// src/data/*.json 內的站內路徑必須保持乾淨、不寫死 base——一律透過這個函式在渲染端補上前綴。
export function withBase(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("mailto:") || path === "") {
    return path;
  }
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
