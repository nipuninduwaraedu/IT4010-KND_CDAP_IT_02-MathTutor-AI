import csv
import json
import os
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.enhancer import clean_proof_image
from app.ocr_client import extract_math_text
from app.segmenter import parse_reasoning_steps

DATA_DIR = BASE_DIR / "data"
QUESTIONS_PATH = DATA_DIR / "questions.json"
RAW_IMAGES_DIR = DATA_DIR / "raw_images"
ENHANCED_IMAGES_DIR = DATA_DIR / "enhanced_images"
OUTPUT_JSON_DIR = DATA_DIR / "output_json"
OUTPUT_JSON_PATH = OUTPUT_JSON_DIR / "ocr_dataset.json"
OUTPUT_CSV_PATH = DATA_DIR / "dataset_unlabeled.csv"


def load_questions_map() -> dict[str, dict]:
    if not QUESTIONS_PATH.exists():
        raise FileNotFoundError(f"Questions file not found at: {QUESTIONS_PATH}")
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        items = json.load(f)
    return {item["question_id"]: item for item in items if "question_id" in item}


def parse_filename(filename: str) -> tuple[str, str]:
    stem = Path(filename).stem
    match = re.match(r"^(STU\d+)_(GEO_Q\d+)$", stem, re.IGNORECASE)
    if match:
        return match.group(1).upper(), match.group(2).upper()
    parts = stem.split("_", 1)
    if len(parts) == 2:
        return parts[0].upper(), parts[1].upper()
    return "STU00", "GEO_Q01"


def run_batch_pipeline() -> None:
    os.makedirs(ENHANCED_IMAGES_DIR, exist_ok=True)
    os.makedirs(OUTPUT_JSON_DIR, exist_ok=True)

    questions_map = load_questions_map()

    image_files = sorted(
        [
            p
            for p in RAW_IMAGES_DIR.iterdir()
            if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg"}
        ]
    )

    dataset_records: list[dict] = []
    csv_rows: list[dict] = []

    print(f"[Batch Pipeline] Found {len(image_files)} student proof images in {RAW_IMAGES_DIR}")

    for idx, img_path in enumerate(image_files, start=1):
        student_id, question_id = parse_filename(img_path.name)
        sample_id = f"SMP_{idx:03d}_{student_id}_{question_id}"

        enhanced_img_path = ENHANCED_IMAGES_DIR / img_path.name
        clean_proof_image(str(img_path), str(enhanced_img_path))

        raw_ocr_text = extract_math_text(str(img_path), question_id=question_id)
        steps = parse_reasoning_steps(raw_ocr_text)

        q_meta = questions_map.get(question_id, {})
        topic = q_meta.get("topic", "General O/L Geometry")
        problem_text = q_meta.get("problem_text", "")
        target_theorem_id = q_meta.get("target_theorem_id", "")

        formatted_steps_text = " | ".join(
            f"Step {s['step_number']}: {s['statement']} [{s['justification']}]"
            for s in steps
        )

        record = {
            "sample_id": sample_id,
            "student_id": student_id,
            "question_id": question_id,
            "topic": topic,
            "problem_text": problem_text,
            "target_theorem_id": target_theorem_id,
            "raw_image": f"data/raw_images/{img_path.name}",
            "enhanced_image": f"data/enhanced_images/{img_path.name}",
            "raw_ocr_text": raw_ocr_text,
            "extracted_steps": steps,
            "label": "",
            "flagged_step": "",
        }
        dataset_records.append(record)

        csv_rows.append(
            {
                "sample_id": sample_id,
                "student_id": student_id,
                "question_id": question_id,
                "topic": topic,
                "extracted_steps_text": formatted_steps_text,
                "label": "",
                "flagged_step": "",
            }
        )

    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as jf:
        json.dump(dataset_records, jf, indent=2, ensure_ascii=False)

    fieldnames = [
        "sample_id",
        "student_id",
        "question_id",
        "topic",
        "extracted_steps_text",
        "label",
        "flagged_step",
    ]
    with open(OUTPUT_CSV_PATH, "w", encoding="utf-8", newline="") as cf:
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)

    print(f"[Batch Pipeline] Enhanced {len(image_files)} images -> {ENHANCED_IMAGES_DIR}")
    print(f"[Batch Pipeline] Exported structured JSON -> {OUTPUT_JSON_PATH}")
    print(f"[Batch Pipeline] Exported unlabeled ML CSV -> {OUTPUT_CSV_PATH}")


if __name__ == "__main__":
    run_batch_pipeline()
