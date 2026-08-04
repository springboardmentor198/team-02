// components/risk/EmptyState.jsx
import { FileSearch } from "lucide-react";

function EmptyState() {
  return (
    <div className="bg-white border border-dashed border-[#D8D1BE] rounded-2xl py-20 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-[#F2EEE4] flex items-center justify-center mb-5">
        <FileSearch size={22} className="text-[#9AA2B5]" />
      </div>
      <h3 className="text-[17px] font-semibold text-[#1B2338]">No assessment yet</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Enter a Property ID above and generate an assessment to see the risk
        score, breakdown, and recommendation for that property.
      </p>
    </div>
  );
}

export default EmptyState;
