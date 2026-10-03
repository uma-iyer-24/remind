# Remind API

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Train models first from repo root:

```bash
python ml/train.py
```

Health: `GET http://127.0.0.1:8000/health`
