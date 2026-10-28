import type { ReactNode } from "react";

interface Props {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function RecommendationLayout({ title, subtitle, children }: Props) {
    return (
        <main className="mx-auto max-w-5xl px-6 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </header>
            <div className="space-y-6">{children}</div>
        </main>
    );
}
