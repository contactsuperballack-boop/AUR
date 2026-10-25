/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public origin of the API that receives enquiries/newsletter sign-ups (no trailing slash). */
  readonly VITE_API_URL?: string;
  /** Production site origin, used for canonical URLs, sitemap and structured data. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
