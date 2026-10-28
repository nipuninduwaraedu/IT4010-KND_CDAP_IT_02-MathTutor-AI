"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LearningFocus from "../components/LearningFocus";
import ProgressCurve from "../components/ProgressCurve";
import RecommendationLayout from "../components/RecommendationLayout";
import ResourceCard from "../components/ResourceCard";
import { fetchRecommendations, logUsage } from "../services/recommendationApi";
import type { RecommendedResource } from "../types";

const DEFAULT_STUDENT_ID = "S001";

const WEAKNESS_LABELS: Record<string, string> = {
    incorrect_theorem_application: "Theorem Application",
    incorrect_angle_relationship: "Angle Relationships",
    missing_proof_step: "Complete Proof Steps",
    invalid_assumption: "Valid Geometric Assumptions",
};

function DashboardContent() {
    const searchParams = useSearchParams();
    const studentId = searchParams.get("student_id") || DEFAULT_STUDENT_ID;
    const misconception =
        searchParams.get("misconception") || "incorrect_theorem_application";
    const concept = searchParams.get("concept") || "circle_theorems";
    const rawConf = searchParams.get("confidence");
    const confidence = rawConf ? parseFloat(rawConf) : 0.91;

    const [items, setItems] = useState<RecommendedResource[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRecommendations({
            student_id: studentId,
            misconception,
            concept,
            confidence: Number.isFinite(confidence) ? confidence : 0.91,
        })
            .then((d) => setItems(d.recommendations))
            .catch((e) => setError(e.message));
    }, [studentId, misconception, concept, confidence]);

    const weaknessTitle =
        WEAKNESS_LABELS[misconception] ??
        misconception.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <RecommendationLayout
            title="Hello! Let's improve your Geometry"
            subtitle="Resources picked from your detected mistakes"
        >
            <section>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Recommended for You</h2>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => (
                        <ResourceCard
                            key={r.resource_id}
                            resource={r}
                            onOpen={(id) => logUsage(studentId, id)}
                        />
                    ))}
                </div>
            </section>
            <div className="grid gap-4 md:grid-cols-2">
                <ProgressCurve />
                <LearningFocus weakness={weaknessTitle} accuracy={65} goal={80} />
            </div>
        </RecommendationLayout>
    );
}

export default function StudentDashboard() {
    return (
        <Suspense
            fallback={
                <RecommendationLayout
                    title="Hello! Let's improve your Geometry"
                    subtitle="Resources picked from your detected mistakes"
                >
                    <p className="text-sm text-slate-500">Loading recommendations...</p>
                </RecommendationLayout>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}
