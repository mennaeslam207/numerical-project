
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Lightbulb,
  RotateCcw,
  Send,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { useLanguage } from "../App";

const API_URL = "http://127.0.0.1:8000";

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm your Smart Study Planner AI Assistant. Ask me to explain your uploaded lectures, summarize topics, solve numerical problems, or help organize your study plan.",
};

const suggestedQuestions = [
  "Summarize my uploaded lecture",
  "Explain the most important topics",
  "Generate MCQ questions from my lecture",
  "Explain Interpolation with an example",
  "What should I study first today?",
];

function AIAssistant() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ui = isArabic ? { title: "مساعد المذاكرة الذكي", subtitle: "احصلي على شرح للدروس وإرشادات وتوصيات للمذاكرة.", connected: "متصل بالذكاء الاصطناعي", coach: "مساعد StudyFlow الذكي", powered: "يعمل بالذكاء الاصطناعي المحلي", clear: "مسح المحادثة", lecture: "المحاضرة المرتبطة:", thinking: "يفكر الآن...", tryAsk: "جرّبي السؤال", placeholder: "اسأليني عن أي شيء يخص دراستك...", send: "إرسال", capabilities: "يمكنني مساعدتك في", capabilityHint: "اكتبي سؤالك أو اختاري أحد الاقتراحات.", explain: "شرح المحاضرات", explainText: "فهم المفاهيم من المحاضرات التي رفعتِها.", practice: "إنشاء تدريبات", practiceText: "إنشاء أسئلة اختيار من متعدد وأسئلة تدريبية من محتواك.", plan: "تنظيم يومك", planText: "اقتراحات بناءً على موادك ومهامك ومواعيدك.", workload: "متابعة عبء المذاكرة", workloadText: "مراجعة تقدمك وجدولك الأسبوعي.", planNow: "خطتك الحالية", openTasks: "مهام مفتوحة", sessions: "جلسات أسبوعية متكررة مرتبطة", disclaimer: "يعمل المساعد من خلال نموذج ذكاء اصطناعي محلي عبر الخادم الخاص بالمشروع." } : { title: "AI Study Assistant", subtitle: "Get intelligent study guidance, explanations, and personalized recommendations.", connected: "AI Connected", coach: "StudyFlow AI Coach", powered: "Powered by local AI", clear: "Clear conversation", lecture: "Lecture connected:", thinking: "AI is thinking...", tryAsk: "Try asking", placeholder: "Ask me anything about your studies...", send: "Send", capabilities: "What I can help with", capabilityHint: "Ask naturally or choose a suggested prompt.", explain: "Explain lessons", explainText: "Understand concepts from your uploaded lectures.", practice: "Generate practice", practiceText: "Create MCQs and practice questions from your material.", plan: "Plan your day", planText: "Get recommendations based on your subjects, tasks, and deadlines.", workload: "Track your workload", workloadText: "Review your progress and weekly study schedule.", planNow: "YOUR PLAN RIGHT NOW", openTasks: "open tasks", sessions: "recurring weekly sessions connected", disclaimer: "Powered by a local AI model through your Smart Study Planner backend. Your requests are processed locally by Ollama." };
  const {
    subjects,
    tasks,
    schedule,
  } = useStudy();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => [isArabic ? { ...welcomeMessage, text: "أهلًا! أنا مساعد المذاكرة الذكي. اسأليني عن محاضراتك المرفوعة أو اطلبي تلخيصًا أو شرحًا أو أسئلة تدريبية." } : welcomeMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [material, setMaterial] = useState(null);

  const suggestedPrompts = isArabic ? ["لخصي المحاضرة التي رفعتها", "اشرحي أهم الموضوعات", "أنشئي أسئلة اختيار من متعدد من المحاضرة", "اشرحي الاستيفاء مع مثال", "ماذا أذاكر أولًا اليوم؟"] : suggestedQuestions;
  const messageEndRef = useRef(null);

  // Load the uploaded lecture from localStorage
  useEffect(() => {
    try {
      const savedMaterial = localStorage.getItem(
        "activeStudyMaterial"
      );

      if (savedMaterial) {
        const parsedMaterial = JSON.parse(savedMaterial);

        if (parsedMaterial?.full_text) {
          setMaterial(parsedMaterial);
        }
      }
    } catch (error) {
      console.error("Could not load study material:", error);
      setMaterial(null);
    }
  }, []);

  // Scroll to the latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const submitQuestion = async (value) => {
    const text = value.trim();

    if (!text || isLoading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
    };

    const previousMessages = messages.filter(
      (message) =>
        message.id !== "welcome" &&
        ["user", "assistant"].includes(message.role)
    );

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setIsLoading(true);

    const plannerContext = `
STUDENT'S CURRENT STUDY PLAN

Subjects:
${JSON.stringify(subjects, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}

Weekly schedule:
${JSON.stringify(schedule, null, 2)}

Use this information when answering questions about the student's study plan.
`;

    const lectureContext = material?.full_text
      ? `
UPLOADED STUDY MATERIAL

File name: ${material.file_name}

IMPORTANT INSTRUCTIONS:
- Use the uploaded lecture as the primary source when the student asks about it.
- Answer using the actual information found in the lecture.
- Do not invent information or claim that something is in the lecture if it is not.
- Explain difficult concepts step by step.
- If the answer is not available in the lecture, clearly tell the student.
- You may use general scientific knowledge to clarify a concept, but distinguish it from lecture content.

FULL LECTURE CONTENT:
${material.full_text}
`
      : `
No lecture has been uploaded or connected yet.
Answer general study questions normally.
`;

    const history = previousMessages.map((message) => ({
      role: message.role,
      content: message.text,
    }));

    try {
      const response = await fetch(
        `${API_URL}/api/assistant-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            message: `
${plannerContext}

${lectureContext}

STUDENT'S QUESTION:
${text}
`,
            history,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Server error: ${response.status}`
        );
      }

      if (!data.success || !data.reply) {
        throw new Error("The AI returned an empty response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: `Sorry, I couldn't connect to the AI assistant.

${error.message}

Please make sure the backend and Ollama are running.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitQuestion(question);
  };

  const resetConversation = () => {
    if (isLoading) return;
    setMessages([isArabic ? { ...welcomeMessage, text: "أهلًا! أنا مساعد المذاكرة الذكي. اسأليني عن محاضراتك المرفوعة أو اطلبي تلخيصًا أو شرحًا أو أسئلة تدريبية." } : welcomeMessage]);
  };

  return (
    <div className="ai-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="page-header">
        <div>
          <h1>{ui.title}</h1>
          <p>
            {ui.subtitle}
          </p>
        </div>

        <span className="assistant-status">
          <span />
          {ui.connected}
        </span>
      </div>

      <section
        className="assistant-workspace"
        aria-label={ui.title}
      >
        <div className="assistant-chat">
          <div className="chat-header">
            <span className="assistant-avatar">
              <Bot size={20} />
            </span>

            <div className="assistant-identity">
              <h2>{ui.coach}</h2>
              <p>
                <Sparkles size={12} />
                {ui.powered}
              </p>
            </div>

            <button
              type="button"
              className="assistant-reset"
              onClick={resetConversation}
              disabled={isLoading}
              aria-label={ui.clear}
              title={ui.clear}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {material?.full_text && (
            <div className="assistant-material-status">
              <BookOpen size={15} />
              <span>
                {ui.lecture} {material.file_name}
              </span>
            </div>
          )}

          <div
            className="chat-messages"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.role}`}
              >
                {message.role === "assistant" && (
                  <span className="message-avatar">
                    <Sparkles size={13} />
                  </span>
                )}

                <p>{message.text}</p>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                <span className="message-avatar">
                  <Sparkles size={13} />
                </span>
                <p>{ui.thinking}</p>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <div className="assistant-composer">
            <div className="suggested-questions">
              <span>
                <Lightbulb size={13} />
                {ui.tryAsk}
              </span>

              <div>
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isLoading}
                    onClick={() => submitQuestion(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form
              className="chat-input"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                aria-label={ui.placeholder}
                placeholder={ui.placeholder}
                value={question}
                disabled={isLoading}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
              />

              <button
                type="submit"
                disabled={!question.trim() || isLoading}
              >
                <span>{ui.send}</span>
                <Send size={15} />
              </button>
            </form>

            <p className="assistant-disclaimer">
              {ui.disclaimer}
            </p>
          </div>
        </div>

        <aside className="assistant-capabilities">
          <div className="capabilities-heading">
            <span>
              <Sparkles size={17} />
            </span>

            <div>
              <h2>{ui.capabilities}</h2>
              <p>
                {ui.capabilityHint}
              </p>
            </div>
          </div>

          <ul>
            <li>
              <strong>{ui.explain}</strong>
              <span>
                {ui.explainText}
              </span>
            </li>

            <li>
              <strong>{ui.practice}</strong>
              <span>
                {ui.practiceText}
              </span>
            </li>

            <li>
              <strong>{ui.plan}</strong>
              <span>
                {ui.planText}
              </span>
            </li>

            <li>
              <strong>{ui.workload}</strong>
              <span>
                {ui.workloadText}
              </span>
            </li>
          </ul>

          <div className="assistant-data-card">
            <span>{ui.planNow}</span>

            <strong>
              {subjects.length} subjects ·{" "}
              {tasks.filter((task) => !task.completed).length}
              {" "}{ui.openTasks}
            </strong>

            <p>
              {schedule.length} {ui.sessions}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default AIAssistant;
