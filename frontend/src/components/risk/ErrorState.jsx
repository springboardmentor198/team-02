// components/risk/ErrorState.jsx
import { AlertCircle, RefreshCw } from "lucide-react";

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-[#FBEDE9] border border-[#EFD3CB] rounded-2xl p-8 flex flex-col items-center text-center">
      <AlertCircle size={22} className="text-[#B3402F] mb-3" />
      <p className="text-sm font-semibold text-[#B3402F]">
        {message || "Something went wrong generating this assessment."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 mt-5 h-10 px-5 rounded-full bg-white border border-[#EFD3CB] text-[#B3402F] text-sm font-medium hover:bg-[#FBEDE9] transition-colors"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
