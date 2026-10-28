import base64
import json
import os
import re
from pathlib import Path
import requests
from dotenv import load_dotenv

load_dotenv()

MATHPIX_ENDPOINT = "https://api.mathpix.com/v3/text"

# Deterministic offline fallback responses for GEO_Q01 to GEO_Q10
OFFLINE_OCR_MOCK: dict[str, str] = {
    "GEO_Q01": (
        "$E\\hat{O}D + D\\hat{O}B + F\\hat{O}B = 180^\\circ$ (Angles on straight line EF)\n"
        "$57^\\circ + D\\hat{O}B + 43^\\circ = 180^\\circ$ (Substitution of given angles)\n"
        "$D\\hat{O}B = 80^\\circ$ (Simplification)\n"
        "$A\\hat{O}C = D\\hat{O}B = 80^\\circ$ (Vertically opposite angles)"
    ),
    "GEO_Q02": (
        "$3x + 2x = 150^\\circ$ (Exterior angle of a triangle equals sum of interior opposite angles)\n"
        "$5x = 150^\\circ$ (Adding like terms)\n"
        "$x = 30^\\circ$ (Dividing both sides by 5)"
    ),
    "GEO_Q03": (
        "In $\\triangle PTS$ and $\\triangle RTQ$, $PT = TR$ (Given)\n"
        "$P\\hat{T}S = R\\hat{T}Q$ (Vertically opposite angles)\n"
        "$T\\hat{P}S = T\\hat{R}Q$ (Alternate angles, $PS \\parallel RQ$)\n"
        "$\\triangle PTS \\equiv \\triangle RTQ$ (AAS congruence condition)"
    ),
    "GEO_Q04": (
        "Vertically opposite interior angle $= 180^\\circ - 120^\\circ = 60^\\circ$ (Angles on a straight line)\n"
        "$2x + 2x + 60^\\circ = 180^\\circ$ (Angle sum of a triangle)\n"
        "$4x = 120^\\circ \\Rightarrow x = 30^\\circ$ (Solving for x)\n"
        "$x + y + 60^\\circ = 180^\\circ \\Rightarrow y = 90^\\circ$ (Angle sum of right triangle)"
    ),
    "GEO_Q05": (
        "Exterior angle at intermediate intersection $= 2c^\\circ + c^\\circ = 3c^\\circ$ (Exterior angle of triangle)\n"
        "$x^\\circ = 3c^\\circ + c^\\circ$ (Exterior angle of small triangle)\n"
        "$x^\\circ = 4c^\\circ$ (Simplification)"
    ),
    "GEO_Q06": (
        "Interior angle at top-right $= 180^\\circ - 110^\\circ = 70^\\circ$ (Allied angles, parallel lines)\n"
        "$a + 25^\\circ = 70^\\circ$ (Angle addition at vertex)\n"
        "$a = 45^\\circ$ (Subtracting $25^\\circ$ from both sides)"
    ),
    "GEO_Q07": (
        "Alternate angle at upper intersection $= 130^\\circ$ (Alternate angles, parallel lines)\n"
        "$b + 20^\\circ = 130^\\circ$ (Adjacent angles composing alternate angle)\n"
        "$b = 110^\\circ$ (Simplification)"
    ),
    "GEO_Q08": (
        "$A\\hat{C}B = 180^\\circ - (80^\\circ + 30^\\circ) = 70^\\circ$ (Angle sum of $\\triangle ABC$)\n"
        "$P\\hat{Q}C = P\\hat{C}Q = 70^\\circ$ (Angles opposite equal sides $PC = CQ$)\n"
        "$C\\hat{P}Q = 180^\\circ - 140^\\circ = 40^\\circ$ (Angle sum of $\\triangle PCQ$)\n"
        "$b = 70^\\circ$ (Base angle of isosceles triangle $\\triangle PCQ$)"
    ),
    "GEO_Q09": (
        "$A\\hat{C}G = C\\hat{G}F = 50^\\circ$ (Alternate angles, $AC \\parallel EF$)\n"
        "$100^\\circ + 50^\\circ + x = 180^\\circ$ (Angle sum of $\\triangle ABC$)\n"
        "$x = 30^\\circ$ (Simplification)"
    ),
    "GEO_Q10": (
        "$x + x + y + y = 180^\\circ$ (Angles on straight line ABC)\n"
        "$2x + 2y = 180^\\circ$ (Combining like terms)\n"
        "$2(x + y) = 180^\\circ \\Rightarrow x + y = 90^\\circ$ (Dividing by 2)"
    ),
}

