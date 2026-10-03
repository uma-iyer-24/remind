from pydantic import BaseModel, Field


class ConceptFeatures(BaseModel):
    concept_id: str
    elapsed_days_since_last_review: float = Field(ge=0, default=0)
    review_count: int = Field(ge=0, default=0)
    success_streak: int = Field(ge=0, default=0)
    fail_streak: int = Field(ge=0, default=0)
    avg_response_time_ms: float = Field(ge=0, default=4000)
    quiz_type_mc: int = Field(ge=0, le=1, default=1)
    position_index_on_path: float = Field(ge=0, le=1, default=0.5)
    concept_text_length: float = Field(ge=1, default=40)


class PredictRequest(BaseModel):
    user_id: str = "anonymous"
    features: ConceptFeatures


class PredictResponse(BaseModel):
    forget_probability: float
    recommended_priority: int
    explanation: str
    source: str


class RankRequest(BaseModel):
    user_id: str = "anonymous"
    concepts: list[ConceptFeatures]


class RankItem(BaseModel):
    concept_id: str
    forget_probability: float
    explanation: str


class RankResponse(BaseModel):
    ordered: list[RankItem]
    source: str


class EventPayload(BaseModel):
    user_id: str = "anonymous"
    concept_id: str
    correct: bool
    rating: str
    response_time_ms: float
    quiz_type: str = "mcq"
