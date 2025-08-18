import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Chart() {
  const data = [
    { name: "Jan", value: 30 },
    { name: "Feb", value: 45 },
    { name: "Mar", value: 60 },
  ];
  if (!data || data.length < 2) return null;

  // 시작값과 끝값 비교
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const lineColor = last >= first ? "red" : "blue"; // 우상향 = 빨강, 우하향 = 파랑

  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor} // 여기서 색상 지정
        strokeWidth={2}
        dot={{ r: 4 }}
      />
    </LineChart>
  );
}
