import { AnalyzeProofResponse } from "@/types/api";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Submits a handwritten proof image and optional problem context
 * to the FastAPI backend gateway: POST /api/v1/analyze-proof
 */
export async function submitProofAnalysis(
  image: File,
  problemText?: string
): Promise<AnalyzeProofResponse> {
  const formData = new FormData();
  formData.append("image", image);
  if (problemText && problemText.trim().length > 0) {
    formData.append("problem_text", problemText.trim());
  }

  const endpoint = `${BACKEND_BASE_URL}/api/v1/analyze-proof`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status} (${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === "string"
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Fallback to text status
      }
      throw new Error(errorMessage);
    }

    const data: AnalyzeProofResponse = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Unable to reach backend gateway at ${endpoint}. Please verify that the FastAPI server is running.`
      );
    }
    throw error;
  }
}
