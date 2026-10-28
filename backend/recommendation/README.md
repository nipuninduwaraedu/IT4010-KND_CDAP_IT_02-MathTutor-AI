# Personalized Remedial Learning Recommendation Support

Component owner: Chamal S.A (IT23350328)

## Purpose
Receives a detected Geometry misconception and recommends suitable
remedial learning resources with a short reason for each.

## Flow
Detected Misconception -> Geometry Concept -> Resource Matching
-> Ranking -> Recommendation -> Progress Tracking

## Input format (from detection component)
{
  "student_id": "S001",
  "misconception": "incorrect_theorem_application",
  "concept": "circle_theorems",
  "confidence": 0.91
}

## Output format
{
  "recommendations": [
    {
      "resource_id": "R001",
      "title": "Circle Theorems Refresher",
      "type": "video",
      "difficulty": "basic",
      "reason": "Recommended because you applied a circle theorem incorrectly."
    }
  ]
}