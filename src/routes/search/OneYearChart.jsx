import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot } from "recharts";
import { APIService } from "../../shared/lib/api";

export default function OneYearChart() {
  const { productNo } = useParams();
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await APIService.private.get("/kamis/monthly/series/item", {
          params: { productNo },
        });
        if (!res) {
          setPriceData([]);
          return;
        }
        const transformedData = Object.entries(res[productNo])
          .filter(([key]) => /^\d{6}$/.test(key))
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => ({
            name: key,
            value: value,
          }));

        setPriceData(transformedData);
      } catch (err) {
        console.error(err);
        setPriceData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
  }, [productNo]);

  if (loading) return <p>로딩 중...</p>;
  if (!priceData || priceData.length < 2) return <p>데이터 없음</p>;

  const first = priceData[0].value;
  const last = priceData[priceData.length - 1].value;
  const lineColor = last >= first ? "#E42938" : "#1677FF";

  const values = priceData.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(10, Math.round((max - min) * 0.15));

  const minPoint = priceData.find((d) => d.value === min);
  const maxPoint = priceData.find((d) => d.value === max);

  return (
    <LineChart
      width={340}
      height={300}
      data={priceData}
      margin={{ top: 28, right: 45, bottom: 6, left: 45 }}
    >
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis
        dataKey="name"
        tickMargin={6}
        tickLine={false}
        tickFormatter={(tick) => `${tick.slice(2, 4)}-${tick.slice(4)}`}
        tick={{ fontSize: 12, fill: "#666" }}
      />
      <YAxis
        tick={false}
        axisLine={false}
        width={0}
        domain={[(dataMin) => dataMin - pad, (dataMax) => dataMax + pad]}
      />
      <Tooltip
        formatter={(value) => [`${value.toLocaleString()}원`, "가격"]}
        labelFormatter={(label) => `${label.slice(0, 4)}-${label.slice(4)}`}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor}
        strokeWidth={2}
        dot={{ r: 4 }}
        isAnimationActive={true}
      />

      <ReferenceDot
        x={minPoint.name}
        y={minPoint.value}
        r={5}
        fill={lineColor}
        stroke={lineColor}
        label={{
          value: `최저 ${minPoint.value.toLocaleString()}원`,
          position: "bottom",
          fill: lineColor,
          fontSize: 12,
        }}
      />

      <ReferenceDot
        x={maxPoint.name}
        y={maxPoint.value}
        r={5}
        fill={lineColor}
        stroke={lineColor}
        label={{
          value: `최고 ${maxPoint.value.toLocaleString()}원`,
          position: "top",
          fill: lineColor,
          fontSize: 12,
        }}
      />
    </LineChart>
  );
}
