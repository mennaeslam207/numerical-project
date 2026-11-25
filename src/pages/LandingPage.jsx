import React from "react";
import { Link } from "react-router-dom";
import {
  Brain, Sparkles, ArrowRight, ArrowUpRight, BookOpen, CalendarDays,
  ChartNoAxesCombined, Bot, ShieldCheck, GraduationCap, Check,
  Target, Zap, Users, Languages, Clock3, Layers3
} from "lucide-react";
import { useLanguage } from "../App";

const content = {
  en: {
    nav: ["Home", "Features", "How it works"], login: "Sign in", signup: "Get started",
    eyebrow: "YOUR PERSONAL AI STUDY COMPANION", heroA: "Make every study", heroB: "session count.",
    heroText: "A calmer, smarter way to organize your subjects, plan your study time, keep your materials close, and understand your progress.",
    start: "Create free account", explore: "Explore features", note: "Your study space, organized around you.",
    sideTitle: "A clearer path to your goals", sideText: "Everything you need to stay focused and move forward, all in one place.",
    overview: "A complete study workspace", overviewText: "Simple tools that work together to make your academic routine easier.",
    features: [
      ["Study planning", "Arrange your study tasks and see your week at a glance."],
      ["Your study library", "Keep lecture files and personal notes organized in one place."],
      ["AI study assistant", "Ask questions and review the material you are studying."],
      ["Progress analytics", "Understand completed tasks and recorded study sessions."]
    ],
    how: "Get started in three steps", steps: ["Create your account", "Add subjects and study materials", "Plan, learn, and track your progress"],
    cta: "Ready to make studying feel more organized?", ctaText: "Create your StudyFlow space and take the next step.",
    footer: "A smarter space for your study journey.", product: "Product", account: "Your account", rights: "All rights reserved."
  },
  ar: {
    nav: ["الرئيسية", "المميزات", "طريقة الاستخدام"], login: "تسجيل الدخول", signup: "ابدئي الآن",
    eyebrow: "رفيقك الذكي في رحلتك الدراسية", heroA: "خلي كل وقت", heroB: "مذاكرة يفرق.",
    heroText: "طريقة أهدى وأذكى لتنظيم موادك، وتخطيط وقت المذاكرة، والاحتفاظ بمحاضراتك، ومتابعة تقدمك الدراسي.",
    start: "إنشاء حساب مجاني", explore: "اكتشفي المميزات", note: "مساحتك الدراسية، منظمة بالطريقة اللي تناسبك.",
    sideTitle: "طريق أوضح لأهدافك", sideText: "كل الأدوات اللي تساعدك تركزي وتكملي، موجودة في مكان واحد.",
    overview: "مساحة دراسية متكاملة", overviewText: "أدوات بسيطة بتشتغل مع بعض علشان تخلي روتينك الدراسي أسهل.",
    features: [
      ["تخطيط المذاكرة", "نظمي مهامك الدراسية وشوفي أسبوعك بشكل واضح."],
      ["مكتبتك الدراسية", "احتفظي بالمحاضرات والملحوظات في مكان واحد."],
      ["المساعد الذكي", "اسألي وراجعي المحتوى اللي بتذاكريه بمساعدة الذكاء الاصطناعي."],
      ["تحليل التقدم", "تابعي المهام المكتملة وجلسات المذاكرة المسجلة."]
    ],
    how: "ابدئي في 3 خطوات", steps: ["اعملي حسابك", "ضيفي موادك ومحاضراتك", "خططي وذاكري وتابعي تقدمك"],
    cta: "جاهزة تخلي مذاكرتك أكثر تنظيمًا؟", ctaText: "اعملي مساحتك على StudyFlow وابدئي خطوتك الجاية.",
    footer: "مساحة أذكى لرحلتك الدراسية.", product: "المنصة", account: "حسابك", rights: "جميع الحقوق محفوظة."
  }
};

