export const DATA_REFRESH_EVENT = "medmax:data-changed";

export function notifyDataChanged(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DATA_REFRESH_EVENT, {
      detail: {
        timestamp: Date.now(),
        ...detail
      }
    })
  );
}
