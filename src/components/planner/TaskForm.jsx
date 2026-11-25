import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";

const initialForm = {
  title: "",
  subject: "",
  date: "",
  time: "",
  duration: "1",
  difficulty: "Medium",
};

export default function TaskForm({ onAddTask, onClose }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.subject.trim() || !form.date) {
      return;
    }

    onAddTask?.({
      ...form,
      id: crypto.randomUUID(),
      duration: Number(form.duration),
      completed: false,
    });

    setForm(initialForm);
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/10 bg-[#151326] p-6"
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="rounded-xl bg-purple-500/15 p-3 text-purple-400">
          <BookOpen size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Create Study Task
          </h2>
          <p className="text-sm text-gray-400">
            Add a new task to your study plan.
          </p>
        </div>
      </div>

      <Input
        label="Task Title"
        name="title"
        placeholder="e.g. Study Chapter 3"
        value={form.title}
        onChange={handleChange}
        required
      />

      <Input
        label="Subject"
        name="subject"
        placeholder="e.g. Mathematics"
        value={form.subject}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Study Date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <Input
          label="Start Time"
          name="time"
          type="time"
          value={form.time}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Duration (Hours)"
          name="duration"
          type="number"
          min="0.5"
          step="0.5"
          value={form.duration}
          onChange={handleChange}
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Difficulty
          </label>

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-[#201d35] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          <Plus size={18} />
          Add Task
        </Button>

        {onClose && (
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}