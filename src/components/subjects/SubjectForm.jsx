import React, { useEffect, useState } from "react";
import { BookOpen, Clock3, Palette } from "lucide-react";
import { useLanguage } from "../../App";

function SubjectForm({ onSubmit, onCancel, initialData }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = isArabic
    ? {
        edit: "تعديل المادة الدراسية",
        add: "إضافة مادة جديدة",
        name: "اسم المادة",
        namePlaceholder: "مثال: تعلم الآلة",
        description: "الوصف",
        descriptionPlaceholder: "اكتبي نبذة مختصرة عن المادة...",
        hours: "ساعات المذاكرة أسبوعيًا",
        hoursPlaceholder: "مثال: 5",
        color: "لون المادة",
        save: "حفظ التعديلات",
        create: "إضافة المادة",
        cancel: "إلغاء",
        required: "من فضلك أدخلي اسم المادة.",
      }
    : {
        edit: "Edit Subject",
        add: "Add New Subject",
        name: "Subject Name",
        namePlaceholder: "e.g. Machine Learning",
        description: "Description",
        descriptionPlaceholder: "Write a short description of this subject...",
        hours: "Study Hours Per Week",
        hoursPlaceholder: "e.g. 5",
        color: "Subject Color",
        save: "Save Changes",
        create: "Add Subject",
        cancel: "Cancel",
        required: "Please enter the subject name.",
      };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hoursPerWeek: "",
    color: "#2563EB",
  });

  useEffect(() => {
    setFormData({
      name: initialData?.name || "",
      description: initialData?.description || "",
      hoursPerWeek: initialData?.hoursPerWeek ?? "",
      color: initialData?.color || "#2563EB",
    });
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      window.alert(t.required);
      return;
    }

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      hoursPerWeek: Number(formData.hoursPerWeek) || 0,
    });
  };

  return (
    <form className="subject-form redesigned-subject-form" onSubmit={handleSubmit} dir={isArabic ? "rtl" : "ltr"}>
      <div className="subject-form-heading">
        <span className="subject-form-heading-icon"><BookOpen size={20} /></span>
        <div><h2>{initialData ? t.edit : t.add}</h2></div>
      </div>

      <div className="subject-form-grid">
        <div className="form-group">
          <label htmlFor="subject-name">{t.name}</label>
          <input id="subject-name" type="text" name="name" placeholder={t.namePlaceholder} value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="subject-hours"><Clock3 size={14} /> {t.hours}</label>
          <input id="subject-hours" type="number" name="hoursPerWeek" min="0" max="168" placeholder={t.hoursPlaceholder} value={formData.hoursPerWeek} onChange={handleChange} />
        </div>

        <div className="form-group subject-description-field">
          <label htmlFor="subject-description">{t.description}</label>
          <textarea id="subject-description" name="description" placeholder={t.descriptionPlaceholder} value={formData.description} onChange={handleChange} rows={3} />
        </div>

        <div className="form-group subject-color-field">
          <label htmlFor="subject-color"><Palette size={14} /> {t.color}</label>
          <div className="subject-color-control">
            <input id="subject-color" type="color" name="color" value={formData.color} onChange={handleChange} />
            <span>{formData.color.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="form-buttons redesigned-form-buttons">
        <button type="submit" className="submit-btn">{initialData ? t.save : t.create}</button>
        {onCancel && <button type="button" className="cancel-btn" onClick={onCancel}>{t.cancel}</button>}
      </div>
    </form>
  );
}

export default SubjectForm;
