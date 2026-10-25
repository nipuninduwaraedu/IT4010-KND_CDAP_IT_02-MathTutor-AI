"use client";

import { useEffect, useState } from "react";
import RecommendationLayout from "../components/RecommendationLayout";
import ResourceCard from "../components/ResourceCard";
import { fetchRecommendations, logUsage } from "../services/recommendationApi";
import type { RecommendedResource } from "../types";

const STUDENT_ID = "S001";

export default function StudentDashboard() {
    const [items, setItems] = useState<RecommendedResource[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRecommendations({
            student_id: STUDENT_ID,
            misconception: "incorrect_theorem_application",
            concept: "circle_theorems",
            confidence: 0.91,
        })
            .then((d) => setItems(d.recommendations))
            .catch((e) => setError(e.message));
    }, []);

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
                        <ResourceCard key={r.resource_id} resource={r} onOpen={(id) => logUsage(STUDENT_ID, id)} />
                    ))}
                </div>
            </section>
        </RecommendationLayout>
    );
}