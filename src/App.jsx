
import React, { createContext, useContext, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  Brain,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Library,
  Bot,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Sparkles,
  Languages,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import StudyPlanner from "./pages/StudyPlanner";
import StudyVault from "./pages/StudyVault";
import AIAssistant from "./pages/AIAssistant";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/Settings";

import AiStudyHub from "./pages/pages/AiStudyHub";

// LANGUAGE CONTEXT
const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
};

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "en";
  });

  const toggleLanguage = () => {
    setLanguage((current) => {
      const next = current === "en" ? "ar" : "en";
      localStorage.setItem("appLanguage", next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// TRANSLATIONS
const translations = {
  en: {
    dashboard: "Dashboard",
    subjects: "My Subjects",
    planner: "Study Planner",
    vault: "Study Vault",
    assistant: "AI Assistant",
    analytics: "Analytics",
    settings: "Settings",
    mainMenu: "MAIN MENU",
    keepGoing: "Keep Going!",
    tip: "Small study steps lead to big achievements.",
    logout: "Logout",
    studentAccount: "Student Account",
    welcome: "Welcome back",
    platform: "SMART STUDY PLATFORM",
    switchLanguage: "Switch to Arabic",
  },

  ar: {
    dashboard: "لوحة التحكم",
    subjects: "موادي الدراسية",
    planner: "مخطط المذاكرة",
    vault: "المكتبة الدراسية",
    assistant: "المساعد الذكي",
    analytics: "تحليل الأداء",
    settings: "الإعدادات",
    mainMenu: "القائمة الرئيسية",
    keepGoing: "استمري في التقدم!",
    tip: "خطوات المذاكرة الصغيرة تصنع إنجازات كبيرة.",
    logout: "تسجيل الخروج",
    studentAccount: "حساب الطالبة",
    welcome: "مرحبًا بعودتك",
    platform: "منصة الدراسة الذكية",
    switchLanguage: "التبديل إلى الإنجليزية",
  },
};

// SIDEBAR NAVIGATION
const navigation = [
  { name: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "subjects", path: "/subjects", icon: BookOpen },
  { name: "planner", path: "/planner", icon: CalendarDays },
  { name: "vault", path: "/vault", icon: Library },
  { name: "assistant", path: "/ai-assistant", icon: Bot },
  { name: "analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "settings", path: "/settings", icon: Settings },
];

// PROTECTED ROUTE
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// MAIN LAYOUT
function AppLayout() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const location = useLocation();
  const t = translations[language];
  const isArabic = language === "ar";

  const currentPage =
    navigation.find((item) => item.path === location.pathname)?.name ||
    "dashboard";

  const firstName = user?.name?.split(" ")[0] || "Student";

  const handleLogout = () => {
    logout();
  };

  const formattedDate = new Date().toLocaleDateString(
    isArabic ? "ar-EG" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div
      className="app-layout"
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Brain size={25} />
          </div>

          <div>
            <h2>StudyFlow</h2>
            <span>{t.platform}</span>
          </div>
        </div>

        {/* USER INFORMATION */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {(user?.name || "S").charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{user?.name || "Student"}</strong>
            <span>{t.studentAccount}</span>
          </div>

          <Sparkles size={16} className="user-sparkle" />
        </div>

        <div className="sidebar-section-title">
          {t.mainMenu}
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <Icon size={19} />
                <span>{t[item.name]}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Sparkles size={20} />
            <h4>{t.keepGoing}</h4>
            <p>{t.tip}</p>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="topbar-heading">
            <span className="topbar-welcome">
              STUDYFLOW / {t[currentPage].toUpperCase()}
            </span>

            <h1>
              {t.welcome},{" "}
              {firstName}
            </h1>
          </div>

          <div className="topbar-actions">
            {/* LANGUAGE SWITCH */}
            <button
              type="button"
              className="language-button"
              onClick={toggleLanguage}
              title={t.switchLanguage}
              aria-label={t.switchLanguage}
            >
              <Languages size={18} />
              <span>{isArabic ? "English" : "العربية"}</span>
            </button>

            {/* DATE */}
            <div className="topbar-date">
              <CalendarDays size={17} />
              <span>{formattedDate}</span>
            </div>

            {/* USER AVATAR */}
            <div
              className="topbar-avatar"
              title={user?.name || "Student"}
              aria-label={user?.name || "Student"}
            >
              {(user?.name || "S").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// MAIN APP
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC PAGES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED PAGES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/planner" element={<StudyPlanner />} />
              <Route path="/vault" element={<StudyVault />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* OLD AI ROUTE */}
          <Route
            path="/assistant"
            element={<Navigate to="/ai-assistant" replace />}
          />

          {/* AI HUB */}
          <Route path="/ai-hub" element={<AiStudyHub />} />

          {/* UNKNOWN ROUTES */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