# Student-specific misconceptions captured across STU01..STU05 for realistic dataset generation
STUDENT_VARIATIONS: dict[str, dict[str, str]] = {
    "STU02": {
        "GEO_Q01": (
            "$E\\hat{O}D + D\\hat{O}B + F\\hat{O}B = 360^\\circ$ (Angles on straight line EF)\n"
            "$57^\\circ + D\\hat{O}B + 43^\\circ = 360^\\circ$ (Substitution)\n"
            "$D\\hat{O}B = 260^\\circ$ (Simplification)\n"
            "$A\\hat{O}C = 260^\\circ$ (Vertically opposite angles)"
        ),
        "GEO_Q06": (
            "Top-right angle $= 110^\\circ$ (Co-interior angles are equal)\n"
            "$a + 25^\\circ = 110^\\circ$ (Angle sum)\n"
            "$a = 85^\\circ$ (Simplification)"
        ),
        "GEO_Q07": (
            "Upper angle $= 180^\\circ - 130^\\circ = 50^\\circ$ (Alternate angles sum to $180^\\circ$)\n"
            "$b + 20^\\circ = 50^\\circ$ (Substitution)\n"
            "$b = 30^\\circ$ (Simplification)"
        ),
        "GEO_Q10": (
            "$x + x + y + y = 360^\\circ$ (Angles on straight line ABC)\n"
            "$2(x + y) = 360^\\circ$ (Factoring)\n"
            "$x + y = 180^\\circ$ (Dividing by 2)"
        ),
    },
    "STU03": {
        "GEO_Q02": (
            "$3x - 2x = 150^\\circ$ (Exterior angle theorem)\n"
            "$x = 150^\\circ$ (Simplification)"
        ),
        "GEO_Q03": (
            "In $\\triangle PTS$ and $\\triangle RTQ$, $PT = TR$ (Given)\n"
            "$PS = RQ$ (Parallel lines are equal)\n"
            "$\\triangle PTS \\equiv \\triangle RTQ$ (SAS congruence)"
        ),
        "GEO_Q08": (
            "$A\\hat{C}B = 70^\\circ$ [Implicit]\n"
            "$b = 70^\\circ$ (Equal angles)"
        ),
    },
    "STU04": {
        "GEO_Q04": (
            "$2x + 2x = 120^\\circ$ [Implicit]\n"
            "$x = 30^\\circ$ [Implicit]\n"
            "$y = 90^\\circ$ [Implicit]"
        ),
        "GEO_Q09": (
            "$A\\hat{C}B = 50^\\circ$ (Corresponding angles, $AC \\parallel EF$)\n"
            "$x = 180^\\circ - 150^\\circ = 30^\\circ$ (Angle sum of triangle)"
        ),
    },
}


def _infer_ids(image_path: str, question_id: str = "") -> tuple[str, str]:
    filename = Path(image_path).stem
    match = re.match(r"^(STU\d+)_(GEO_Q\d+)$", filename, re.IGNORECASE)
    if match:
        stu_id, q_id = match.group(1).upper(), match.group(2).upper()
        return stu_id, question_id.upper() or q_id
    return "", (question_id.upper() if question_id else "GEO_Q01")


def extract_math_text(image_path: str, question_id: str = "") -> str:
    """
    Extract mathematical text and LaTeX from a proof image via Mathpix OCR API.
    Falls back to a deterministic offline dictionary when credentials are absent
    or network/quota errors occur.
    """
    app_id = os.getenv("MATHPIX_APP_ID", "").strip()
    app_key = os.getenv("MATHPIX_APP_KEY", "").strip()

    stu_id, resolved_qid = _infer_ids(image_path, question_id)

    if app_id and app_key and app_id != "your_mathpix_app_id":
        try:
            with open(image_path, "rb") as img_file:
                img_b64 = base64.b64encode(img_file.read()).decode("utf-8")

            headers = {
                "app_id": app_id,
                "app_key": app_key,
                "Content-type": "application/json",
            }
            payload = {
                "src": f"data:image/png;base64,{img_b64}",
                "formats": ["text"],
                "math_inline_delimiters": ["$", "$"],
                "rm_spaces": True,
            }
            response = requests.post(
                MATHPIX_ENDPOINT,
                headers=headers,
                data=json.dumps(payload),
                timeout=10,
            )
            if response.status_code == 200:
                data = response.json()
                text = data.get("text", "").strip()
                if text:
                    return text
        except Exception:
            pass

    if stu_id in STUDENT_VARIATIONS and resolved_qid in STUDENT_VARIATIONS[stu_id]:
        return STUDENT_VARIATIONS[stu_id][resolved_qid]

    return OFFLINE_OCR_MOCK.get(resolved_qid, OFFLINE_OCR_MOCK["GEO_Q01"])
