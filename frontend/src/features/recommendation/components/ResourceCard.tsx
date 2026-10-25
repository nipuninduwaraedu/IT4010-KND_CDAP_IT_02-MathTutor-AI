import { BookOpen, FileText, PenLine, PlayCircle } from "lucide-react";
import type { Difficulty, RecommendedResource } from "../types";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
    basic: "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100 text-amber-800",
    advanced: "bg-red-100 text-red-800",
};

const TYPE_ICON: Record<string, typeof PlayCircle> = {
    video: PlayCircle,
    notes: FileText,
    worked_example: BookOpen,
    practice: PenLine,
};

interface Props {
    resource: RecommendedResource;
    onOpen?: (resourceId: string) => void;
}

export default function ResourceCard({ resource, onOpen }: Props) {
    const Icon = TYPE_ICON[resource.type] ?? BookOpen;
    return (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    <Icon size={14} />
                    {resource.type.replace("_", " ")}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLE[resource.difficulty]}`}>
                    {resource.difficulty}
                </span>
            </div>
            <h3 className="mb-1 text-base font-semibold text-slate-900">{resource.title}</h3>
            <p className="mb-4 flex-1 text-sm text-slate-500">{resource.reason}</p>
            <button
                onClick={() => onOpen?.(resource.resource_id)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
                Start
            </button>
        </div>
    );
}