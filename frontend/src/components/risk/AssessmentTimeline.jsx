// components/risk/AssessmentTimeline.jsx
import { Check } from "lucide-react";

function AssessmentTimeline({ steps }) {
  return (
    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7">
      <h3 className="text-[15px] font-semibold text-[#1B2338] mb-6">Assessment Timeline</h3>
      <div className="relative pl-2">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.label} className="relative flex gap-4 pb-7 last:pb-0">
              {!isLast && (
                <span className="absolute left-[11px] top-6 bottom-0 w-px bg-[#E3DDCE]" />
              )}
              <span
                className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
                  step.done ? "bg-[#1B2338]" : "bg-[#F2EEE4] border border-[#E3DDCE]"
                }`}
              >
                {step.done && <Check size={12} className="text-white" strokeWidth={3} />}
              </span>
              <div className="min-w-0 -mt-0.5">
                <p className={`text-sm font-semibold ${step.done ? "text-[#1B2338]" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className="text-[12.5px] text-gray-500 mt-0.5">{step.detail}</p>
                {step.timestamp && (
                  <p className="text-[11px] font-mono text-gray-400 mt-1">{step.timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AssessmentTimeline;
