import type { RecommendationResponse, UsageLogPayload } from "../types";

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
    if (!res.ok) {
        const detail = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to load recommendations (${res.status}): ${detail}`);
    }
    return res.json();
}

export async function logUsage(
    student_id: string,
    resource_id: string,
    action = "opened",
): Promise<void> {
    const payload: UsageLogPayload = { student_id, resource_id, action };
    try {
        await fetch(`${BASE_URL}/recommend/usage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch {
        // Fire-and-forget: tracking failure must never break the UI
    }
}