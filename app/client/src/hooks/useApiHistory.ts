import { useEffect, useState } from "react";
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

export function useApiHistory<T extends ApiHistoryEntry>(
  baseKey: string,
  toRow: (item: T) => string[],
) {
  const { environment } = useEnv();
  const { openDrawer } = useRequestPreview();

  const storageKey = `${baseKey}-${environment}`;

  const [history, setHistory] = useState<T[]>([]);

  // Load when the environment changes (each environment has its own history).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setHistory(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error(`Error loading ${baseKey} from localStorage:`, error);
      setHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  // Save whenever the history itself changes (not on environment switch, so an
  // environment change never clobbers the newly-loaded key with stale data).
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error(`Error saving ${baseKey} to localStorage:`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const addEntry = (item: T) => setHistory((prev) => [item, ...prev]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  };

  const handleRowClick = (rowIndex: number) => {
    const selected = history[rowIndex];
    if (selected) {
      openDrawer(selected.requestData as any, selected.responseData as any);
    }
  };

  const tableData = history.map(toRow);

  return { history, addEntry, clearHistory, handleRowClick, tableData };
}
