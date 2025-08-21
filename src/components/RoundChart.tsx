import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompleteRoundWithPlayer } from "../supabase/supabaseClient";
import { COURSE } from "../data/course";

interface RoundChartProps {
  par?: number;
  round: CompleteRoundWithPlayer;
}

const RoundChart: React.FC<RoundChartProps> = ({ round, par = 3 }) => {
  const HOLE_KEYS: Array<{
    key: keyof CompleteRoundWithPlayer;
    label: number;
  }> = [
    { key: "first_hole", label: 1 },
    { key: "second_hole", label: 2 },
    { key: "third_hole", label: 3 },
    { key: "fourth_hole", label: 4 },
    { key: "fifth_hole", label: 5 },
  ];

  const toChartData = (round: CompleteRoundWithPlayer, parPerHole = 3) => {
    let runningScore = 0;
    return HOLE_KEYS.map(({ key, label }) => {
      const score = (round[key] as unknown as number) ?? 0;
      runningScore += score; // sum up to current hole
      const parToHere = label * parPerHole; // par accumulated to this hole
      const diff = runningScore - parToHere; // cumulative diff vs par

      return { hole: COURSE.holes[label - 1]?.name, score, diff };
    });
  };

  const data = toChartData(round, par);
  const diffs = data.map((d) => d.diff);
  const min = Math.min(0, ...diffs) - 1;
  const max = Math.max(0, ...diffs) + 1;

  return (
    <div className="w-full rounded-2xl bg-green-50/70 border border-green-200 p-4 sm:p-6 shadow-sm ">
      <div className="flex items-baseline justify-between mb-4"></div>
      <div className="h-64 sm:h-72 md:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#86efac66" />
            <XAxis
              dataKey="hole"
              tickLine={false}
              axisLine={{ stroke: "#86efac" }}
              tick={{ fill: "#14532d" }}
            />

            <YAxis
              domain={[min, max]}
              allowDecimals={false}
              interval={0}
              tickLine={false}
              axisLine={{ stroke: "#86efac" }}
              tick={{ fill: "#14532d" }}
            />
            {/* Zero line (par) */}
            <ReferenceLine y={0} stroke="#16a34a" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: "#16a34a", strokeOpacity: 0.25 }}
              contentStyle={{ borderRadius: 12, border: "1px solid #bbf7d0" }}
              formatter={(value, name: string) => {
                if (name === "diff") {
                  const n = Number(value);
                  const sign = n > 0 ? "+" : "";
                  return [`${sign}${n}`, "Mot par"];
                }
                if (name === "score") return [String(value), "Slag"];
                return [String(value), name];
              }}
              labelFormatter={(label) => `Hull ${label}`}
            />
            <Line
              type="monotone"
              dataKey="diff"
              stroke="#16a34a" // green-600
              strokeWidth={3}
              dot={{ r: 4, stroke: "#16a34a", strokeWidth: 2, fill: "#dcfce7" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RoundChart;
