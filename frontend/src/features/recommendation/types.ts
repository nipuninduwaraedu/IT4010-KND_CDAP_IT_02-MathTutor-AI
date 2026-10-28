export type Difficulty = "basic" | "medium" | "advanced";

export interface RecommendedResource {
    resource_id: string;
    title: string;
    type: string;
    difficulty: Difficulty;
    url: string;
    reason: string;
}

export interface RecommendationResponse {
    recommendations: RecommendedResource[];
}

export interface UsageLogPayload {
    student_id: string;
    resource_id: string;
    action?: string;
}
