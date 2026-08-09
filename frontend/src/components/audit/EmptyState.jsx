// components/audit/EmptyState.jsx
//
// Same dashed-border card as risk/EmptyState.jsx, valuation/EmptyState.jsx,
// etc. — parameterized here since one page needs it for two different
// sections (Activity Logs vs Report History) instead of two near-identical
// hardcoded files.
import { Inbox } from "lucide-react";

function EmptyState({ icon: Icon = Inbox, title, message }) {
  return (
    <div className="bg-white border border-dashed border-[#D8D1BE] rounded-2xl py-16 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-[#F2EEE4] flex items-center justify-center mb-5">
        <Icon size={22} className="text-[#9AA2B5]" />
      </div>
      <h3 className="text-[17px] font-semibold text-[#1B2338]">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">{message}</p>
    </div>
  );
}

export default EmptyState;
