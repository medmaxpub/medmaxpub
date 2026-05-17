export const DATA_REFRESH_EVENT = "medmax:data-changed";
export const DATA_REFRESH_STORAGE_KEY = "medmax:data-changed";

export function notifyDataChanged(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    timestamp: Date.now(),
    ...detail
  };

  window.dispatchEvent(
    new CustomEvent(DATA_REFRESH_EVENT, {
      detail: payload
    })
  );

  try {
    window.localStorage.setItem(DATA_REFRESH_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors so same-tab updates still continue to work.
  }
}
