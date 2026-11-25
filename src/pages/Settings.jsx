import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudy } from "../context/StudyContext";
import { useNavigate } from "react-router-dom";
import { UserRound, BookOpen, SlidersHorizontal, ShieldAlert, LogOut } from "lucide-react";
import { useLanguage } from "../App";

function Settings() {
  const { user, logout } = useAuth();
  const { studyHours, setStudyHours } = useStudy();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const navigate = useNavigate();
  const [studyGoal, setStudyGoal] = useState(studyHours);
  const [notifications, setNotifications] = useState(true);

  const t = isArabic ? {
    title: "الإعدادات", subtitle: "إدارة حسابك وتفضيلات تجربة المذاكرة.", profile: "معلومات الحساب", student: "طالبة", noEmail: "لا يوجد بريد إلكتروني", study: "تفضيلات المذاكرة", weekly: "هدف المذاكرة الأسبوعي (بالساعات)", app: "تفضيلات التطبيق", notifications: "تفعيل الإشعارات", enabled: "مفعّلة", disabled: "متوقفة", account: "إدارة الحساب", signout: "تسجيل الخروج من الحساب الحالي.", logout: "تسجيل الخروج", confirm: "هل أنتِ متأكدة من تسجيل الخروج؟", saved: "يتم حفظ هدف المذاكرة تلقائيًا."
  } : {
    title: "Settings", subtitle: "Manage your account and study experience preferences.", profile: "Profile Information", student: "Student", noEmail: "No email available", study: "Study Preferences", weekly: "Weekly Study Goal (Hours)", app: "App Preferences", notifications: "Enable Notifications", enabled: "Enabled", disabled: "Disabled", account: "Account Management", signout: "Sign out from your current account.", logout: "Logout", confirm: "Are you sure you want to logout?", saved: "Your study goal is saved automatically."
  };

  const handleLogout = () => {
    if (window.confirm(t.confirm)) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="settings-page redesigned-settings" dir={isArabic ? "rtl" : "ltr"}>
      <div className="page-header settings-page-heading">
        <div><span className="settings-eyebrow"><SlidersHorizontal size={14} /> STUDYFLOW</span><h1>{t.title}</h1><p>{t.subtitle}</p></div>
      </div>

      <section className="settings-card settings-profile-card">
        <div className="settings-card-title"><span><UserRound size={18} /></span><h2>{t.profile}</h2></div>
        <div className="profile-info">
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || "S"}</div>
          <div><h3>{user?.name || t.student}</h3><p>{user?.email || t.noEmail}</p></div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-title"><span><BookOpen size={18} /></span><h2>{t.study}</h2></div>
        <label htmlFor="weekly-study-goal">{t.weekly}</label>
        <input id="weekly-study-goal" type="number" min="1" max="168" value={studyGoal} onChange={(event) => { const value = Number(event.target.value); setStudyGoal(value); setStudyHours(value); }} />
        <p className="settings-helper-text">{t.saved}</p>
      </section>

      <section className="settings-card">
        <div className="settings-card-title"><span><SlidersHorizontal size={18} /></span><h2>{t.app}</h2></div>
        <div className="setting-option"><span>{t.notifications}</span><label className="settings-switch"><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} /><span /></label></div>
        <p className="settings-helper-text">{notifications ? t.enabled : t.disabled}</p>
      </section>

      <section className="settings-card danger-zone">
        <div className="settings-card-title"><span><ShieldAlert size={18} /></span><h2>{t.account}</h2></div>
        <p>{t.signout}</p>
        <button type="button" onClick={handleLogout}><LogOut size={16} /> {t.logout}</button>
      </section>
    </div>
  );
}

export default Settings;
