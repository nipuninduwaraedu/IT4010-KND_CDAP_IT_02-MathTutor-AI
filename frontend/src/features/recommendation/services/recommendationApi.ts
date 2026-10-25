import type { RecommendationResponse } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function fetchRecommendations(body: {
    student_id: string;
    misconception: string;
    concept?: string;
    confidence: number;
    language?: string;
}): Promise<RecommendationResponse> {
    const res = await fetch(`${BASE_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to load recommendations");
    return res.json();
}

export async function logUsage(student_id: string, resource_id: string) {
    await fetch(`${BASE_URL}/recommend/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id, resource_id, action: "opened" }),
    });
}