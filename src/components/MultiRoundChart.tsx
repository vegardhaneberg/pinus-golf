import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  CompleteRoundWithPlayer,
  HighlightRound,
} from "../supabase/supabaseClient";
import { COURSE } from "../data/course";
import { useIsMobile } from "../utils/mobileUtil";

interface MultiRoundChartProps {
  par?: number;
  rounds: HighlightRound[];
}

// Color palette for different lines
const COLORS = [
  "#16a34a", // green-600
  "#2563eb", // blue-600
  "#dc2626", // red-600
  "#ca8a04", // yellow-600
  "#9333ea", // purple-600
  "#0891b2", // cyan-600
  "#ea580c", // orange-600
  "#be123c", // rose-600
];

const MultiRoundChart: React.FC<MultiRoundChartProps> = ({
  rounds,
  par = 3,
}) => {
  const isMobile = useIsMobile();
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

  const toChartData = (round: HighlightRound, fallbackParPerHole = 3) => {
    let runningScore = 0;
    let runningPar = 0;

    return HOLE_KEYS.map(({ label }) => {
      const strokeValue = round.strokes[label - 1] ?? 0;
      runningScore += strokeValue;

      const holePar = COURSE.holes[label - 1]?.par ?? fallbackParPerHole;
      runningPar += holePar;

      const diff = runningScore - runningPar;

      return {
        holeNo: label,
        holeName: COURSE.holes[label - 1]?.name,
        diff,
      };
    });
  };

  // Create unique keys for each round (using round ID to ensure uniqueness)
  const roundKeys = rounds.map((round, index) => {
    const playerName = round.teamName ?? `Spiller ${index + 1}`;
    return {
      roundId: index,
      playerName: playerName,
      key: `round_${index}`,
    };
  });

  // Transform data to include all rounds
  const transformedData = HOLE_KEYS.map(({ label }) => {
    const dataPoint: Record<string, string | number> = {
      holeNo: label,
      holeName: COURSE.holes[label - 1]?.name,
    };

    rounds.forEach((round, index) => {
      const roundData = toChartData(round, par);
      const holeData = roundData.find((d) => d.holeNo === label);
      if (holeData) {
        dataPoint[`round_${index}`] = holeData.diff;
      }
    });

    return dataPoint;
  });

  // Calculate min/max for Y axis
  const allDiffs = rounds.flatMap((round) => {
    const roundData = toChartData(round, par);
    return roundData.map((d) => d.diff);
  });
  const min = Math.min(0, ...allDiffs) - 1;
  const max = Math.max(0, ...allDiffs) + 1;

  return (
    <div
      className={`w-full rounded-2xl bg-green-50/70 border border-green-200 ${
        isMobile ? "p-2" : "p-4 sm:p-6"
      } shadow-sm`}
    >
      <div className={`${isMobile ? "h-60" : "h-64 sm:h-72 md:h-80 lg:h-96"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={transformedData}
            margin={{
              top: 12,
              right: isMobile ? 8 : 16,
              bottom: isMobile ? 4 : 8,
              left: isMobile ? 0 : 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#86efac66" />
            <XAxis
              dataKey={isMobile ? "holeNo" : "holeName"}
              tickLine={false}
              axisLine={{ stroke: "#86efac" }}
              tick={
                isMobile
                  ? { fontSize: 10, fill: "#14532d" }
                  : { fill: "#14532d" }
              }
              padding={isMobile ? {} : { left: 8, right: 8 }}
              tickMargin={isMobile ? 5 : 15}
            />

            <YAxis
              domain={[min, max]}
              allowDecimals={false}
              ticks={Array.from({ length: max - min + 1 }, (_, i) => min + i)}
              width={isMobile ? 28 : 40}
              tickMargin={6}
              tickLine={false}
              axisLine={{ stroke: "#86efac" }}
              tick={
                isMobile
                  ? { fontSize: 10, fill: "#14532d" }
                  : { fill: "#14532d" }
              }
            />
            {/* Zero line (par) */}
            <ReferenceLine y={0} stroke="#16a34a" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: "#16a34a", strokeOpacity: 0.25 }}
              contentStyle={{ borderRadius: 12, border: "1px solid #bbf7d0" }}
              formatter={(value, name: string) => {
                const n = Number(value);
                const sign = n > 0 ? "+" : "";
                return [`${sign}${n}`, name];
              }}
              labelFormatter={(label) => `Hull ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
              formatter={(value) => value}
            />
            {roundKeys.map((roundKey, index) => {
              const color = COLORS[index % COLORS.length];
              return (
                <Line
                  key={roundKey.roundId}
                  type="monotone"
                  dataKey={roundKey.key}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#dcfce7" }}
                  activeDot={{ r: 6 }}
                  name={roundKey.playerName}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MultiRoundChart;
