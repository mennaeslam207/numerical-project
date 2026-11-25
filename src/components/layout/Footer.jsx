import React from "react";
import { Heart, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/5 py-5 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Smart Study Planner. All rights reserved.
        </p>

        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <span>Designed with</span>
          <Heart size={13} className="text-purple-400 fill-purple-400" />
          <span>for smarter learning</span>
          <Sparkles size={14} className="text-purple-400" />
        </div>

      </div>
    </footer>
  );
};

export default Footer;