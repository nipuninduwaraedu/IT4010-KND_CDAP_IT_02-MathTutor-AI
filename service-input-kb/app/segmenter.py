import re

STEP_REGEX = re.compile(r"^(.*?)\s*[\(\[](.*?)[\)\]]\s*$")


def parse_reasoning_steps(raw_text: str) -> list[dict]:
    """
    Split OCR output into ordered reasoning steps, separating mathematical
    statements from bracketed theorem justifications.
    """
    if not raw_text:
        return []

    steps: list[dict] = []
    step_num = 1

    for line in raw_text.splitlines():
        cleaned = line.strip()
        if len(cleaned) < 3:
            continue

        match = STEP_REGEX.match(cleaned)
        if match:
            statement = match.group(1).strip()
            justification = match.group(2).strip() or "Implicit"
        else:
            statement = cleaned
            justification = "Implicit"

        steps.append(
            {
                "step_number": step_num,
                "statement": statement,
                "justification": justification,
                "raw_line": cleaned,
            }
        )
        step_num += 1

    return steps
