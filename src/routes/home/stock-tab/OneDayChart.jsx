import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function OneDayChart() {
  const data = [
    { name: "어제날짜", value: 3500 },
    { name: "오늘날짜", value: 3000 },
  ];
  if (!data || data.length < 2) return null;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const lineColor = last >= first ? "red" : "blue";

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(10, Math.round((max - min) * 0.15));

  return (
    <LineChart
      width={330}
      height={300}
      data={data}
      margin={{ top: 28, right: 20, bottom: 6, left: 20 }}
    >
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis dataKey="name" tickMargin={6} tickLine={false} />
      <YAxis
        tick={false}
        axisLine={false}
        width={0}
        domain={[(dataMin) => dataMin - pad, (dataMax) => dataMax + pad]}
      />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor}
        strokeWidth={2}
        dot={{ r: 4 }}
        label={{ position: "top", fill: lineColor, fontSize: 12, offset: 8 }}
        isAnimationActive={true}
      />
    </LineChart>
  );
}
