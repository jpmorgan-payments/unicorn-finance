import { useEffect, useRef, useState } from "react";
import { useEnv } from "../context/EnvContext";
import { useRequestPreview } from "../context/RequestPreviewContext";

/**
 * Shared, environment-scoped API-call history used by the feature pages
 * (Payments, Validations, FX, Transactions). Persists to localStorage under a
 * per-environment key, exposes the row data for UnicornTable, and re-opens the
 * request/response drawer on row click.
 *
 * Every history entry must carry the request/response payloads so a row can be
 * replayed into the preview drawer; `toRow` maps an entry to its table columns.
 */
interface ApiHistoryEntry {
  requestData: unknown;
  responseData: unknown;
}

function loadHistory<T>(baseKey: string, environment: string): T[] {
  try {
    const stored = localStorage.getItem(`${baseKey}-${environment}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(`Error loading ${baseKey} from localStorage:`, error);
    return [];
  }
}

export function useApiHistory<T extends ApiHistoryEntry>(
  baseKey: string,
  toRow: (item: T) => string[],
) {
  const { environment } = useEnv();
  const { openDrawer } = useRequestPreview();

  const storageKey = `${baseKey}-${environment}`;

  // Load synchronously on mount (rather than in an effect) so there is no
  // render where `history` is still [] - that render previously let the save
  // effect below fire with the pre-load value and briefly overwrite the
  // just-read data.
  const [history, setHistory] = useState<T[]>(() =>
    loadHistory<T>(baseKey, environment),
  );

  // Skip the save effect run that immediately follows a load (mount or an
  // environment switch): that `history` value was just read from storage, so
  // writing it straight back is a no-op at best and, previously, a same-tick
  // race at worst.
  const skipNextSaveRef = useRef(true);

  const previousEnvironmentRef = useRef(environment);
  useEffect(() => {
    if (previousEnvironmentRef.current === environment) return;
    previousEnvironmentRef.current = environment;
    skipNextSaveRef.current = true;
    setHistory(loadHistory<T>(baseKey, environment));
  }, [environment, baseKey]);

  // Save whenever the history itself changes (not on environment switch, so an
  // environment change never clobbers the newly-loaded key with stale data).
  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error(`Error saving ${baseKey} to localStorage:`, error);
    }
  }, [history, storageKey, baseKey]);

  const addEntry = (item: T) => setHistory((prev) => [item, ...prev]);

  // The save effect above persists the cleared list, so there is no separate
  // removeItem here - it would be undone on the very next render.
  const clearHistory = () => setHistory([]);

  const handleRowClick = (rowIndex: number) => {
    const selected = history[rowIndex];
    if (selected) {
      openDrawer(selected.requestData as any, selected.responseData as any);
    }
  };

  const tableData = history.map(toRow);

  return { history, addEntry, clearHistory, handleRowClick, tableData };
}
