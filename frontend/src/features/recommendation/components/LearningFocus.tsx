import { Target } from "lucide-react";

interface Props {
    weakness: string;
    accuracy: number;
    goal: number;
}

export default function LearningFocus({ weakness, accuracy, goal }: Props) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <Target size={18} className="text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Your Learning Focus</h3>
            </div>
            <p className="text-xs uppercase text-slate-400">Current weakness</p>
            <p className="mb-3 text-sm font-medium text-amber-700">{weakness}</p>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Accuracy {accuracy}%</span>
                <span>Goal {goal}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${accuracy}%` }} />
            </div>
        </div>
    );
}