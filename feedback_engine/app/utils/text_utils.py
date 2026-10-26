# Shared text helpers (template fill, safe log truncation).


from __future__ import annotations


def fill_template(template: str, **kwargs: str) -> str:
    """Replace `{key}` placeholders with kwargs; unknown placeholders are left unchanged."""
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", value)
    return template


def truncate(text: str, max_chars: int = 200) -> str:
    """Truncate a string for safe use in log messages (never log full proof text)."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"
