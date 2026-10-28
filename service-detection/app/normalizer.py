import re


def normalize_math_text(text: str) -> str:
    """
    Normalize mathematical proof text and LaTeX notation into a canonical
    token sequence suitable for semantic sentence embedding.
    """
    if not text:
        return ""

    s = text.strip()

    # 1. Standardize angle notations: e.g., E\hat{O}D -> angle eod, \angle ABC -> angle abc, ∠ -> angle
    s = re.sub(
        r"([A-Za-z])\s*\\hat\{([A-Za-z])\}\s*([A-Za-z])",
        r"angle \1\2\3",
        s,
    )
    s = re.sub(r"\\angle\s*", "angle ", s, flags=re.IGNORECASE)
    s = re.sub(r"[∠∡]", " angle ", s)

    # 2. Standardize degree notations: ^\circ, \circ, °, degrees -> " deg "
    s = re.sub(r"\^\s*\\circ", " deg ", s, flags=re.IGNORECASE)
    s = re.sub(r"\\circ", " deg ", s, flags=re.IGNORECASE)
    s = re.sub(r"°", " deg ", s)
    s = re.sub(r"\bdegrees?\b", " deg ", s, flags=re.IGNORECASE)

    # 3. Standardize triangle notations: \triangle, △, \Delta -> "triangle "
    s = re.sub(r"\\triangle\s*", "triangle ", s, flags=re.IGNORECASE)
    s = re.sub(r"\\Delta\s*", "triangle ", s)
    s = re.sub(r"△", " triangle ", s)

    # 4. Standardize parallel, congruence, and logical implication symbols
    s = re.sub(r"\\parallel", " parallel ", s, flags=re.IGNORECASE)
    s = re.sub(r"\|\||//", " parallel ", s)
    s = re.sub(r"\\equiv|≅", " congruent ", s, flags=re.IGNORECASE)
    s = re.sub(r"\\Rightarrow|=>|->", " implies ", s, flags=re.IGNORECASE)

    # 5. Strip LaTeX math delimiters and stray formatting brackets while keeping tokens
    s = s.replace("$", " ")
    s = re.sub(r"[\[\]\(\)\{\}]", " ", s)
    s = s.replace("|", " ; ")

    # 6. Lowercase and collapse whitespace
    s = s.lower()
    s = re.sub(r"\s+", " ", s).strip()
    return s
