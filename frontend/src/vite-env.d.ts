/// <reference types="vite/client" />

interface Window {
  ethereum?: any;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
