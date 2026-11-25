import React from "react";
import { CalendarDays, Clock, BookOpen } from "lucide-react";

const UpcomingExams = ({ exams = [] }) => {
  const sampleExams = [
    {
      id: 1,
      subject: "Numerical Methods",
      date: "2026-12-05",
      daysLeft: 13,
      color: "purple",
    },
    {
      id: 2,
      subject: "Web Development",
      date: "2026-12-09",
      daysLeft: 17,
      color: "blue",
    },
    {
      id: 3,
      subject: "Database Systems",
      date: "2026-12-14",
      daysLeft: 22,
      color: "pink",
    },
  ];

  const data = exams.length ? exams : sampleExams;

  const colors = {
    purple: "bg-purple-500/10 text-purple-400",
    blue: "bg-blue-500/10 text-blue-400",
    pink: "bg-pink-500/10 text-pink-400",
  };

  return (
    <div className="bg-[#171426] border border-purple-500/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">
            Upcoming Exams
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Stay prepared for your exams
          </p>
        </div>

        <CalendarDays className="text-purple-400" size={21} />
      </div>

      <div className="space-y-4">
        {data.map((exam) => {
          const days = exam.daysLeft ??
            Math.ceil(
              (new Date(exam.date) - new Date()) /
              (1000 * 60 * 60 * 24)
            );

          return (
            <div
              key={exam.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0F0D1A] border border-white/5 hover:border-purple-500/20 transition"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[exam.color] || colors.purple}`}>
                <BookOpen size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium truncate">
                  {exam.subject}
                </h4>

                <p className="text-gray-500 text-xs mt-1">
                  {exam.date}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-purple-400">
                  <Clock size={13} />
                  <span className="text-xs font-semibold">
                    {days < 0 ? "Passed" : `${days} days`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingExams;