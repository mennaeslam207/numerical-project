import React, { useState, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  predictStudyHours,
  distributeHoursOverDays,
} from "../../utils/studyMath";

const SAMPLE_USER_DATA = [
  { x: 15, y: 1.5 },
  { x: 30, y: 3.1 },
  { x: 45, y: 4.3 },
  { x: 60, y: 6.2 },
  { x: 80, y: 7.4 },
];

const INITIAL_REMINDERS = [
  { id: 1, type: "كويز", title: "كويز شابتر 1 و 2", dueInHours: 12 },
  { id: 2, type: "تاسك", title: "تسليم شيت العملي", dueInHours: 22 },
  { id: 3, type: "ديدلاين", title: "رفع المشروع المبدئي", dueInHours: 48 },
];

export default function AiStudyHub() {
  const [pages, setPages] = useState(35);
  const [difficulty, setDifficulty] = useState(1.2);
  const [daysLeft, setDaysLeft] = useState(3);
  const [userSamples, setUserSamples] = useState(SAMPLE_USER_DATA);

  useEffect(() => {
    fetch("/study_users_dataset.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUserSamples(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleDatasetUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readFileText = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) =>
          resolve({ name: file.name, text: String(ev.target?.result || "") });
        reader.onerror = reject;
        reader.readAsText(file);
      });

    try {
      const results = await Promise.all(files.map(readFileText));
      const combinedPoints = [];

      for (const { name, text } of results) {
        if (name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            for (const row of parsed) {
              const x = Number(row.x);
              const y = Number(row.y);
              if (!Number.isNaN(x) && !Number.isNaN(y)) {
                combinedPoints.push({ x, y });
              }
            }
          }
        } else {
          const rows = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

          for (const line of rows) {
            const [col1, col2] = line.split(/[;,]/);
            const x = Number(col1);
            const y = Number(col2);
            if (!Number.isNaN(x) && !Number.isNaN(y)) {
              combinedPoints.push({ x, y });
            }
          }
        }
      }

      if (combinedPoints.length >= 2) {
        setUserSamples((prev) => [...prev, ...combinedPoints]);
      } else {
        alert("تأكدي أن الملفات تحتوي على أرقام صالحة (صفين على الأقل).");
      }
    } catch {
      alert("تأكدي أن الملفات بصيغة JSON أو CSV صحيحة.");
    }

    e.target.value = "";
  };

  const predictedHours = predictStudyHours({
    pages,
    difficultyMultiplier: difficulty,
    historicalData: userSamples,
  });
  const dailySchedule = distributeHoursOverDays(predictedHours, daysLeft);

  const [material, setMaterial] = useState("");
  const [questionOrChat, setQuestionOrChat] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const canvasRef = useRef(null);

  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderType, setNewReminderType] = useState("تاسك");
  const [newReminderHours, setNewReminderHours] = useState(24);

  const speak = (text) => {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-EG";
    window.speechSynthesis.speak(utter);
  };

  const handleVoiceInput = () => {
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("المتصفح لا يدعم التسجيل الصوتي هنا، جرّبي Google Chrome.");
      return;
    }
    const rec = new SpeechRec();
    rec.lang = "ar-EG";
    setIsListening(true);
    rec.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setQuestionOrChat(spoken);
      callGemini(spoken, "chat", true);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  const callGemini = async (customPrompt, mode = "chat", speakReply = false) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAiOutput(
        "أضيفي VITE_GEMINI_API_KEY داخل ملف .env في جذر المشروع أولاً."
      );
      return;
    }

    setIsLoading(true);
    try {
      let sysPrompt = "أنت مساعد مذاكرة ذكي بأسلوب واضح ومريح.";
      let promptText = customPrompt || questionOrChat;

      if (mode === "explain") {
        sysPrompt =
          "اشرح الماتريال الدراسية ببساطة وبنقاط واضحة مع مثال مختصر.";
        promptText = `اشرح الماتريال التالية:\n${material}\n\n${customPrompt || ""}`;
      } else if (mode === "quiz") {
        sysPrompt =
          "كوّن أسئلة تدريبية على الماتريال (اختيار من متعدد وأسئلة قصيرة) مع الإجابات في النهاية.";
        promptText = `اعمل أسئلة مراجعة على الماتريال التالية:\n${material}`;
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sysPrompt }] },
            contents: [{ parts: [{ text: promptText || "مرحباً" }] }],
          }),
        }
      );

      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يصل رد واضح.";
      setAiOutput(reply);
      if (speakReply) speak(reply.slice(0, 350));
    } catch (err) {
      setAiOutput("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShortVideo = async () => {
    const baseText = (material || aiOutput || "ملخص سريع للماتريال").trim();
    const lines = baseText
      .split(/[.!؟\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);

    if (lines.length === 0) lines.push("مراجعة سريعة لأهم أفكار الماتريال");

    const canvas = canvasRef.current;
    if (!canvas || !canvas.captureStream) {
      alert("تعذر إنشاء الفيديو على هذا المتصفح.");
      return;
    }

    setIsRecordingVideo(true);
    setVideoUrl("");

    const stream = canvas.captureStream(25);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
      setIsRecordingVideo(false);
    };

    const ctx = canvas.getContext("2d");
    recorder.start();

    for (let i = 0; i < lines.length; i++) {
      ctx.fillStyle = "#223A5E";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#9FC0E3";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`نقطة ${i + 1} من ${lines.length}`, 36, 56);

      ctx.fillStyle = "#F3F8FD";
      ctx.font = "20px sans-serif";
      const words = lines[i].split(" ");
      let line = "";
      let y = 115;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > canvas.width - 72) {
          ctx.fillText(line, 36, y);
          line = w + " ";
          y += 34;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, 36, y);

      await new Promise((r) => setTimeout(r, 1800));
    }

    recorder.stop();
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    setReminders((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: newReminderType,
        title: newReminderTitle.trim(),
        dueInHours: Number(newReminderHours) || 24,
      },
    ]);
    setNewReminderTitle("");
  };

  return (
    <div className="min-h-screen bg-[#F3F8FD] text-[#223A5E] p-5" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="bg-white border border-[#9FC0E3] rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#223A5E] mb-3">
            تنبيهات الديدلاين والتاسكات والكويزات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {reminders.map((item) => (
              <div
                key={item.id}
                className="bg-[#F3F8FD] border border-[#D0E1F2] rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#D0E1F2] text-[#223A5E] font-medium">
                    {item.type}
                  </span>
                  <p className="font-medium text-sm mt-1 text-[#223A5E]">
                    {item.title}
                  </p>
                </div>
                <span className="text-xs text-[#355982] font-semibold">
                  خلال {item.dueInHours} ساعة
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={addReminder} className="flex flex-wrap gap-2">
            <select
              value={newReminderType}
              onChange={(e) => setNewReminderType(e.target.value)}
              className="bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
            >
              <option value="تاسك">تاسك</option>
              <option value="كويز">كويز</option>
              <option value="ديدلاين">ديدلاين</option>
            </select>
            <input
              type="text"
              placeholder="اسم التاسك أو الكويز أو الديدلاين..."
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              className="flex-1 min-w-[200px] bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
            />
            <input
              type="number"
              min="1"
              value={newReminderHours}
              onChange={(e) => setNewReminderHours(e.target.value)}
              className="w-24 bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
            />
            <button
              type="submit"
              className="bg-[#355982] hover:bg-[#223A5E] text-[#F3F8FD] text-sm px-4 py-2 rounded-xl transition"
            >
              إضافة تذكير
            </button>
          </form>
        </section>

        <section className="bg-white border border-[#9FC0E3] rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#223A5E] mb-1">
            توقع وتوزيع ساعات المذاكرة (Cubic Spline & Interpolation)
          </h2>
          <p className="text-xs text-[#4D79A8] mb-4">
            منحنى يمر بنقاط بيانات المستخدمين لتوقع الساعات وتوزيعها على الأيام المتبقية.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4D79A8] mb-3">
            <span>
              عدد سجلات الداتا سيت الحالية:{" "}
              <strong>{userSamples.length}</strong> سجل
            </span>
            <label className="cursor-pointer bg-[#D0E1F2] hover:bg-[#9FC0E3] text-[#223A5E] font-medium px-3 py-1.5 rounded-xl transition">
              رفع داتا سيت (CSV / JSON)
              <input
                type="file"
                accept=".csv,.json"
                multiple
                onChange={handleDatasetUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#355982] font-medium mb-1">
                عدد الصفحات
              </label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value) || 1)}
                className="w-full bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#355982] font-medium mb-1">
                صعوبة الماتريال
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
              >
                <option value={0.8}>سهل (0.8)</option>
                <option value={1}>متوسط (1.0)</option>
                <option value={1.2}>صعب (1.2)</option>
                <option value={1.5}>دسم (1.5)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#355982] font-medium mb-1">
                الأيام المتبقية
              </label>
              <input
                type="number"
                min="1"
                value={daysLeft}
                onChange={(e) => setDaysLeft(Number(e.target.value) || 1)}
                className="w-full bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F3F8FD] border border-[#D0E1F2] rounded-xl p-3 mb-4">
            <div>
              <span className="text-xs text-[#4D79A8]">الساعات المتوقعة: </span>
              <strong className="text-xl text-[#223A5E]">
                {predictedHours} ساعة
              </strong>
            </div>
            <button
              onClick={() =>
                setUserSamples((prev) => [
                  ...prev,
                  {
                    x: Number((pages * difficulty).toFixed(1)),
                    y: predictedHours,
                  },
                ])
              }
              className="bg-[#D0E1F2] hover:bg-[#9FC0E3] text-[#223A5E] font-medium text-xs px-3 py-2 rounded-xl transition"
            >
              حفظ في سجل بيانات المستخدمين
            </button>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySchedule}>
                <CartesianGrid stroke="#D0E1F2" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#355982" />
                <YAxis stroke="#355982" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F3F8FD",
                    borderColor: "#9FC0E3",
                    color: "#223A5E",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#355982"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#223A5E" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white border border-[#9FC0E3] rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#223A5E]">
            مساعد المذاكرة الذكي (شرح، أسئلة، شات صوتي، وفيديو قصير)
          </h2>

          <textarea
            rows="4"
            placeholder="الصقي هنا نص الماتريال الدراسية اللي عايزة تشرحيها أو تعملي عليها أسئلة أو تحوليها لفيديو قصير..."
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl p-3 text-sm text-[#223A5E]"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => callGemini("", "explain", false)}
              disabled={isLoading}
              className="bg-[#355982] hover:bg-[#223A5E] text-[#F3F8FD] text-sm px-4 py-2 rounded-xl transition"
            >
              اشرح الماتريال
            </button>
            <button
              onClick={() => callGemini("", "quiz", false)}
              disabled={isLoading}
              className="bg-[#4D79A8] hover:bg-[#355982] text-[#F3F8FD] font-medium text-sm px-4 py-2 rounded-xl transition"
            >
              اعمل أسئلة على الماتريال
            </button>
            <button
              onClick={handleCreateShortVideo}
              disabled={isRecordingVideo}
              className="bg-[#D0E1F2] hover:bg-[#9FC0E3] text-[#223A5E] font-medium text-sm px-4 py-2 rounded-xl transition"
            >
              {isRecordingVideo
                ? "جاري تجهيز الفيديو..."
                : "فيديو قصير للماتريال"}
            </button>
            <button
              onClick={handleVoiceInput}
              className="bg-[#D0E1F2] hover:bg-[#9FC0E3] text-[#223A5E] font-medium text-sm px-4 py-2 rounded-xl transition"
            >
              {isListening ? "جاري الاستماع..." : "تحدث بصوتك (Voice)"}
            </button>
            {aiOutput && (
              <button
                onClick={() => speak(aiOutput.slice(0, 400))}
                className="bg-[#D0E1F2] hover:bg-[#9FC0E3] text-[#223A5E] font-medium text-sm px-4 py-2 rounded-xl transition"
              >
                اسمع الرد بصوته
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اسألي الشات بوت أي سؤال..."
              value={questionOrChat}
              onChange={(e) => setQuestionOrChat(e.target.value)}
              className="flex-1 bg-[#F3F8FD] border border-[#9FC0E3] rounded-xl px-3 py-2 text-sm text-[#223A5E]"
            />
            <button
              onClick={() => callGemini(questionOrChat, "chat", true)}
              disabled={isLoading}
              className="bg-[#355982] hover:bg-[#223A5E] text-[#F3F8FD] text-sm px-4 py-2 rounded-xl transition"
            >
              إرسال
            </button>
          </div>

          <div className="bg-[#F3F8FD] border border-[#D0E1F2] rounded-xl p-4 min-h-[110px] whitespace-pre-wrap text-sm leading-relaxed text-[#223A5E]">
            {isLoading
              ? "جاري التفكير..."
              : aiOutput ||
                "سيظهر هنا شرح الماتريال أو الأسئلة أو رد الشات بوت."}
          </div>

          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={640}
              height={260}
              className="hidden"
            />
            {videoUrl && (
              <div className="space-y-2">
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-w-xl rounded-xl border border-[#9FC0E3]"
                />
                <a
                  href={videoUrl}
                  download="study-summary.webm"
                  className="inline-block text-xs text-[#355982] font-semibold underline"
                >
                  تحميل الفيديو القصير
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}