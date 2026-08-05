// components/comparable/NoComparablesFound.jsx
import { SearchX } from "lucide-react";

function NoComparablesFound() {
  return (
    <div className="bg-white border border-dashed border-[#D8D1BE] rounded-2xl py-16 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-[#F2EEE4] flex items-center justify-center mb-5">
        <SearchX size={22} className="text-[#9AA2B5]" />
      </div>
      <h3 className="text-[17px] font-semibold text-[#1B2338]">No comparable properties found</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        We couldn't find any similar properties nearby to compare this one
        against yet.
      </p>
    </div>
  );
}

export default NoComparablesFound;
