import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, ArrowRight, Languages, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../App";

const copy = {
  en: {
    title: "Welcome back", subtitle: "Sign in to continue your study journey.",
    email: "Email address", emailHint: "Enter your email", password: "Password",
    passwordHint: "Enter your password", submit: "Sign in", noAccount: "Don't have an account?",
    create: "Create account", home: "Back to home", switch: "العربية",
    brand: "SMART STUDY PLATFORM", secure: "Your personal space for smarter learning.",
  },
  ar: {
    title: "أهلًا بعودتك", subtitle: "سجّلي الدخول لمتابعة رحلتك الدراسية.",
    email: "البريد الإلكتروني", emailHint: "اكتبي بريدك الإلكتروني", password: "كلمة المرور",
    passwordHint: "اكتبي كلمة المرور", submit: "تسجيل الدخول", noAccount: "ليس لديكِ حساب؟",
    create: "إنشاء حساب", home: "العودة للرئيسية", switch: "English",
    brand: "منصة الدراسة الذكية", secure: "مساحتك الشخصية لتعلّم أكثر ذكاءً.",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    const result = login(email, password);
    if (result.success) navigate("/dashboard");
    else setError(result.message || (language === "ar" ? "تعذر تسجيل الدخول. راجعي البيانات وحاولي مرة أخرى." : "Unable to sign in. Check your details and try again."));
  };

  return (
    <main className="entry-page" dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <button className="entry-language" type="button" onClick={toggleLanguage} aria-label={t.switch}>
        <Languages size={17} /> {t.switch}
      </button>
      <div className="entry-orb entry-orb-one" /><div className="entry-orb entry-orb-two" />
      <section className="entry-card">
        <Link to="/" className="entry-brand"><span className="entry-brand-icon"><Brain size={25} /></span><span>StudyFlow<small>{t.brand}</small></span></Link>
        <div className="entry-heading-icon"><Sparkles size={25} /></div>
        <h1>{t.title}</h1>
        <p className="entry-subtitle">{t.subtitle}</p>
        {error && <div className="entry-error" role="alert">{error}</div>}
        <form className="entry-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">{t.email}</label>
          <div className="entry-input-wrap"><Mail size={18} /><input id="login-email" type="email" autoComplete="email" placeholder={t.emailHint} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <label htmlFor="login-password">{t.password}</label>
          <div className="entry-input-wrap"><Lock size={18} /><input id="login-password" type="password" autoComplete="current-password" placeholder={t.passwordHint} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button className="entry-submit" type="submit">{t.submit}<ArrowRight size={18} /></button>
        </form>
        <p className="entry-switch">{t.noAccount} <Link to="/register">{t.create}</Link></p>
        <Link to="/" className="entry-home">← {t.home}</Link>
        <p className="entry-footnote">{t.secure}</p>
      </section>
    </main>
  );
}
