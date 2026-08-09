// components/Toast.jsx
//
// Generic, page-agnostic toast stack (used by AuditHistory.jsx for
// refresh/export/download feedback). Same color tokens as the rest of the
// app: sage (#4D7B73) for success, terracotta (#B45B46) for error, navy
// (#1B2338) for info — matching StatusBadge / ErrorState / StatCard accents.
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const STYLES = {
  success: { bg: "bg-[#4D7B73]", icon: CheckCircle2 },
  error: { bg: "bg-[#B45B46]", icon: XCircle },
  info: { bg: "bg-[#1B2338]", icon: Info },
};

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[min(360px,calc(100vw-2rem))]">
      {toasts.map((t) => {
        const cfg = STYLES[t.type] || STYLES.info;
        const Icon = cfg.icon;
        return (
          <div
            key={t.id}
            className={`${cfg.bg} text-white rounded-xl shadow-[0_10px_30px_-10px_rgba(27,35,56,0.45)] px-4 py-3 flex items-start gap-3`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm flex-1 leading-5">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/70 hover:text-white shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastStack;
