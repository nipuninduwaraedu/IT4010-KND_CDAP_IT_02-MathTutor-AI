from enum import Enum
from typing import List
from pydantic import BaseModel


class ResourceType(str, Enum):
    VIDEO = "video"
    NOTES = "notes"
    WORKED_EXAMPLE = "worked_example"
    PRACTICE = "practice"


class Difficulty(str, Enum):
    BASIC = "basic"
    MEDIUM = "medium"
    ADVANCED = "advanced"


class LearningResource(BaseModel):
    resource_id: str
    title: str
    description: str
    type: ResourceType
    difficulty: Difficulty
    concept: str
    misconceptions: List[str]
    language: str = "en"
    duration_minutes: int = 0
    url: str = ""