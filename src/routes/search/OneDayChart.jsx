import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { APIService } from "../../shared/lib/api";
import LoadingSpinner from "../../shared/commons/loading/LoadingSpinner";
import NotFound from "../../shared/commons/404/NotFound";

export default function OneDayChart() {
  const { productNo } = useParams();
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await APIService.private.get(`/daily-price-change/store/items/${productNo}`, {
          params: {
            productNo,
          },
        });

        if (res.success) {
          const detail = res.data;
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);

          const todayStr = today.toISOString().split("T")[0];
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          const transformedData = [
            { name: yesterdayStr, value: detail.oneDayAgoPrice },
            { name: todayStr, value: detail.latestPrice },
          ];

          setPriceData(transformedData);
        } else {
          setPriceData([]);
        }
      } catch (err) {
        console.error(err);
        setPriceData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
  }, [productNo]);

  if (loading) return <LoadingSpinner />;
  if (!priceData || priceData.length < 2) return <NotFound />;

  const first = priceData[0].value;
  const last = priceData[priceData.length - 1].value;
  const lineColor = last >= first ? "#E42938" : "#1677FF";

  const values = priceData.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(10, Math.round((max - min) * 0.15));

  return (
    <LineChart
      width={340}
      height={300}
      data={priceData}
      margin={{ top: 28, right: 45, bottom: 6, left: 45 }}
    >
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis dataKey="name" tickMargin={6} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
      <YAxis
        tick={false}
        axisLine={false}
        width={0}
        domain={[(dataMin) => dataMin - pad, (dataMax) => dataMax + pad]}
      />
      <Tooltip formatter={(value) => [`${value.toLocaleString()}원`, "가격"]} />
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
