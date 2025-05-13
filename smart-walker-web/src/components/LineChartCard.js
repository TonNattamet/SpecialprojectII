// src/components/LineChartCard.js
import React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

const LineChartCard = ({ data, strokeColor, gradientId }) => {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.5} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          fill={`url(#${gradientId})`}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineChartCard;
