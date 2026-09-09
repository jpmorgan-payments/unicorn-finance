// The `x-client-id` / `x-program-id` / `x-program-id-type` headers PDP expects
// on every request. `useEnvHeaders = false` returns masked values for the
// Request Preview drawer, so real credentials never render in the UI.
export const getPdpAuthHeaders = (useEnvHeaders = true) =>
  useEnvHeaders
    ? {
        "Content-Type": "application/json",
        "x-client-id": import.meta.env.VITE_CLIENT_ID,
        "x-program-id": import.meta.env.VITE_PROGRAM_ID,
        "x-program-id-type": import.meta.env.VITE_PROGRAM_ID_TYPE,
      }
    : {
        "Content-Type": "application/json",
        "x-client-id": "***",
        "x-program-id": "***",
        "x-program-id-type": "***",
      };
