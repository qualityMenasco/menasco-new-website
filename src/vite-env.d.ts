/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key — identifies the destination form config; public by design (not an SMTP credential), safe to expose to the client per Web3Forms' own architecture. */
  readonly VITE_WEB3FORMS_ACCESS_KEY: string;
  /** Public Newsroom API base URL (e.g. the deployed API Gateway invoke URL) — public configuration, not a secret. Optional: left unset, requests stay relative (same-origin). See src/lib/newsroomApiConfig.ts. */
  readonly VITE_NEWSROOM_API_BASE_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
