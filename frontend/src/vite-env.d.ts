/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Basis-URL van de Rust-backend, bv. http://localhost:8080 of de Cloud Run-URL. */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
