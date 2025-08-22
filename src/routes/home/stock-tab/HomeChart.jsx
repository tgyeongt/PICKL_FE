import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function HomeChart({ price, oneDayAgoPrice }) {
  const data = [
    { name: "어제날짜", value: oneDayAgoPrice },
    { name: "오늘날짜", value: price },
  ];

  if (!data || data.length < 2) return null;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const lineColor = last >= first ? "#E42938" : "#1677FF";

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(10, Math.round((max - min) * 0.15));

  return (
    <LineChart
      width={100}
      height={100}
      data={data}
      margin={{ top: 28, right: 20, bottom: 6, left: 20 }}
    >
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis dataKey="name" hide />
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
        label={{ position: "top", fill: lineColor, fontSize: 10, offset: 8 }}
        isAnimationActive={true}
      />
    </LineChart>
  );
}
