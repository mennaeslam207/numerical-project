import React from "react";
import { BrainCircuit } from "lucide-react";

const Loader = ({
  text = "Loading...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-5
        ${fullScreen ? "min-h-screen bg-[#0B0914]" : "py-12"}
      `}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />

        <BrainCircuit
          size={26}
          className="absolute text-purple-400"
        />
      </div>

      <div className="text-center">
        <h3 className="text-white font-semibold text-sm">
          {text}
        </h3>

        <p className="text-gray-500 text-xs mt-2">
          Smart Study Planner
        </p>
      </div>
    </div>
  );
};

export default Loader;