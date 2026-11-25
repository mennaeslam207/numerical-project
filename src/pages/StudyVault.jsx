
import React, { useState, useEffect } from "react";
import { useLanguage } from "../App";

function StudyVault() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = isArabic ? {
    title: "المكتبة الدراسية", subtitle: "مساحتك الشخصية للاحتفاظ بملاحظاتك وموادك الدراسية.", upload: "رفع وتحليل محاضرة", uploadHint: "ارفعي محاضرتك ليحلل النظام محتواها ويقدّر وقت المذاكرة.", choose: "اختاري المحاضرة (PDF أو PPTX)", selected: "الملف المحدد:", studentId: "رقم الطالبة", analyze: "تحليل المحاضرة", analyzing: "جارٍ تحليل المحاضرة...", wait: "يرجى الانتظار، يتم تحليل المحاضرة الآن...", results: "نتائج تحليل المحاضرة", pages: "صفحات", words: "كلمات", topics: "موضوعات مستخرجة", average: "متوسط الكلمات / صفحة", estimate: "وقت المذاكرة المتوقع", unavailable: "غير متاح", difficulty: "مستوى الصعوبة", method: "طريقة التقدير", confidence: "مستوى الثقة", status: "الحالة", ocr: "صفحات معالجة بالتعرف الضوئي", student: "الطالبة", preview: "عرض معاينة النص المستخرج", record: "تسجيل جلسة المذاكرة", recordHint: "بعد الانتهاء من المحاضرة، أدخلي الوقت الفعلي الذي استغرقته في المذاكرة.", actual: "وقت المذاكرة الفعلي (بالدقائق)", knowledge: "مستوى معرفتك قبل المذاكرة", beginner: "مبتدئة", moderate: "متوسطة", advanced: "متقدمة", saving: "جارٍ حفظ الجلسة...", saved: "تم حفظ الجلسة", saveSession: "حفظ جلسة المذاكرة", another: "تحليل محاضرة أخرى", editNote: "تعديل الملاحظة", newNote: "إنشاء ملاحظة جديدة", noteTitle: "عنوان الملاحظة...", noteContent: "اكتبي ملاحظاتك الدراسية هنا...", update: "تحديث الملاحظة", saveNote: "حفظ الملاحظة +", cancel: "إلغاء", search: "ابحثي في ملاحظاتك...", noMatch: "لا توجد ملاحظات تطابق البحث.", noNotes: "لا توجد ملاحظات بعد. ابدئي بإنشاء أول ملاحظة!", created: "تاريخ الإنشاء:", updated: "آخر تحديث:", edit: "تعديل", delete: "حذف"
  } : {
    title: "Study Vault", subtitle: "Your personal space for important study notes.", upload: "Upload & Analyze Lecture", uploadHint: "Upload your lecture and let Smart Study Planner analyze its content and estimate your study time.", choose: "Choose Lecture (PDF or PPTX)", selected: "Selected file:", studentId: "Student ID", analyze: "Analyze Lecture", analyzing: "Analyzing Lecture...", wait: "Please wait. Your lecture is being analyzed...", results: "Lecture Analysis Results", pages: "Pages", words: "Words", topics: "Extracted Topic Matches", average: "Average Words / Page", estimate: "Estimated Study Time", unavailable: "Not available", difficulty: "Difficulty", method: "Estimation Method", confidence: "Confidence", status: "Status", ocr: "OCR Pages", student: "Student", preview: "View Extracted Text Preview", record: "Record Your Study Session", recordHint: "After finishing this lecture, enter the actual time you spent studying it.", actual: "Actual Study Time (minutes)", knowledge: "Your Knowledge Level Before Studying", beginner: "Beginner", moderate: "Moderate", advanced: "Advanced", saving: "Saving Session...", saved: "Session Saved", saveSession: "Save Study Session", another: "Analyze Another Lecture", editNote: "Edit Your Note", newNote: "Create New Note", noteTitle: "Note title...", noteContent: "Write your study notes here...", update: "Update Note", saveNote: "Save Note +", cancel: "Cancel", search: "Search your notes...", noMatch: "No notes match your search.", noNotes: "No notes found. Start creating your first note!", created: "Created:", updated: "Updated:", edit: "Edit", delete: "Delete"
  };
  // =========================
  // Notes Management
  // =========================

  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem("studyNotes");
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error) {
      console.error("Error loading notes:", error);
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("studyNotes", JSON.stringify(notes));
  }, [notes]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title: title.trim(),
                content: content.trim(),
                updatedDate: new Date().toLocaleDateString("en-GB"),
              }
            : note
        )
      );

      setEditingId(null);
    } else {
      const newNote = {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        date: new Date().toLocaleDateString("en-GB"),
      };

      setNotes((prev) => [newNote, ...prev]);
    }

    setTitle("");
    setContent("");
  };

  const editNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  const deleteNote = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (confirmDelete) {
      setNotes((prev) => prev.filter((note) => note.id !== id));

      if (editingId === id) {
        cancelEdit();
      }
    }
  };

  const filteredNotes = notes.filter((note) =>
    (note.title + " " + note.content)
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  // =========================
  // Lecture Upload & Analysis
  // =========================

  const [selectedFile, setSelectedFile] = useState(null);
  const [studentId, setStudentId] = useState("Student1");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [actualMinutes, setActualMinutes] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState("Moderate");
  const [savingSession, setSavingSession] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setAnalysis(null);
    setUploadError("");
    setSessionMessage("");
    setSessionError("");
    setSessionSaved(false);
    setActualMinutes("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (![".pdf", ".pptx"].includes(extension)) {
      setSelectedFile(null);
      setUploadError("Please select a PDF or PPTX file.");
      e.target.value = "";
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setSelectedFile(null);
      setUploadError("File size must not exceed 30 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadError("Please choose a lecture file first.");
      return;
    }

    setLoading(true);
    setUploadError("");
    setAnalysis(null);
    setSessionSaved(false);
    setSessionMessage("");
    setSessionError("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("student_id", studentId);

      const response = await fetch(
        "http://127.0.0.1:8000/api/analyze-material",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Lecture analysis failed."
        );
      }

      setAnalysis(result);

try {
  localStorage.setItem(
    "activeStudyMaterial",
    JSON.stringify({
      file_name: result.material?.file_name || "Lecture",
      full_text: result.full_text || ""
    })
  );
} catch (storageError) {
  console.warn("Could not save lecture text:", storageError);
}
    } catch (error) {
      console.error("Analysis error:", error);

      setUploadError(
        error.message ||
          "Cannot connect to the backend. Make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Record Actual Study Time
  // =========================

  const handleRecordSession = async (e) => {
    e.preventDefault();

    if (!analysis) return;

    const actual = Number(actualMinutes);
    const expected = Number(
      analysis.prediction.predicted_minutes
    );

    if (!Number.isFinite(actual) || actual <= 0) {
      setSessionError("Enter a valid study time greater than zero.");
      return;
    }

    if (!Number.isFinite(expected) || expected < 0) {
      setSessionError("The expected study time is unavailable.");
      return;
    }

    setSavingSession(true);
    setSessionError("");
    setSessionMessage("");

    try {
      const formData = new FormData();

      formData.append("student_id", studentId);
      formData.append(
        "material_name",
        analysis.material.file_name
      );
      formData.append(
        "pages_count",
        String(analysis.material.pages_count)
      );
      formData.append(
        "word_count",
        String(analysis.material.word_count)
      );
      formData.append(
        "difficulty_level",
        analysis.prediction.difficulty_estimate || "Unknown"
      );
      formData.append("knowledge_level", knowledgeLevel);
      formData.append("expected_minutes", String(expected));
      formData.append("actual_minutes", String(actual));

      const response = await fetch(
        "http://127.0.0.1:8000/api/record-session",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Could not save study session."
        );
      }

      setSessionSaved(true);

      setSessionMessage(
        `Study session saved successfully! Total recorded sessions: ${result.total_sessions}`
      );
    } catch (error) {
      console.error("Session recording error:", error);

      setSessionError(
        error.message || "Could not connect to the backend."
      );
    } finally {
      setSavingSession(false);
    }
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setUploadError("");
    setSessionMessage("");
    setSessionError("");
    setActualMinutes("");
    setSessionSaved(false);

    const fileInput = document.getElementById("lecture-file");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =========================
  // Page UI
  // =========================

  return (
    <div className="vault-page" dir={isArabic ? "rtl" : "ltr"}>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>{t.title} 🔐</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      {/* Lecture Upload Section */}
      <section className="lecture-upload-section">

        <h2>{t.upload} 📚</h2>

        <p>
          {t.uploadHint}
        </p>

        <form onSubmit={handleAnalyze}>

          <div className="upload-field">
            <label htmlFor="lecture-file">
              {t.choose}
            </label>

            <input
              id="lecture-file"
              type="file"
              accept=".pdf,.pptx"
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <p className="selected-file">
              {t.selected} {selectedFile.name}
            </p>
          )}

          <div className="upload-field">
            <label htmlFor="student-id">{t.studentId}</label>

            <input
              id="student-id"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
          >
            {loading ? t.analyzing : t.analyze}
          </button>

          {loading && (
            <p>{t.wait}</p>
          )}

          {uploadError && (
            <p role="alert">{uploadError}</p>
          )}

        </form>

        {/* Analysis Results */}
        {analysis && (
          <div className="analysis-results">

            <h2>{t.results}</h2>

            <h3>{analysis.material.file_name}</h3>

            <div className="analysis-stats">

              <div className="analysis-stat">
                <strong>{analysis.material.pages_count}</strong>
                <span>{t.pages}</span>
              </div>

              <div className="analysis-stat">
                <strong>{analysis.material.word_count}</strong>
                <span>{t.words}</span>
              </div>

              <div className="analysis-stat">
                <strong>{analysis.material.topics_count}</strong>
                <span>{t.topics}</span>
              </div>

              <div className="analysis-stat">
                <strong>
                  {analysis.material.average_words_per_page}
                </strong>
                <span>{t.average}</span>
              </div>

            </div>

            <div className="prediction-result">

              <h3>{t.estimate} ⏱️</h3>

              <strong>
                {analysis.prediction.predicted_minutes !== null
                  ? `${analysis.prediction.predicted_minutes} minutes`
                  : t.unavailable}
              </strong>

              <p>
                {t.difficulty}:{" "}
                {analysis.prediction.difficulty_estimate || "Unknown"}
              </p>

              <p>
                {t.method}:{" "}
                {analysis.prediction.method || "Unknown"}
              </p>

              <p>
                {t.confidence}:{" "}
                {analysis.prediction.confidence || "Unknown"}
              </p>

              <p>
                {t.status}: {analysis.prediction.status || "Unknown"}
              </p>

            </div>

            <div className="ocr-information">
              <p>{t.ocr}: {analysis.material.ocr_pages}</p>
              <p>{t.student}: {analysis.student_id}</p>
            </div>

            <details>
              <summary>{t.preview}</summary>

              <pre className="text-preview">
                {analysis.text_preview}
              </pre>
            </details>

            {/* Record Study Session */}
            <div className="record-session-section">

              <h2>{t.record} ⏱️</h2>

              <p>
                {t.recordHint}
              </p>

              <form onSubmit={handleRecordSession}>

                <div className="upload-field">
                  <label htmlFor="actual-minutes">
                    {t.actual}
                  </label>

                  <input
                    id="actual-minutes"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Example: 45"
                    value={actualMinutes}
                    onChange={(e) => setActualMinutes(e.target.value)}
                    required
                    disabled={sessionSaved}
                  />
                </div>

                <div className="upload-field">
                  <label htmlFor="knowledge-level">
                    {t.knowledge}
                  </label>

                  <select
                    id="knowledge-level"
                    value={knowledgeLevel}
                    onChange={(e) => setKnowledgeLevel(e.target.value)}
                    disabled={sessionSaved}
                  >
                    <option value="Beginner">{t.beginner}</option>
                    <option value="Moderate">{t.moderate}</option>
                    <option value="Advanced">{t.advanced}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingSession || sessionSaved}
                >
                  {savingSession
                    ? t.saving
                    : sessionSaved
                    ? t.saved
                    : t.saveSession}
                </button>

                {sessionError && (
                  <p role="alert">{sessionError}</p>
                )}

                {sessionMessage && (
                  <p>{sessionMessage}</p>
                )}

              </form>

            </div>

            <button
              type="button"
              onClick={clearAnalysis}
             >
              {t.another}
            </button>

          </div>
        )}

      </section>

      {/* Create / Edit Note Form */}
      <form className="note-form" onSubmit={handleSubmit}>

        <h2>
          {editingId ? t.editNote : t.newNote}
        </h2>

        <input
          type="text"
          placeholder={t.noteTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder={t.noteContent}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div className="note-form-actions">

          <button type="submit">
            {editingId ? t.update : t.saveNote}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit} >
              {t.cancel}
            </button>
          )}

        </div>

      </form>

      {/* Search Bar */}
      <div className="vault-search">

        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* Notes List */}
      <div className="notes-grid">

        {filteredNotes.length === 0 ? (
          <p className="empty-notes">
            {search
              ? t.noMatch
              : t.noNotes}
          </p>
        ) : (
          filteredNotes.map((note) => (

            <div className="note-card" key={note.id}>

              <h3>{note.title}</h3>

              <p>{note.content}</p>

              <small>{t.created} {note.date}</small>

              {note.updatedDate && (
                <small>{t.updated} {note.updatedDate}</small>
              )}

              <div className="note-actions">

                <button
                  type="button"
                  onClick={() => editNote(note)}
                 >
                  {t.edit}
                </button>

                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                 >
                  {t.delete}
                </button>

              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
}

export default StudyVault;
