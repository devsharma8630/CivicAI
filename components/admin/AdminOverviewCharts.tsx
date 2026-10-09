"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ["#059669", "#f59e0b", "#3b82f6", "#dc2626", "#8b5cf6", "#0ea5e9", "#f97316", "#64748b", "#ec4899", "#14b8a6", "#a855f7"];

export function AdminOverviewCharts({
  trend,
  categoryCounts,
  statusCounts,
}: {
  trend: { date: string; count: number }[];
  categoryCounts: { name: string; value: number }[];
  statusCounts: { name: string; value: number }[];
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-slate-700">Complaint Trend</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700">By Status</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                {statusCounts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
        <h3 className="text-sm font-semibold text-slate-700">By Category</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
