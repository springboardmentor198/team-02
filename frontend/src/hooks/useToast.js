// hooks/useToast.js
//
// Small, dependency-free toast stack (the app doesn't have react-toastify
// or similar installed, so this keeps the same footprint as the rest of the
// project). Same useCallback/useState shape as useNotifications.js.
import { useCallback, useRef, useState } from "react";

const AUTO_DISMISS_MS = 3500;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast]
  );

  return { toasts, showToast, dismissToast };
}
