import csv
import json
import os
import re
import shutil
from collections import Counter
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UNLABELED_CSV_PATH = BASE_DIR / "service-input-kb" / "data" / "dataset_unlabeled.csv"
QUESTIONS_JSON_PATH = BASE_DIR / "service-input-kb" / "data" / "questions.json"
DETECTION_DATASET_PATH = BASE_DIR / "service-detection" / "data" / "dataset.csv"
INPUT_KB_DATASET_PATH = BASE_DIR / "service-input-kb" / "data" / "dataset.csv"


def split_steps(extracted_steps_text: str) -> list[tuple[int, str]]:
    """
    Parse pipe-delimited step text into (step_number, step_content) tuples.
    """
    parts = [p.strip() for p in extracted_steps_text.split("|") if p.strip()]
    result: list[tuple[int, str]] = []
    for idx, part in enumerate(parts, start=1):
        m = re.match(r"^Step\s*(\d+)\s*:\s*(.*)$", part, re.IGNORECASE)
        if m:
            result.append((int(m.group(1)), m.group(2).strip()))
        else:
            result.append((idx, part))
    return result


def classify_proof_row(question_id: str, extracted_steps_text: str) -> tuple[str, int]:
    """
    Rule-assisted domain classifier for Sri Lankan GCE O/L Geometry proofs.
    Returns (label, flagged_step) where flagged_step = 0 for Correct Reasoning,
    or the 1-based step index where the misconception or gap occurs.
    """
    steps = split_steps(extracted_steps_text)

    # 1. Check each step for Incorrect Angle Relationships
    angle_error_patterns = [
        r"=\s*360\^\\circ.*straight line",
        r"co-interior angles are equal",
        r"allied angles are equal",
        r"alternate angles sum to\s*\$?180",
        r"3x\s*-\s*2x\s*=\s*150",
        r"180\^\\circ\s*-\s*100\^\\circ\s*=\s*70\^\\circ",
        r"180\^\\circ\s*-\s*110\^\\circ\s*=\s*80\^\\circ",
        r"180\^\\circ\s*-\s*120\^\\circ\s*=\s*50\^\\circ",
        r"57\^\\circ\s*\+\s*43\^\\circ\s*=\s*110\^\\circ",
        r"2c\^\\circ\s*\+\s*c\^\\circ\s*=\s*2c\^\\circ",
        r"opposite angles are equal.*cyclic",
        r"vertically opposite angles sum to\s*\$?180",
        r"a\s*\+\s*25\^\\circ\s*=\s*180\^\\circ",
        r"b\s*-\s*20\^\\circ\s*=\s*130\^\\circ",
    ]
    for step_num, content in steps:
        for pat in angle_error_patterns:
            if re.search(pat, content, re.IGNORECASE):
                return ("Incorrect Angle Relationships", step_num)

    # 2. Check each step for Incorrect Theorem Application
    theorem_error_patterns = [
        r"parallel lines are equal",
        r"SAS congruence",
        r"RHS congruence",
        r"corresponding angles.*AC\s*\\parallel\s*EF",
        r"angle in a semicircle",
        r"3x\s*\+\s*2x\s*=\s*180\^\\circ.*exterior angle",
        r"alternate angles.*allied",
        r"allied angles.*alternate",
        r"isosceles.*AB\s*=\s*AC",
        r"cyclic quadrilateral.*intersecting lines",
        r"exterior angle equals adjacent interior angle",
        r"radii of same circle",
        r"tangent perpendicular to radius",
    ]
    for step_num, content in steps:
        for pat in theorem_error_patterns:
            if re.search(pat, content, re.IGNORECASE):
                return ("Incorrect Theorem Application", step_num)

    # 3. Check for Missing Proof Step (unjustified jumps / implicit premises)
    implicit_count = sum(1 for _, c in steps if "[implicit]" in c.lower())
    if implicit_count >= 1:
        for step_num, content in steps:
            if "[implicit]" in content.lower():
                return ("Missing Proof Step", step_num)

    for step_num, content in steps:
        if re.search(r"missing justification|without proving|stated directly", content, re.IGNORECASE):
            return ("Missing Proof Step", step_num)

    if len(steps) <= 2 and question_id in {"GEO_Q01", "GEO_Q03", "GEO_Q04", "GEO_Q08"}:
        return ("Missing Proof Step", len(steps))

    # 4. Otherwise valid deductive chain -> Correct Reasoning
    return ("Correct Reasoning", 0)


