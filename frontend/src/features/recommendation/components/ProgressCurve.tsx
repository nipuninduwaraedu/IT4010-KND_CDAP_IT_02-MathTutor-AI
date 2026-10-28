"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { day: "Mon", accuracy: 40 },
    { day: "Tue", accuracy: 48 },
    { day: "Wed", accuracy: 46 },
    { day: "Thu", accuracy: 58 },
    { day: "Fri", accuracy: 64 },
    { day: "Sat", accuracy: 63 },
    { day: "Sun", accuracy: 75 },
];

export default function ProgressCurve() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-900">Learning Progress Curve</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="day" fontSize={12} />
                        <YAxis fontSize={12} domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}