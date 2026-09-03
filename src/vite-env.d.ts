/// <reference types="vite/client" />

declare module '*.css'

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_BASE_PATH?: string
  readonly VITE_CONTENT_SOURCE?: 'api' | 'markdown'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
