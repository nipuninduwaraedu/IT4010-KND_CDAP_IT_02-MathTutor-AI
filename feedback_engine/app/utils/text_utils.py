"""
Text utility helpers for the Feedback Engine.

Kept minimal — only utilities that are used in more than one module.
"""

from __future__ import annotations


def fill_template(template: str, **kwargs: str) -> str:
    """
    Simple key substitution in a template string.

    Replaces occurrences of `{key}` with the corresponding value from kwargs.
    Keys that are not present in the template are silently ignored.
    If a placeholder has no matching kwarg, it is left as-is (no KeyError).

    Example:
        fill_template("Use {theorem_name}: {theorem_statement}", theorem_name="X")
        # → "Use X: {theorem_statement}"
    """
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", value)
    return template


def truncate(text: str, max_chars: int = 200) -> str:
    """Truncate a string for safe use in log messages (never log full proof text)."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"
