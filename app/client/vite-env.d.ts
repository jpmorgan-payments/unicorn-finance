/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_ID?: string;
  readonly VITE_PROGRAM_ID?: string;
  readonly VITE_PROGRAM_ID_TYPE?: string;
  readonly VITE_MOCKED_API_URL?: string;
  readonly VITE_CAT_API_URL?: string;
  readonly VITE_JPMC_MOCK_API_URL?: string;
  // "true" unlocks the JPMC Sandbox / JPMC CAT tiers in the env switcher.
  readonly VITE_ENABLE_JPMC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
