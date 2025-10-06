"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface DataPoint {
  x: string | number
  y: number
}

interface PatientChartProps {
  data: DataPoint[]
  xLabel?: string
  yLabel?: string
  color?: string
}

export function PatientChart({ data, xLabel = "Time", yLabel = "Value", color = "#3b82f6" }: PatientChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="x" label={{ value: xLabel, position: "insideBottom", offset: -5 }} className="text-xs" />
        <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value: number) => [value.toFixed(2), yLabel]}
          labelFormatter={(label) => `${xLabel}: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
