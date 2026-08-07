"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatPrice } from "@/lib/formet";

const chartColors = ["#6f5138", "#a66d2c", "#bd8956", "#8299ae", "#62836a"];

export function RevenueTrendChart({ data }: { data: { label: string; revenue: number; sales: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={310}>
      <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bd8956" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#f8efe4" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#eadfd3" strokeDasharray="4 4" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#887768" }} />
        <YAxis yAxisId="revenue" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#887768" }} tickFormatter={(value) => `$${value}`} />
        <YAxis yAxisId="sales" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#887768" }} />
        <Tooltip
          cursor={{ fill: "#fffaf4" }}
          contentStyle={{ borderRadius: 12, borderColor: "#eadfd3", boxShadow: "0 8px 24px rgba(113,83,52,.08)" }}
          formatter={(value: number, name: string) => [name === "revenue" ? formatPrice(value) : value, name === "revenue" ? "Revenue" : "Sales"]}
        />
        <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#6f5138" strokeWidth={2} fill="url(#revenueFill)" />
        <Bar yAxisId="sales" dataKey="sales" fill="#bd8956" radius={[4, 4, 0, 0]} barSize={24} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function CategoryInterestCharts({ data }: { data: { name: string; sales: number; revenue: number; learners: number }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#f1e9e1" />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b5c50" }} />
          <Tooltip cursor={{ fill: "#fffaf4" }} contentStyle={{ borderRadius: 12, borderColor: "#eadfd3" }} formatter={(value: number) => [`${value} sales`, "Demand"]} />
          <Bar dataKey="sales" fill="#6f5138" radius={[0, 5, 5, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={data.slice(0, 5)} dataKey="sales" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3} strokeWidth={0}>
              {data.slice(0, 5).map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#eadfd3" }} formatter={(value: number) => [`${value} sales`, "Demand"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
