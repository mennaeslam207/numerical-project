import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, User, Mail, Lock, UserPlus, ArrowRight, Languages, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../App";

const copy = {
  en: {
    title: "Create your account", subtitle: "Build better study habits with StudyFlow.", name: "Full name", nameHint: "Enter your full name",
    email: "Email address", emailHint: "Enter your email", password: "Password", passwordHint: "Create a password",
    confirm: "Confirm password", confirmHint: "Re-enter your password", submit: "Create account", have: "Already have an account?",
    login: "Sign in", home: "Back to home", switch: "العربية", brand: "SMART STUDY PLATFORM", foot: "Your journey to smarter learning starts here.",
    short: "Password must contain at least 6 characters.", mismatch: "Passwords do not match.",
  },
  ar: {
    title: "أنشئي حسابك", subtitle: "ابدئي بتنظيم مذاكرتك مع StudyFlow.", name: "الاسم بالكامل", nameHint: "اكتبي اسمك بالكامل",
    email: "البريد الإلكتروني", emailHint: "اكتبي بريدك الإلكتروني", password: "كلمة المرور", passwordHint: "أنشئي كلمة مرور",
    confirm: "تأكيد كلمة المرور", confirmHint: "أعيدي كتابة كلمة المرور", submit: "إنشاء الحساب", have: "لديكِ حساب بالفعل؟",
    login: "تسجيل الدخول", home: "العودة للرئيسية", switch: "English", brand: "منصة الدراسة الذكية", foot: "رحلتك نحو مذاكرة أكثر ذكاءً تبدأ من هنا.",
    short: "يجب ألا تقل كلمة المرور عن 6 أحرف.", mismatch: "كلمتا المرور غير متطابقتين.",
  },
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault(); setError("");
    if (password.length < 6) { setError(t.short); return; }
    if (password !== confirmPassword) { setError(t.mismatch); return; }
    const result = register(name, email, password);
    if (result.success) navigate("/dashboard");
    else setError(result.message || (language === "ar" ? "تعذر إنشاء الحساب. حاولي مرة أخرى." : "Unable to create your account. Please try again."));
  };

  return (
    <main className="entry-page" dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <button className="entry-language" type="button" onClick={toggleLanguage} aria-label={t.switch}><Languages size={17} /> {t.switch}</button>
      <div className="entry-orb entry-orb-one" /><div className="entry-orb entry-orb-two" />
      <section className="entry-card entry-card-register">
        <Link to="/" className="entry-brand"><span className="entry-brand-icon"><Brain size={25} /></span><span>StudyFlow<small>{t.brand}</small></span></Link>
        <div className="entry-heading-icon"><UserPlus size={25} /></div>
        <h1>{t.title}</h1><p className="entry-subtitle">{t.subtitle}</p>
        {error && <div className="entry-error" role="alert">{error}</div>}
        <form className="entry-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">{t.name}</label>
          <div className="entry-input-wrap"><User size={18} /><input id="register-name" type="text" autoComplete="name" placeholder={t.nameHint} value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <label htmlFor="register-email">{t.email}</label>
          <div className="entry-input-wrap"><Mail size={18} /><input id="register-email" type="email" autoComplete="email" placeholder={t.emailHint} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <label htmlFor="register-password">{t.password}</label>
          <div className="entry-input-wrap"><Lock size={18} /><input id="register-password" type="password" autoComplete="new-password" placeholder={t.passwordHint} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /></div>
          <label htmlFor="register-confirm">{t.confirm}</label>
          <div className="entry-input-wrap"><Lock size={18} /><input id="register-confirm" type="password" autoComplete="new-password" placeholder={t.confirmHint} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          <button className="entry-submit" type="submit">{t.submit}<ArrowRight size={18} /></button>
        </form>
        <p className="entry-switch">{t.have} <Link to="/login">{t.login}</Link></p>
        <Link to="/" className="entry-home">← {t.home}</Link>
        <p className="entry-footnote">{t.foot}</p>
      </section>
    </main>
  );
}
