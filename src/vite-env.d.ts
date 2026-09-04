/// <reference types="vite/client" />

declare module '*.css'

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
