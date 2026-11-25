
import React from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FolderOpen,
  BrainCircuit,
  BarChart3,
  Settings,
  Sparkles,
  X,
  GraduationCap,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      title: "MAIN MENU",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "My Subjects",
          path: "/subjects",
          icon: BookOpen,
        },
        {
          name: "Study Planner",
          path: "/planner",
          icon: CalendarDays,
        },
      ],
    },
    {
      title: "STUDY TOOLS",
      items: [
        {
          name: "Study Vault",
          path: "/vault",
          icon: FolderOpen,
        },
        {
          name: "AI Assistant",
          path: "/ai-assistant",
          icon: BrainCircuit,
          badge: "AI",
        },
        {
          name: "Analytics",
          path: "/analytics",
          icon: BarChart3,
        },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-[260px]
          bg-[#081426]
          border-r border-blue-400/10
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-[76px] flex items-center justify-between px-6 border-b border-blue-400/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <GraduationCap size={23} className="text-white" />
            </div>

            <div>
              <h2 className="text-white font-bold text-lg">
                Smart<span className="text-sky-400">Study</span>
              </h2>
              <p className="text-blue-200/50 text-[10px] tracking-widest">
                AI STUDY PLATFORM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {menuItems.map((group) => (
            <div key={group.title} className="mb-8">
              <p className="text-blue-200/40 text-[10px] font-bold tracking-widest px-3 mb-4">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center justify-between
                        px-3 py-3 rounded-xl
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600/30 to-sky-500/10 text-sky-300 border border-blue-400/20 shadow-lg shadow-blue-950/20"
                            : "text-gray-400 hover:bg-blue-500/10 hover:text-white"
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon size={19} />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>

                          {item.badge && (
                            <span className="text-[9px] px-2 py-1 rounded-md bg-blue-500/20 text-sky-300 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-400/10">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl
              ${
                isActive
                  ? "text-sky-300 bg-blue-500/10"
                  : "text-gray-400 hover:text-white hover:bg-blue-500/10"
              }
            `}
          >
            <Settings size={19} />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-[#101F38] border border-blue-400/10">
            <Sparkles size={20} className="text-sky-400 mb-2" />

            <p className="text-white text-xs font-semibold">
              Study Smarter!
            </p>

            <p className="text-blue-100/50 text-[10px] mt-1">
              Let AI help you achieve your goals.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
