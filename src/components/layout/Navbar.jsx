import React, { useState } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-[76px] bg-[#100E1B] border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">

      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <Menu size={23} />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-white font-bold">
            Smart<span className="text-purple-400">Study</span>
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center bg-[#1A1728] border border-white/5 rounded-xl px-4 py-2.5 w-72 focus-within:border-purple-500/40">
        <Search size={17} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent outline-none text-sm text-white ml-3 w-full placeholder:text-gray-600"
        />
        <span className="text-gray-600 text-xs">⌘ K</span>
      </div>

      <div className="flex items-center gap-3 md:gap-5">

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-10 h-10 rounded-xl bg-[#1A1728] flex items-center justify-center text-gray-400 hover:text-purple-400 transition"
        >
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border border-[#100E1B]" />
        </button>

        {showNotifications && (
          <div className="absolute right-20 top-16 w-72 bg-[#1A1728] border border-purple-500/20 rounded-xl p-4 shadow-xl">
            <h3 className="text-white font-semibold mb-3">
              Notifications
            </h3>
            <p className="text-gray-400 text-sm">
              You're all caught up!
            </p>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-800 flex items-center justify-center">
              <User size={21} className="text-white" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-white text-sm font-semibold">
                Student
              </p>
              <p className="text-gray-500 text-xs">
                Free Account
              </p>
            </div>

            <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-14 w-48 bg-[#1A1728] border border-white/10 rounded-xl p-2 shadow-xl">
              <button className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-purple-500/10 rounded-lg text-sm">
                <User size={16} />
                My Profile
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-purple-500/10 rounded-lg text-sm">
                <Settings size={16} />
                Settings
              </button>

              <button className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg text-sm">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;