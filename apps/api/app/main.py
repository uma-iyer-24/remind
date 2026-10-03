from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ml_service import ml_service
from app.schemas import (
    EventPayload,
    PredictRequest,
    PredictResponse,
    RankItem,
    RankRequest,
    RankResponse,
)

app = FastAPI(title="Remind API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": ml_service.ready,
        "holdout": ml_service.metadata.get("holdout"),
    }


@app.post("/api/v1/predict-forgetting", response_model=PredictResponse)
def predict_forgetting(body: PredictRequest):
    row = body.features.model_dump()
    proba, source = ml_service.predict(row)
    priority = int(round(proba * 100))
    return PredictResponse(
        forget_probability=proba,
        recommended_priority=priority,
        explanation=ml_service.explain(row, proba),
        source=source,
    )


@app.post("/api/v1/rank-concepts", response_model=RankResponse)
def rank_concepts(body: RankRequest):
    items: list[RankItem] = []
    source = "heuristic"
    for c in body.concepts:
        row = c.model_dump()
        proba, src = ml_service.predict(row)
        if src == "model":
            source = "model"
        items.append(
            RankItem(
                concept_id=c.concept_id,
                forget_probability=proba,
                explanation=ml_service.explain(row, proba),
            )
        )
    items.sort(key=lambda x: x.forget_probability, reverse=True)
    return RankResponse(ordered=items, source=source)


_events: list[dict] = []


@app.post("/api/v1/events")
def log_event(body: EventPayload):
    _events.append(body.model_dump())
    return {"logged": True, "count": len(_events)}
