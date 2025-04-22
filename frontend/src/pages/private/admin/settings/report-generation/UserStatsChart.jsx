import React, { useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";

const UserStatsChart = ({ data, setChartImage }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) {
      html2canvas(chartRef.current, { scale: 2 }).then((canvas) => {
        const imageData = canvas.toDataURL("image/png");
        // console.log("Captured Chart Image (base64):", imageData.substring(0, 100)); // Log first 100 chars
        setChartImage(imageData);
      });
    }
  }, [data]);
  

  return (
    <div ref={chartRef} className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold mb-2">User Statistics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3498db" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserStatsChart;