const featureIcons = [CalendarDays, BookOpen, Bot, ChartNoAxesCombined];

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const ar = language === "ar";
  const t = content[language] || content.en;

  return (
    <main className="sf-landing" dir={ar ? "rtl" : "ltr"} lang={language}>
      <div className="sf-landing-glow sf-glow-a" />
      <div className="sf-landing-glow sf-glow-b" />
      <header className="sf-nav">
        <Link to="/" className="sf-logo"><span><Brain size={25} /></span><b>StudyFlow</b></Link>
        <nav className="sf-nav-links" aria-label="Main navigation">
          <a href="#sf-home">{t.nav[0]}</a><a href="#sf-features">{t.nav[1]}</a><a href="#sf-steps">{t.nav[2]}</a>
        </nav>
        <div className="sf-nav-actions">
          <button className="sf-lang" type="button" onClick={toggleLanguage}><Languages size={17}/>{ar ? "English" : "العربية"}</button>
          <Link className="sf-login-link" to="/login">{t.login}</Link>
          <Link className="sf-primary sf-nav-cta" to="/register">{t.signup}<ArrowUpRight size={17}/></Link>
        </div>
      </header>

      <section className="sf-hero" id="sf-home">
        <div className="sf-hero-copy">
          <div className="sf-eyebrow"><Sparkles size={15}/>{t.eyebrow}</div>
          <h1>{t.heroA}<span>{t.heroB}</span></h1>
          <p>{t.heroText}</p>
          <div className="sf-hero-actions"><Link className="sf-primary" to="/register">{t.start}<ArrowRight size={18}/></Link><a className="sf-secondary" href="#sf-features">{t.explore}</a></div>
          <div className="sf-hero-note"><span><Check size={15}/></span>{t.note}</div>
        </div>
        <div className="sf-hero-art" aria-label="StudyFlow study dashboard illustration">
          <div className="sf-art-orbit sf-orbit-one"/><div className="sf-art-orbit sf-orbit-two"/>
          <div className="sf-art-core"><Brain size={112} strokeWidth={1.15}/><Sparkles className="sf-art-spark" size={25}/></div>
          <div className="sf-float-card sf-float-top"><span><CalendarDays size={19}/></span><div><b>{ar ? "خطة أسبوعك" : "Your weekly plan"}</b><small>{ar ? "كل حاجة في وقتها" : "Everything in its place"}</small></div></div>
          <div className="sf-float-card sf-float-bottom"><span><Target size={19}/></span><div><b>{ar ? "تقدمك واضح" : "Progress at a glance"}</b><small>{ar ? "خطوة بخطوة" : "One step at a time"}</small></div></div>
          <div className="sf-art-caption"><Zap size={15}/>{ar ? "تعلمي بذكاء، مش بضغط" : "Learn smarter, not harder"}</div>
        </div>
      </section>

      <section className="sf-trust-strip"><span><Clock3 size={17}/>{ar ? "تنظيم وقتك" : "Time organization"}</span><i/><span><Layers3 size={17}/>{ar ? "كل موادك في مكان واحد" : "All materials in one place"}</span><i/><span><ShieldCheck size={17}/>{ar ? "مساحتك الشخصية" : "Your personal workspace"}</span></section>

      <section className="sf-section" id="sf-features">
        <div className="sf-section-heading"><span className="sf-section-kicker">STUDYFLOW</span><h2>{t.overview}</h2><p>{t.overviewText}</p></div>
        <div className="sf-feature-grid">{t.features.map((item, i) => { const Icon = featureIcons[i]; return <article className="sf-feature-card" key={item[0]}><div className="sf-feature-icon"><Icon size={23}/></div><h3>{item[0]}</h3><p>{item[1]}</p><span className="sf-feature-index">0{i + 1}</span></article>; })}</div>
      </section>

      <section className="sf-steps" id="sf-steps"><div><span className="sf-section-kicker">SIMPLE START</span><h2>{t.how}</h2></div><div className="sf-step-list">{t.steps.map((step, i) => <div className="sf-step" key={step}><span>{i + 1}</span><b>{step}</b></div>)}</div></section>

      <section className="sf-final-cta"><div><span className="sf-section-kicker">YOUR NEXT CHAPTER</span><h2>{t.cta}</h2><p>{t.ctaText}</p></div><Link className="sf-primary" to="/register">{t.start}<ArrowRight size={18}/></Link></section>

      <footer className="sf-footer"><Link to="/" className="sf-logo"><span><Brain size={22}/></span><b>StudyFlow</b></Link><p>{t.footer}</p><div><Link to="/login">{t.login}</Link><Link to="/register">{t.signup}</Link></div><small>© 2026 StudyFlow. {t.rights}</small></footer>
    </main>
  );
}
