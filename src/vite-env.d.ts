/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** If set (production), `/create/qa-posters` requires this passphrase once per browser session. */
  readonly VITE_POSTER_QA_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
