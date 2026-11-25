
import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { useLanguage } from "../App";

import {
  BookOpen,
  Plus,
  Layers,
  GraduationCap,
} from "lucide-react";

import SubjectCard from "../components/subjects/SubjectCard";
import SubjectForm from "../components/subjects/SubjectForm";

const translations = {
  en: {
    title: "My Subjects",
    subtitle: "Manage and organize your academic subjects.",
    add: "Add Subject",
    noSubjects: "No Subjects Yet",
    emptyMessage: "Add your first subject to get started.",
    deleteConfirm: "Delete this subject and its tasks?",
    noTasks: "No tasks for this subject yet.",
    subjectCount: "Your Subjects",
    organized: "STUDY ORGANIZATION",
  },

  ar: {
    title: "موادي الدراسية",
    subtitle: "نظّمي موادك الدراسية وتابعي مهام كل مادة.",
    add: "إضافة مادة",
    noSubjects: "لا توجد مواد دراسية حتى الآن",
    emptyMessage: "أضيفي أول مادة دراسية للبدء.",
    deleteConfirm: "هل أنتِ متأكدة من حذف هذه المادة وجميع مهامها؟",
    noTasks: "لا توجد مهام لهذه المادة حتى الآن.",
    subjectCount: "موادك الدراسية",
    organized: "تنظيم الدراسة",
  },
};

function Subjects() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const isArabic = language === "ar";

  const {
    subjects = [],
    addSubject,
    updateSubject,
    deleteSubject,
    getTasksBySubject,
  } = useStudy();

  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleSubmit = (data) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, data);
    } else {
      addSubject(data);
    }

    setShowForm(false);
    setEditingSubject(null);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(t.deleteConfirm)) {
      deleteSubject(id);
    }
  };

  const handleAddClick = () => {
    if (showForm && !editingSubject) {
      setShowForm(false);
      return;
    }

    setEditingSubject(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  const handleViewTasks = (subject) => {
    const subjectTasks = getTasksBySubject(subject.id);

    const message = subjectTasks.length
      ? subjectTasks.map((task, index) => `${index + 1}. ${task.title}`).join("\n")
      : t.noTasks;

    window.alert(message);
  };

  return (
    <div className="subjects-page" dir={isArabic ? "rtl" : "ltr"}>
      {/* PAGE HEADER */}
      <section className="subjects-page-header">
        <div className="subjects-heading-content">
          <span className="subjects-eyebrow">
            <GraduationCap size={15} />
            {t.organized}
          </span>

          <h1>
            <BookOpen size={30} />
            {t.title}
          </h1>

          <p>{t.subtitle}</p>
        </div>

        <button
          type="button"
          className="subjects-add-button"
          onClick={handleAddClick}
        >
          <Plus size={18} />
          {t.add}
        </button>
      </section>

      {/* SUBJECT FORM */}
      {showForm && (
        <div className="subjects-form-wrapper">
          <SubjectForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingSubject}
          />
        </div>
      )}

      {/* SUBJECTS SECTION */}
      <section className="subjects-content">
        <div className="subjects-section-heading">
          <div>
            <span className="subjects-eyebrow">
              <Layers size={14} />
              {t.subjectCount}
            </span>

            <h2>{t.title}</h2>
          </div>

          <span className="subjects-count">
            {subjects.length}
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="subjects-empty-state">
            <div className="subjects-empty-icon">
              <BookOpen size={32} />
            </div>

            <h3>{t.noSubjects}</h3>
            <p>{t.emptyMessage}</p>

            <button
              type="button"
              className="subjects-add-button"
              onClick={handleAddClick}
            >
              <Plus size={17} />
              {t.add}
            </button>
          </div>
        ) : (
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={{
                  ...subject,
                  tasks: getTasksBySubject(subject.id),
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewTasks={handleViewTasks}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Subjects;
