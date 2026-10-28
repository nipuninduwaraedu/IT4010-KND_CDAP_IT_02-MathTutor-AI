import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/common/Logo";

interface Props {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function RecommendationLayout({ title, subtitle, children }: Props) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
                    <Link href="/workspace" className="flex items-center gap-2.5 group">
                        <Logo size={28} className="group-hover:scale-105 transition-transform" />
                        <span className="text-sm font-bold tracking-tight text-slate-900">
                            MathTutor AI
                        </span>
                    </Link>

                    <Link
                        href="/workspace"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Proof Workspace</span>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </header>
                <div className="space-y-6">{children}</div>
            </main>
        </div>
    );
}
