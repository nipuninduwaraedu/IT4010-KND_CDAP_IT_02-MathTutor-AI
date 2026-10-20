import { ProblemCase } from "@/types/geometry";

export const SAMPLE_PROBLEM: ProblemCase = {
  id: "SL-OL-MATH-GR11-CIRC-01",
  grade: "G.C.E. (O/L) Grade 11",
  topic: "Geometry & Circle Theorems",
  subtopic: "Theorem 25.3: Angle in a Semicircle",
  title: "Angle Subtended in a Semicircle Theorem",
  statementText:
    "In the circle with center O, AB is a diameter and C is an arbitrary point on the circumference. Prove that angle ACB = 90°.",
  katexStatement:
    "\\text{In the circle with center } O, \\; AB \\text{ is a diameter and } C \\text{ is a point on the circumference. Prove that } \\angle ACB = 90^\\circ.",
  diagramConfig: {
    circleRadius: 110,
    points: {
      O: { x: 170, y: 150, label: "O" },
      A: { x: 60, y: 150, label: "A" },
      B: { x: 280, y: 150, label: "B" },
      C: { x: 230, y: 55, label: "C" },
    },
  },
  sampleSubmissions: [
    {
      id: "case-incorrect-theorem",
      label: "Misconception: Incorrect Theorem Application",
      category: "Incorrect Theorem Application",
      description:
        "Student applies the Semicircle Right Angle Theorem directly to a general chord without showing it passes through center O.",
      rawText: `Step 1: In the circle with center O, AB is a line segment and C is on the circumference. [Given]
Step 2: Chord AB subtends angle ACB at the circumference, so angle ACB = 90°. [Angle in a semicircle is a right angle]
Step 3: Therefore angle ACB = 90°. [Q.E.D.]`,
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          statement: "In the circle with center O, AB is a chord and C is on the circumference.",
          justification: "Given in question statement",
          ocrConfidence: 98,
          isFlagged: false,
        },
        {
          id: "step-2",
          stepNumber: 2,
          statement: "\\text{Chord } AB \\text{ subtends } \\angle ACB \\text{ at the circumference, therefore } \\angle ACB = 90^\\circ.",
          justification: "Angle in a semicircle is a right angle",
          ocrConfidence: 94,
          isFlagged: true,
          flagReason:
            "Premature theorem invocation. The student asserted the semicircle right angle property without establishing that chord AB passes through center O (diameter).",
        },
        {
          id: "step-3",
          stepNumber: 3,
          statement: "\\therefore \\angle ACB = 90^\\circ",
          justification: "Proved",
          ocrConfidence: 99,
          isFlagged: false,
        },
      ],
      diagnosis: {
        status: "Misconception Detected",
        category: "Incorrect Theorem Application",
        confidenceScore: 88,
        flaggedStepIndex: 2,
        overallFeedback:
          "The proof makes a deductive leap at Step 2 by invoking the 'Angle in a Semicircle' theorem without verifying that chord AB contains the circle's center O.",
        fallacyExplanation:
          "In Sri Lankan O/L syllabus Theorem 25.3, an angle subtended at the circumference is 90° if and only if the subtending chord is a diameter. The student skipped proving that O lies on AB.",
        ruleContrastSummary: {
          studentClaim: "Any chord AB subtends 90° on the circumference.",
          correctTheoremRule: "Only a diameter (a chord passing through center O) subtends 90° at the circumference.",
          missingRequirement: "Explicit verification that AB passes through O (AB is a diameter, not merely an arbitrary chord).",
        },
        hints: [
          {
            level: 1,
            title: "Conceptual Reminder",
            subtitle: "Recall theorem prerequisites",
            pedagogicalFocus: "Conceptual Reminder",
            isUnlocked: true,
            content:
              "Review the prerequisite conditions for the 'Angle in a Semicircle' theorem. Does this theorem hold for any chord, or does the chord require a specific relation to center O?",
          },
          {
            level: 2,
            title: "Rule Contrast",
            subtitle: "Compare student assumption with geometric rule",
            pedagogicalFocus: "Rule Contrast",
            isUnlocked: false,
            content:
              "Contrast Rule: An arbitrary chord subtends angles of varying measures (acute or obtuse) depending on the arc. Only when chord AB passes through center O is the arc a semicircle (subtending 180° at center), which makes the angle at circumference 180° / 2 = 90°.",
          },
          {
            level: 3,
            title: "Guiding Question & Construction",
            subtitle: "Step-by-step reasoning prompt",
            pedagogicalFocus: "Guiding Question",
            isUnlocked: false,
            content:
              "Construct auxiliary line OC (the radius from center O to vertex C). Notice that OA = OC and OB = OC. What kind of triangles are ΔOAC and ΔOBC, and what does this imply about their base angles?",
          },
        ],
      },
    },
    {
      id: "case-incorrect-angle",
      label: "Misconception: Incorrect Angle Relationships",
      category: "Incorrect Angle Relationships",
      description:
        "Student misapplies cyclic quadrilateral theorem to a figure involving the center point O.",
      rawText: `Step 1: Points A, B, C are on the circle and O is the center. [Given]
Step 2: Since A, B, C, O form a four-sided figure, angle ACB + angle AOB = 180°. [Opposite angles of cyclic quadrilateral are supplementary]
Step 3: But angle AOB = 180° as AB is a diameter line. [Straight line angle]
Step 4: Therefore angle ACB = 0°, which is impossible. [Logical contradiction]`,
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          statement: "\\text{Points } A, B, C \\text{ are on circle and } O \\text{ is the center.}",
          justification: "Given in problem",
          ocrConfidence: 96,
          isFlagged: false,
        },
        {
          id: "step-2",
          stepNumber: 2,
          statement: "\\angle ACB + \\angle AOB = 180^\\circ",
          justification: "Opposite angles of cyclic quadrilateral are supplementary",
          ocrConfidence: 91,
          isFlagged: true,
          flagReason:
            "Invalid geometric entity definition: O is the center of the circle, not a point lying on the circumference. Thus, ABCO is not a cyclic quadrilateral.",
        },
        {
          id: "step-3",
          stepNumber: 3,
          statement: "\\angle AOB = 180^\\circ",
          justification: "AB is a diameter straight line",
          ocrConfidence: 97,
          isFlagged: false,
        },
      ],
      diagnosis: {
        status: "Misconception Detected",
        category: "Incorrect Angle Relationships",
        confidenceScore: 91,
        flaggedStepIndex: 2,
        overallFeedback:
          "The student confused the properties of a cyclic quadrilateral with the relationship between center angle and circumference angle.",
        fallacyExplanation:
          "A quadrilateral is cyclic only when all four vertices lie strictly on the circle's circumference. Center O is internal to the circle, so ABCO cannot satisfy cyclic quadrilateral theorems.",
        ruleContrastSummary: {
          studentClaim: "Quad ABCO has supplementary opposite angles.",
          correctTheoremRule: "Theorem 26.1: Angle at center is twice the angle at circumference (angle AOB = 2 * angle ACB).",
          missingRequirement: "Center angle theorem should be used instead of cyclic quadrilateral opposite angle theorem.",
        },
        hints: [
          {
            level: 1,
            title: "Conceptual Reminder",
            subtitle: "Definition of cyclic quadrilateral",
            pedagogicalFocus: "Conceptual Reminder",
            isUnlocked: true,
            content:
              "Check the definition of a cyclic quadrilateral: all 4 vertices must lie on the circle's circumference. Does center O lie on the circumference?",
          },
          {
            level: 2,
            title: "Rule Contrast",
            subtitle: "Center angle vs circumference angle",
            pedagogicalFocus: "Rule Contrast",
            isUnlocked: false,
            content:
              "Rule Contrast: Instead of opposite angles summing to 180°, use Theorem 25.1: The angle subtended by an arc at the center is double the angle subtended by it at the circumference (∠AOB = 2∠ACB).",
          },
          {
            level: 3,
            title: "Guiding Question",
            subtitle: "Direct deduction prompt",
            pedagogicalFocus: "Guiding Question",
            isUnlocked: false,
            content:
              "Since AB is a diameter passing through O, what is the measure of the straight-angle ∠AOB at the center? If ∠AOB = 2∠ACB, what must ∠ACB equal?",
          },
        ],
      },
    },
    {
      id: "case-missing-step",
      label: "Misconception: Missing Proof Step",
      category: "Missing Proof Step",
      description:
        "Student constructs radii correctly but omits the algebraic relation connecting base angles to triangle angle sum.",
      rawText: `Step 1: Join OC. OA = OB = OC = r. [Radii of the same circle]
Step 2: Triangle OAC and Triangle OBC are both isosceles triangles. [Two sides equal to radius]
Step 3: Therefore angle ACB = 90°. [Conclusion]`,
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          statement: "\\text{Join } OC. \\; OA = OB = OC = r",
          justification: "Radii of the same circle",
          ocrConfidence: 97,
          isFlagged: false,
        },
        {
          id: "step-2",
          stepNumber: 2,
          statement: "\\triangle OAC \\text{ and } \\triangle OBC \\text{ are isosceles triangles}",
          justification: "Sides equal to radius r",
          ocrConfidence: 95,
          isFlagged: false,
        },
        {
          id: "step-3",
          stepNumber: 3,
          statement: "\\therefore \\angle ACB = 90^\\circ",
          justification: "Deduced from triangles",
          ocrConfidence: 92,
          isFlagged: true,
          flagReason:
            "Missing reasoning chain: The student did not equate base angles (e.g., ∠OAC = ∠OCA and ∠OBC = ∠OCB) or apply the angle sum of ΔABC to prove the sum equals 90°.",
        },
      ],
      diagnosis: {
        status: "Misconception Detected",
        category: "Missing Proof Step",
        confidenceScore: 84,
        flaggedStepIndex: 3,
        overallFeedback:
          "The construction and initial classification of triangles are sound, but Step 3 jumps to the conclusion without establishing the intermediate algebraic equality.",
        fallacyExplanation:
          "In marking schemes for O/L Mathematics, jumping from 'triangles are isosceles' directly to 90° loses deductive method marks because the equality of base angles and angle-sum distribution are unstated.",
        ruleContrastSummary: {
          studentClaim: "Isosceles triangles immediately imply ∠ACB = 90°.",
          correctTheoremRule: "Deduction requires: (1) base angles equality, (2) expressing ∠ACB = α + β, (3) 2α + 2β = 180° in ΔABC.",
          missingRequirement: "Explicit base angle equality and triangle angle sum equation.",
        },
        hints: [
          {
            level: 1,
            title: "Conceptual Reminder",
            subtitle: "State properties of isosceles triangles",
            pedagogicalFocus: "Conceptual Reminder",
            isUnlocked: true,
            content:
              "You noted that ΔOAC and ΔOBC are isosceles. What specific angle relationships follow from having two equal sides in each triangle?",
          },
          {
            level: 2,
            title: "Rule Contrast",
            subtitle: "Intermediate equation requirements",
            pedagogicalFocus: "Rule Contrast",
            isUnlocked: false,
            content:
              "Rule Contrast: Having isosceles triangles alone does not automatically yield 90°. You must let ∠OAC = ∠OCA = α and ∠OBC = ∠OCB = β, then note ∠ACB = α + β.",
          },
          {
            level: 3,
            title: "Guiding Question",
            subtitle: "Completing the angle sum",
            pedagogicalFocus: "Guiding Question",
            isUnlocked: false,
            content:
              "Write the sum of all interior angles of ΔABC in terms of α and β: α + β + (α + β) = 180°. What does this solve to for (α + β)?",
          },
        ],
      },
    },
    {
      id: "case-correct-proof",
      label: "Valid Proof Logic (Exemplary Submission)",
      category: "Correct Reasoning",
      description:
        "Full, rigorous deductive proof adhering to Sri Lankan O/L examination marking criteria.",
      rawText: `Step 1: Join auxiliary radius OC. Then OA = OB = OC = r. [Radii of the same circle]
Step 2: In triangle OAC, OA = OC, so angle OCA = angle OAC = x. [Angles opposite to equal sides are equal]
Step 3: In triangle OBC, OB = OC, so angle OCB = angle OBC = y. [Angles opposite to equal sides are equal]
Step 4: angle ACB = angle OCA + angle OCB = x + y. [Angle addition axiom]
Step 5: In triangle ABC, angle CAB + angle ABC + angle ACB = 180°. [Sum of angles in a triangle is 180°]
Step 6: x + y + (x + y) = 180° => 2(x + y) = 180° => x + y = 90°. Therefore angle ACB = 90°. [Q.E.D.]`,
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          statement: "\\text{Join } OC. \\; OA = OB = OC = r",
          justification: "Radii of the same circle",
          ocrConfidence: 99,
          isFlagged: false,
        },
        {
          id: "step-2",
          stepNumber: 2,
          statement: "\\text{In } \\triangle OAC, \\; OA = OC \\implies \\angle OCA = \\angle OAC = x",
          justification: "Angles opposite to equal sides are equal (isosceles property)",
          ocrConfidence: 98,
          isFlagged: false,
        },
        {
          id: "step-3",
          stepNumber: 3,
          statement: "\\text{In } \\triangle OBC, \\; OB = OC \\implies \\angle OCB = \\angle OBC = y",
          justification: "Angles opposite to equal sides are equal (isosceles property)",
          ocrConfidence: 97,
          isFlagged: false,
        },
        {
          id: "step-4",
          stepNumber: 4,
          statement: "\\angle ACB = \\angle OCA + \\angle OCB = x + y",
          justification: "Adjacent angle addition axiom",
          ocrConfidence: 99,
          isFlagged: false,
        },
        {
          id: "step-5",
          stepNumber: 5,
          statement: "\\angle CAB + \\angle ABC + \\angle ACB = 180^\\circ \\implies x + y + (x + y) = 180^\\circ",
          justification: "Sum of interior angles of \\triangle ABC is 180^\\circ",
          ocrConfidence: 97,
          isFlagged: false,
        },
        {
          id: "step-6",
          stepNumber: 6,
          statement: "2(x + y) = 180^\\circ \\implies x + y = 90^\\circ \\implies \\angle ACB = 90^\\circ",
          justification: "Algebraic simplification & substitution (Q.E.D.)",
          ocrConfidence: 99,
          isFlagged: false,
        },
      ],
      diagnosis: {
        status: "Valid Proof Logic",
        category: "Correct Reasoning",
        confidenceScore: 97,
        flaggedStepIndex: null,
        overallFeedback:
          "Excellent mathematical rigor. The proof uses accurate auxiliary construction, properly identifies isosceles triangle base angle equivalences, and correctly executes the angle-sum deduction.",
        fallacyExplanation: undefined,
        hints: [
          {
            level: 1,
            title: "Conceptual Mastery",
            subtitle: "Theorem synthesis achieved",
            pedagogicalFocus: "Conceptual Reminder",
            isUnlocked: true,
            content:
              "You have fully established that any diameter subtends a right angle at the circumference. Consider how this theorem is applied in reverse: if ∠ACB = 90°, then AB must be a diameter.",
          },
          {
            level: 2,
            title: "Alternative Proof Method",
            subtitle: "Angle at center theorem shortcut",
            pedagogicalFocus: "Rule Contrast",
            isUnlocked: false,
            content:
              "Alternative proof: Since AOB is a straight line, ∠AOB = 180°. By Theorem 25.1 (angle at center is twice the angle at circumference), ∠AOB = 2∠ACB, therefore 180° = 2∠ACB => ∠ACB = 90°.",
          },
          {
            level: 3,
            title: "Extension Challenge",
            subtitle: "O/L Exam Distinction problem",
            pedagogicalFocus: "Guiding Question",
            isUnlocked: false,
            content:
              "If point C moves anywhere along the upper semi-circle arc, does the angle change? What happens if C coincides with A or B?",
          },
        ],
      },
    },
  ],
};