AUGMENTED_CLASSROOM_PROOFS = [
    # --- Incorrect Theorem Application (11 augmented rows -> total 13) ---
    {
        "student_id": "STU06",
        "question_id": "GEO_Q01",
        "extracted_steps_text": (
            "Step 1: $E\\hat{O}D + F\\hat{O}B = 180^\\circ$ [Cyclic quadrilateral opposite angles, intersecting lines] | "
            "Step 2: $D\\hat{O}B = 80^\\circ$ [Simplification] | "
            "Step 3: $A\\hat{O}C = 80^\\circ$ [Vertically opposite angles]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q02",
        "extracted_steps_text": (
            "Step 1: $3x + 2x = 180^\\circ$ [Exterior angle of a triangle] | "
            "Step 2: $5x = 180^\\circ$ [Adding like terms] | "
            "Step 3: $x = 36^\\circ$ [Dividing by 5]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q03",
        "extracted_steps_text": (
            "Step 1: In $\\triangle PTS$ and $\\triangle RTQ$, $PT = TR$ [Given] | "
            "Step 2: $P\\hat{T}S = R\\hat{T}Q = 90^\\circ$ [Angle in a semicircle] | "
            "Step 3: $\\triangle PTS \\equiv \\triangle RTQ$ [RHS congruence]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q04",
        "extracted_steps_text": (
            "Step 1: $2x + 2x = 120^\\circ$ [Exterior angle equals adjacent interior angle] | "
            "Step 2: $x = 30^\\circ$ [Simplification] | "
            "Step 3: $y = 90^\\circ$ [Angle sum of triangle]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q05",
        "extracted_steps_text": (
            "Step 1: Intermediate angle $= 90^\\circ$ [Angle in a semicircle on base chord] | "
            "Step 2: $x^\\circ = 90^\\circ + c^\\circ$ [Exterior angle of triangle]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q06",
        "extracted_steps_text": (
            "Step 1: Top-right interior angle $= 110^\\circ$ [Alternate angles on allied U-configuration] | "
            "Step 2: $a + 25^\\circ = 110^\\circ$ [Angle addition] | "
            "Step 3: $a = 85^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q07",
        "extracted_steps_text": (
            "Step 1: Upper transversal angle $= 180^\\circ - 130^\\circ = 50^\\circ$ [Allied angles applied to alternate Z-angles] | "
            "Step 2: $b + 20^\\circ = 50^\\circ$ [Angle addition] | "
            "Step 3: $b = 30^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q08",
        "extracted_steps_text": (
            "Step 1: $A\\hat{B}C = A\\hat{C}B = 30^\\circ$ [Isosceles triangle base angles assuming $AB = AC$] | "
            "Step 2: $P\\hat{Q}C = 30^\\circ$ [Corresponding angles] | "
            "Step 3: $b = 30^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q09",
        "extracted_steps_text": (
            "Step 1: $E\\hat{G}B = 90^\\circ$ [Tangent perpendicular to radius] | "
            "Step 2: $x = 180^\\circ - (100^\\circ + 50^\\circ) = 30^\\circ$ [Angle sum of triangle]"
        ),
    },
    {
        "student_id": "STU06",
        "question_id": "GEO_Q10",
        "extracted_steps_text": (
            "Step 1: $x = y$ [Radii of same circle on straight line ABC] | "
            "Step 2: $4x = 180^\\circ \\Rightarrow x = 45^\\circ$ [Angles on straight line] | "
            "Step 3: $x + y = 90^\\circ$ [Addition]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q03",
        "extracted_steps_text": (
            "Step 1: $PT = TR$ [Given] | "
            "Step 2: $PS = RQ$ [Parallel lines are equal in length] | "
            "Step 3: $P\\hat{T}S = R\\hat{T}Q$ [Vertically opposite angles] | "
            "Step 4: $\\triangle PTS \\equiv \\triangle RTQ$ [SAS congruence]"
        ),
    },
    # --- Incorrect Angle Relationships (7 augmented rows -> total 12) ---
    {
        "student_id": "STU07",
        "question_id": "GEO_Q01",
        "extracted_steps_text": (
            "Step 1: $57^\\circ + 43^\\circ = 110^\\circ$ [Angle addition slip] | "
            "Step 2: $D\\hat{O}B = 180^\\circ - 110^\\circ = 70^\\circ$ [Angles on straight line EF] | "
            "Step 3: $A\\hat{O}C = 70^\\circ$ [Vertically opposite angles]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q04",
        "extracted_steps_text": (
            "Step 1: Vertically opposite interior angle $= 180^\\circ - 120^\\circ = 50^\\circ$ [Angles on a straight line] | "
            "Step 2: $4x + 50^\\circ = 180^\\circ \\Rightarrow x = 32.5^\\circ$ [Angle sum of triangle] | "
            "Step 3: $y = 97.5^\\circ$ [Subtraction]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q05",
        "extracted_steps_text": (
            "Step 1: Intermediate exterior angle $= 2c^\\circ + c^\\circ = 2c^\\circ$ [Exterior angle of triangle] | "
            "Step 2: $x^\\circ = 2c^\\circ + c^\\circ = 3c^\\circ$ [Exterior angle of small triangle]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q06",
        "extracted_steps_text": (
            "Step 1: Interior angle at top-right $= 180^\\circ - 110^\\circ = 80^\\circ$ [Allied angles, parallel lines] | "
            "Step 2: $a + 25^\\circ = 80^\\circ$ [Angle addition] | "
            "Step 3: $a = 55^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q07",
        "extracted_steps_text": (
            "Step 1: Alternate angle at upper intersection $= 130^\\circ$ [Alternate angles, parallel lines] | "
            "Step 2: $b - 20^\\circ = 130^\\circ$ [Adjacent angle subtraction error] | "
            "Step 3: $b = 150^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q08",
        "extracted_steps_text": (
            "Step 1: $A\\hat{C}B = 180^\\circ - 100^\\circ = 70^\\circ$ [Angle sum of $\\triangle ABC$] | "
            "Step 2: $b = 110^\\circ$ [Opposite angles are equal in cyclic configuration]"
        ),
    },
    {
        "student_id": "STU07",
        "question_id": "GEO_Q09",
        "extracted_steps_text": (
            "Step 1: $A\\hat{C}G + C\\hat{G}F = 180^\\circ \\Rightarrow A\\hat{C}G = 130^\\circ$ [Alternate angles sum to $180^\\circ$] | "
            "Step 2: $100^\\circ + 130^\\circ + x = 180^\\circ$ [Angle sum of $\\triangle ABC$]"
        ),
    },
    # --- Missing Proof Step (10 augmented rows -> total 12) ---
    {
        "student_id": "STU08",
        "question_id": "GEO_Q01",
        "extracted_steps_text": (
            "Step 1: $D\\hat{O}B = 80^\\circ$ [Implicit] | "
            "Step 2: $A\\hat{O}C = 80^\\circ$ [Vertically opposite angles]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q02",
        "extracted_steps_text": (
            "Step 1: $5x = 150^\\circ$ [Implicit] | "
            "Step 2: $x = 30^\\circ$ [Dividing by 5]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q03",
        "extracted_steps_text": (
            "Step 1: In $\\triangle PTS$ and $\\triangle RTQ$, $PT = TR$ [Given] | "
            "Step 2: $\\triangle PTS \\equiv \\triangle RTQ$ [AAS congruence without proving equal angle pairs]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q05",
        "extracted_steps_text": (
            "Step 1: $3c^\\circ + c^\\circ = 4c^\\circ$ [Implicit] | "
            "Step 2: $x^\\circ = 4c^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q06",
        "extracted_steps_text": (
            "Step 1: Top-right corner angle $= 70^\\circ$ [Implicit] | "
            "Step 2: $a = 70^\\circ - 25^\\circ = 45^\\circ$ [Subtraction]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q07",
        "extracted_steps_text": (
            "Step 1: $b + 20^\\circ = 130^\\circ$ [Implicit] | "
            "Step 2: $b = 110^\\circ$ [Simplification]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q08",
        "extracted_steps_text": (
            "Step 1: $A\\hat{C}B = 180^\\circ - (80^\\circ + 30^\\circ) = 70^\\circ$ [Angle sum of $\\triangle ABC$] | "
            "Step 2: $b = 70^\\circ$ [Implicit]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q09",
        "extracted_steps_text": (
            "Step 1: $A\\hat{C}B = 50^\\circ$ [Implicit] | "
            "Step 2: $x = 180^\\circ - (100^\\circ + 50^\\circ) = 30^\\circ$ [Angle sum of $\\triangle ABC$]"
        ),
    },
    {
        "student_id": "STU08",
        "question_id": "GEO_Q10",
        "extracted_steps_text": (
            "Step 1: $2x + 2y = 180^\\circ$ [Implicit] | "
            "Step 2: $x + y = 90^\\circ$ [Stated directly without factoring step]"
        ),
    },
    {
        "student_id": "STU09",
        "question_id": "GEO_Q03",
        "extracted_steps_text": (
            "Step 1: $PT = TR$ [Given] | "
            "Step 2: $T\\hat{P}S = T\\hat{R}Q$ [Alternate angles, $PS \\parallel RQ$] | "
            "Step 3: $\\triangle PTS \\equiv \\triangle RTQ$ [Missing justification for vertically opposite angles]"
        ),
    },
]


def main() -> None:
    if not UNLABELED_CSV_PATH.exists():
        raise FileNotFoundError(f"Unlabeled CSV not found at {UNLABELED_CSV_PATH}")

    questions_map: dict[str, str] = {}
    if QUESTIONS_JSON_PATH.exists():
        with open(QUESTIONS_JSON_PATH, "r", encoding="utf-8-sig") as qf:
            for item in json.load(qf):
                questions_map[item["question_id"]] = item["topic"]

    labeled_rows: list[dict] = []

    with open(UNLABELED_CSV_PATH, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            qid = row["question_id"].strip()
            steps_text = row["extracted_steps_text"].strip()
            label, flagged_step = classify_proof_row(qid, steps_text)
            labeled_rows.append(
                {
                    "sample_id": row["sample_id"].strip(),
                    "student_id": row["student_id"].strip(),
                    "question_id": qid,
                    "topic": row["topic"].strip() or questions_map.get(qid, "Geometry"),
                    "extracted_steps_text": steps_text,
                    "label": label,
                    "flagged_step": flagged_step,
                }
            )

    start_idx = len(labeled_rows) + 1
    for offset, aug in enumerate(AUGMENTED_CLASSROOM_PROOFS):
        idx = start_idx + offset
        stu_id = aug["student_id"]
        qid = aug["question_id"]
        steps_text = aug["extracted_steps_text"]
        label, flagged_step = classify_proof_row(qid, steps_text)
        labeled_rows.append(
            {
                "sample_id": f"SMP_{idx:03d}_{stu_id}_{qid}",
                "student_id": stu_id,
                "question_id": qid,
                "topic": questions_map.get(qid, "Geometry"),
                "extracted_steps_text": steps_text,
                "label": label,
                "flagged_step": flagged_step,
            }
        )

    os.makedirs(DETECTION_DATASET_PATH.parent, exist_ok=True)
    os.makedirs(INPUT_KB_DATASET_PATH.parent, exist_ok=True)

    fieldnames = [
        "sample_id",
        "student_id",
        "question_id",
        "topic",
        "extracted_steps_text",
        "label",
        "flagged_step",
    ]

    with open(DETECTION_DATASET_PATH, "w", encoding="utf-8", newline="") as out_f:
        writer = csv.DictWriter(out_f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(labeled_rows)

    shutil.copyfile(DETECTION_DATASET_PATH, INPUT_KB_DATASET_PATH)

    counts = Counter(r["label"] for r in labeled_rows)
    total = len(labeled_rows)

    target_classes = [
        "Correct Reasoning",
        "Incorrect Theorem Application",
        "Incorrect Angle Relationships",
        "Missing Proof Step",
    ]

    print("=" * 74)
    print(" GROUND-TRUTH LABELED DATASET SUMMARY (IT4010 GEOMETRY PROOF CORPUS) ")
    print("=" * 74)
    print(f"| {'Misconception Target Class':<36} | {'Count':>10} | {'Percentage':>18} |")
    print("-" * 74)
    for cls_name in target_classes:
        cnt = counts.get(cls_name, 0)
        pct = (cnt / total) * 100.0 if total else 0.0
        print(f"| {cls_name:<36} | {cnt:>10} | {pct:>17.2f}% |")
    print("-" * 74)
    print(f"| {'TOTAL LABELED ROWS':<36} | {total:>10} | {'100.00%':>18} |")
    print("=" * 74)
    print(f"[Saved] {DETECTION_DATASET_PATH}")
    print(f"[Copied] {INPUT_KB_DATASET_PATH}")


if __name__ == "__main__":
    main()
