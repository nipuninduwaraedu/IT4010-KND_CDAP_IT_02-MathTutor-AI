export type Difficulty = "basic" | "medium" | "advanced";

export interface RecommendedResource {
    resource_id: string;
    title: string;
    type: string;
    difficulty: Difficulty;
    reason: string;
}

export interface RecommendationResponse {
    recommendations: RecommendedResource[];
}