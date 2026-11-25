import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const defaultData = [
  { day: "Mon", hours: 3 },
  { day: "Tue", hours: 4 },
  { day: "Wed", hours: 2 },
  { day: "Thu", hours: 5 },
  { day: "Fri", hours: 3 },
  { day: "Sat", hours: 6 },
  { day: "Sun", hours: 4 },
];

const StudyHoursChart = ({ data = defaultData }) => {
  return (
    <div className="bg-[#171426] border border-purple-500/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">
            Study Hours
          </h3>

          <p className="text-gray-500 text-xs mt-1">
            Your weekly study activity
          </p>
        </div>

        <span className="text-xs text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg">
          This Week
        </span>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#777"
              tick={{ fill: "#888", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#777"
              tick={{ fill: "#888", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#201A32",
                border: "1px solid #A855F7",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value) => [`${value} hours`, "Study Time"]}
            />

            <Area
              type="monotone"
              dataKey="hours"
              stroke="#A855F7"
              strokeWidth={3}
              fill="url(#purpleGradient)"
              activeDot={{ r: 6, fill: "#C084FC" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyHoursChart;