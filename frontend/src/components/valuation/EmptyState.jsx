// components/valuation/EmptyState.jsx
import { Scale } from "lucide-react";

function EmptyState() {
  return (
    <div className="bg-white border border-dashed border-[#D8D1BE] rounded-2xl py-20 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-[#F2EEE4] flex items-center justify-center mb-5">
        <Scale size={22} className="text-[#9AA2B5]" />
      </div>
      <h3 className="text-[17px] font-semibold text-[#1B2338]">No property selected</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Select a property above to compare its asking price against its
        estimated market value.
      </p>
    </div>
  );
}

export default EmptyState;
