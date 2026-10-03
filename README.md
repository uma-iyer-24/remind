# Remind

**Turn anything into a spatial memory.** Concepts become objects in a 3D memory palace; quizzes and ML-forgetting predictions reorder the room to reinforce what you're about to lose.

**Live repo:** [github.com/uma-iyer-24/remind](https://github.com/uma-iyer-24/remind)

## Quick start (local)

### 1. Train ML models

```bash
cd /path/to/remind
python3 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
python ml/train.py
```

Artifacts land in `ml/artifacts/` (`forget_model.joblib`, `metadata.json`, `model_comparison.json`).

### 2. API

```bash
source .venv/bin/activate
pip install -r apps/api/requirements.txt
cd apps/api
uvicorn app.main:app --reload --port 8000
```

### 3. Web

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → **Try ML concepts demo**.

## Vercel (frontend)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Build command: `npm run build` · Output: `dist`.
4. Deploy the API separately (Railway/Render/Fly) with repo root context so `ml/artifacts/` is available.
5. Set `VITE_API_URL` to your API origin (no trailing slash). Without it, the UI uses an offline heuristic scorer.

## Docs

- [Design & plan](./docs/DESIGN.md)
- [Decisions](./docs/DECISIONS.md)

## Project layout

```
apps/web/     React + R3F frontend
apps/api/     FastAPI prediction service
ml/           Training script, concept KB, artifacts
```

## Demo script

1. Landing → **Try ML concepts demo**
2. Click a glowing object → **Quiz this object**
3. Miss a question → watch objects **reorder**; header shows **ML model** when API is connected
4. **Session** pill for accuracy summary

## License

TBD
