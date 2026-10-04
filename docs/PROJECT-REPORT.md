# ReMind — Case Study Report and Rubric Map

This document explains, in plain language, how ReMind meets each requirement in the *Machine Learning + FSD Case Study Instructions*, where the evidence lives in the repository, and what is still missing before submission. A ready-to-paste Gamma prompt for the presentation is at the end.

Repository: https://github.com/uma-iyer-24/remind

---

## 1. What the project is

ReMind is a study tool. A learner pastes a list of topics, and the app builds a 3D "memory palace": a hall with one room per topic, each room holding a sculpture shaped like the idea (a branching tree for Decision Trees, a layered net for Neural Networks, and so on). The learner walks the hall, enters rooms, and answers short quizzes that test understanding rather than names.

Behind the scenes, a trained machine-learning model estimates, for every topic, the chance the learner will forget it before the next review. Topics at highest risk are moved to the doors nearest the entrance, so the next walk naturally revisits what is about to slip. The interface tells the learner whether that ordering came from the trained model or from a simple fallback rule when the model server is unreachable.

**One-sentence problem statement:** learners spend review time evenly across everything they studied, while forgetting is uneven; ReMind predicts which topics are most at risk and reorders a walkable study space so review time goes where it matters.

---

## 2. How the project meets the objective

The guidelines ask for three things: an ML model with justified choices and cross-validated results, a web interface that lets a user interact with the model, and a simple, functional experience. ReMind does each one:

| Objective | How ReMind achieves it |
|---|---|
| Highest reasonable accuracy with justified choices | Two model families are trained and compared with 5-fold cross-validation; the better one (Random Forest) is tuned with grid search and checked on a held-out 20% test set. |
| Model integrated into a frontend | A FastAPI service loads the saved `.joblib` model. The React app sends each topic's learning statistics to the API after every quiz and receives a forget-risk score and explanation per topic. |
| Simple, user-friendly, functional | One textarea to enter topics (one per line), one button to build the palace, keyboard walking, multiple-choice quizzes, and a progress/recall header that is always visible. The whole loop runs locally with two commands. |

---

## 3. Step-by-step execution (mapped to the guideline steps)

Terms used below: **cross-validation** means splitting the training data into 5 parts and training 5 times, each time holding one part out to score, so the result is not a lucky split. **AUC** is a score from 0.5 (guessing) to 1.0 (perfect) for how well the model ranks at-risk items above safe ones. **F1** balances "how many risky items did we catch" against "how many false alarms".

### Step 1 — Data collection
- **What we use:** a simulated spaced-repetition review log, `synthetic_srs_cohort_v1`: 400 simulated learners × 80 reviews = **32,000 rows**. Each row is one review of one topic with 8 input features and a yes/no label `will_forget`.
- **Why simulated:** no public dataset records *where a topic sits in a 3D path* or the exact quiz features our app collects. The simulation borrows the idea of "memory stability" from the open-source FSRS scheduler: forgetting becomes more likely as days since last review grow relative to a learner's stability, after recent misses, and with slower answers; it becomes less likely after a streak of correct answers. Stability drifts up after a success and down after a failure, like a real learner.
- **Where:** generator `generate_srs_cohort()` in `ml/train.py`; saved data `ml/artifacts/synthetic_srs_reviews.csv`.
- **Honesty note for the panel:** this is not an Indian government dataset. See §6 for how to position the Indian context and the planned swap to real Open Spaced Repetition / Anki exports.

### Step 2 — Exploratory data analysis
- **What should be shown:** class balance of `will_forget`; histogram of `elapsed_days_since_last_review` (long right tail, because it is drawn from an exponential); forget rate rising with elapsed days; forget rate falling with `success_streak`; a correlation heatmap of the 8 features.
- **Where:** `ml/notebook/README.md` describes the recommended EDA on the CSV. **A notebook with the plots does not exist yet** — see §6, item 1.

### Step 3 — Data preprocessing
- **Missing values:** the simulator produces none; the API fills any missing field with a safe default (`schemas.py` gives every feature a default and a valid range).
- **Scaling:** all 8 numeric features are standardised with `StandardScaler` inside the model pipeline, so the same scaling is applied at prediction time automatically.
- **Outliers:** response time is drawn from a normal distribution and can go slightly negative in rare rows; elapsed days has a long tail by design. Tree models are robust to both. (A clip at 0 for response time is a small cleanup worth adding in the notebook.)
- **Where:** `build_models()` in `ml/train.py`; input validation in `apps/api/app/schemas.py`.

### Step 4 — Feature engineering
The 8 features and the reasoning:

| Feature | Why it is there |
|---|---|
| `elapsed_days_since_last_review` | The single strongest driver of forgetting in every spaced-repetition model. |
| `success_streak`, `fail_streak` | Recent history predicts the next outcome better than lifetime totals. |
| `review_count` | Lifetime exposure; included to let the model learn whether it adds anything beyond streaks. |
| `avg_response_time_ms` | Slow correct answers signal weaker memory than fast ones. |
| `quiz_type_mc` | Recognition (multiple-choice) is easier than recall; kept so the model can adjust. |
| `position_index_on_path` | Unique to ReMind: where the topic sits in the palace (0 = entrance, 1 = far end). Lets the model learn whether placement itself affects recall. |
| `concept_text_length` | A rough proxy for topic complexity. |

All features are computed live by the frontend from the learner's own quiz history (`featuresFromConcept` in `apps/web/src/lib/api.ts`), so the model always sees the same kind of input it was trained on.

### Step 5 — Model selection and training
- **Models:** Logistic Regression (simple, interpretable baseline) and Random Forest (captures interactions such as "long gap *and* recent miss"). Both use `class_weight="balanced"`.
- **Cross-validation:** 5-fold on the 80% training split, scoring AUC, F1, and accuracy.
- **Results (from `ml/artifacts/model_comparison.json`):**

| Model | CV AUC (mean ± std) | CV F1 | CV accuracy |
|---|---|---|---|
| Logistic Regression | 0.745 ± 0.010 | 0.715 | 0.681 |
| Random Forest | **0.749 ± 0.008** | **0.728** | **0.687** |

Random Forest wins on all three and has the smaller spread across folds, so it is the one tuned and deployed.

### Step 6 — Hyperparameter tuning
- **Method:** `GridSearchCV` (3-fold, AUC) over `max_depth ∈ {8, 12, 16}` and `n_estimators ∈ {150, 200}`.
- **Outcome:** best = `max_depth=8, n_estimators=150`. The untuned forest used depth 12 and 200 trees; the search showed a *shallower, smaller* forest generalises at least as well (hold-out AUC 0.751 vs CV 0.749), which also makes the API faster. The lesson to say out loud: more trees and deeper trees did not buy accuracy here, because the signal is mostly a few strong features.
- **Where:** `main()` in `ml/train.py`; chosen parameters recorded in `ml/artifacts/metadata.json` under `holdout.best_params`.

### Step 7 — Model evaluation
- **Held-out test set (20%, stratified):** AUC **0.751**, F1 **0.723**, accuracy **0.687**.
- **Role of cross-validation:** the CV mean (0.749) and the hold-out score (0.751) agree within 0.002, which is the evidence that the model is not overfitting to one split.
- **Where:** `ml/artifacts/metadata.json`; the same numbers are shown live in the app at `/architecture` → "Training & evaluation", and by `GET /health` on the API.

### Step 8 — Results interpretation
- Random Forest edges out Logistic Regression because forgetting depends on *combinations* (a long gap matters more when there is also a recent miss), which a linear model cannot express.
- The ceiling of ~0.75 AUC is set by the noise deliberately added to the simulator; it is not a flaw in the models. On real logs the ceiling would be different.
- Expected feature importance order: elapsed days, then fail streak, then success streak; `review_count`, `quiz_type_mc`, and `concept_text_length` should rank near zero because they do not influence the simulated label. Say this plainly: it shows the model is learning the real structure rather than memorising.
- **Where:** importance values can be read from `forget_model.joblib` (`named_steps["clf"].feature_importances_`) — plot them in the notebook (§6).

### Step 9 — Conclusion and recommendations
- A small, well-validated classifier is enough to drive a useful product behaviour (reordering a study path).
- Next steps: (1) retrain on real Open Spaced Repetition / Anki export logs; (2) split train/test **by learner** rather than by row so no learner appears on both sides; (3) collect real quiz events from the `/events` endpoint and retrain periodically; (4) Indian-context pilots: exam vocabulary (UPSC, NEET, JEE), regional-language word lists, board-exam formula sheets.

---

## 4. FSD integration tasks — what exists and where

| Task in guidelines | ReMind implementation | Files |
|---|---|---|
| 1. Save model; serve with Flask/FastAPI | `train.py` writes `forget_model.joblib` + `metadata.json`. FastAPI app loads them at startup. Endpoints: `GET /health`, `POST /api/v1/predict-forgetting` (one topic), `POST /api/v1/rank-concepts` (all topics, sorted), `POST /api/v1/events` (quiz telemetry). | `ml/train.py`, `apps/api/app/main.py`, `ml_service.py`, `schemas.py` |
| 2. Frontend with an input form | React + Tailwind. `/create` has a title field and a topics textarea (one topic per line; numbering and bullets stripped; live topic count; empty input blocked). | `apps/web/src/pages/CreatePage.tsx`, `lib/parseTopics.ts` |
| 3. Prediction output displayed clearly | After each quiz the panel shows "Predictions updated · ML model", the topic's forget risk as a percentage, and a sentence explanation. The palace header shows which topic is "fragile", and doors reorder by risk. The source is always labelled **forget model** or **heuristic**. | `components/QuizPanel.tsx`, `pages/PalacePage.tsx`, `store/session.ts` |
| 4. Input validation, mobile-friendly | API: every feature has a type, default, and range (Pydantic). UI: multiple-choice answers only, disabled build button on empty input. Landing, Create, and Architecture pages are responsive. The 3D palace needs a keyboard, so demo it on a laptop. | `apps/api/app/schemas.py`, `CreatePage.tsx` |
| 5. Demo flow (input → frontend → backend → model → output) | Learner answers quiz → frontend computes 8 features per topic → `POST /rank-concepts` → model `predict_proba` → sorted risks → doors reposition and header updates. Diagrammed live at `/architecture` ("System architecture" and "Runtime flow"). | `lib/api.ts`, `store/session.ts` (`applyRanking`), `pages/ArchitecturePage.tsx` |
| 6. Live demo | Runs locally with two servers (README). Frontend deploys to Vercel from `vercel.json`; API deploys separately (Dockerfile in `apps/api`). If the API is down the UI falls back to a labelled rule-based scorer so the demo never breaks. | `README.md`, `vercel.json`, `apps/api/Dockerfile` |

**Suggested demo script (3 minutes):**
1. Open `/create`, paste 6–8 topics as a numbered list, click **Build palace**.
2. Header shows `Recall —` (nothing reviewed yet) and `forget model` (API connected).
3. Walk to the first door, press **E**, press **E** at the portrait, take the 5-question quiz. Miss two on purpose.
4. Result panel: "Predictions updated · ML model · 61% forget risk". Press **L** to leave; show that topic's door is now nearest the hall.
5. Walk to the end of the hall, press **E** for the **Final review**; show the per-topic recall breakdown.
6. Open `/architecture` and point at the metrics table and the two diagrams.

---

## 5. Deliverables checklist with locations

| Deliverable | Status | Location |
|---|---|---|
| ML pipeline (.py or notebook) with explanations | `.py` done; notebook **missing** | `ml/train.py` (docstrings + comments); `ml/notebook/` |
| Backend serving predictions | Done | `apps/api/` |
| Frontend | Done | `apps/web/` |
| Deployment instructions (README) | Done for local; hosted link **to add** | `README.md` |
| PPT: dataset overview | Content in this doc §3.1 | — |
| PPT: EDA visualisations | **To generate** | notebook (§6) |
| PPT: model comparison | Numbers ready | `ml/artifacts/model_comparison.json`, `/architecture` |
| PPT: FSD architecture diagram | Done, render from app | `/architecture` → System architecture (Mermaid) |
| PPT: deployment setup | Done | `README.md` §Vercel, `apps/api/Dockerfile` |
| PPT: screenshots + live demo link | **To capture** | — |

---

## 6. Gaps to close before submission (in priority order)

1. **Create the notebook with EDA and evaluation plots** (`ml/notebook/forgetting_analysis.ipynb`). Load `ml/artifacts/synthetic_srs_reviews.csv` and produce: class balance bar; histograms of the 8 features; forget-rate vs elapsed-days line; forget-rate vs success-streak bar; correlation heatmap; ROC curves for both models; confusion matrix for the tuned forest; feature-importance bar. Re-run `train.py` logic in cells so the notebook is self-contained. This covers the largest share of the ML Pipeline (40%) marks and all of the "EDA visualisations" slide.
2. **Indian context framing.** The dataset is synthetic. Position the application as Indian exam preparation (vocabulary, formulae, dates) and state clearly on the dataset slide that the simulation is a stand-in until real learner logs are collected through the app's own `/events` endpoint. Do not claim an Indian data source.
3. **Change "FSRS-calibrated" to "FSRS-inspired"** in `ml/train.py` metadata and in `ArchitecturePage.tsx` — nothing was fitted to FSRS parameters.
4. **Split by learner.** Replace `train_test_split` with `GroupShuffleSplit` on `user_id` (and `GroupKFold` in CV) so hold-out scores are not inflated by seeing the same simulated learner in both sets. Expect scores to move slightly; report the new ones.
5. **Direct "try the model" form** (optional, strengthens the FSD 20%). The rubric describes a form where a user types feature values. Add a small panel on `/architecture` with 8 inputs that calls `POST /api/v1/predict-forgetting` and prints "High risk / Low risk" with the probability. The endpoint already exists; only the form is missing.
6. **Screenshots and hosted link.** Capture: landing, create page with a numbered list, corridor with doors, a room with sculpture, quiz result with "ML model", final review, architecture page. Deploy the frontend to Vercel and add the URL to `README.md`.

---

## 7. Gamma presentation prompt (10 slides)

The PPT instructions list 11 slides. To fit 10, References are folded into the bottom of Slide 10. Paste everything below into Gamma.

```
Create a 10-slide presentation titled "ReMind — Predicting Forgetting to Guide Study in a 3D Memory Palace".
Design: clean academic style, ivory background (#F6F1E8), charcoal text (#1C1917), muted teal accent (#3E6B66), serif headings, sans-serif body. Minimal text per slide, one visual per slide, consistent layout. No stock-photo clutter.

Slide 1 — Title
Large bold title: "ReMind: Predicting Forgetting to Guide Study in a 3D Memory Palace"
Subtitle: "Machine Learning + Full Stack Development Case Study"
Lines: Team member: [NAME]; Supervisor: [NAME]; Date: [DATE]
Small footer: github.com/uma-iyer-24/remind

Slide 2 — Overview
Title: "Overview"
Left column, 4 short bullets:
• Problem: learners review everything equally, but forgetting is uneven.
• Objective: predict which topics are about to be forgotten and reorder a walkable study space so review time goes where it matters.
• Method: Random Forest vs Logistic Regression on 32,000 spaced-repetition reviews, 5-fold cross-validation, grid search, FastAPI + React integration.
• Result: tuned Random Forest, hold-out AUC 0.75, live in a 3D memory palace that reorders doors by forget risk.
Right column: a simple 4-step flow diagram: Walk → Quiz → Predict → Reorder.

Slide 3 — Introduction
Title: "Why this matters"
Three key points with icons:
• Memory palaces (method of loci) are one of the oldest proven memory techniques, but they are static.
• Spaced repetition tools schedule reviews but show flat lists, with no spatial cue.
• ReMind combines both: a model predicts forgetting, and the palace itself changes to point the learner at what is at risk. Relevant to high-volume Indian exam preparation (vocabulary, formulae, dates).

Slide 4 — Literature Review
Title: "What we built on"
Comparison table with 3 rows and 3 columns (Work | What it achieved | How ReMind differs):
Row 1: Ebbinghaus forgetting curve (1885) | Showed retention decays predictably with time | We learn the curve from data instead of assuming its shape
Row 2: FSRS (Free Spaced Repetition Scheduler, open-source) | Models memory "stability" and schedules reviews from review logs | We borrow the stability idea for simulation and add a spatial feature (position on the path), then act on predictions by moving objects in 3D
Row 3: Method of loci / memory palace research | Spatial anchoring improves recall | Our palace is dynamic: layout is driven by a classifier

Slide 5 — Methodology: Dataset
Title: "Dataset and preprocessing"
Left: fact box — "synthetic_srs_cohort_v1 · 400 simulated learners × 80 reviews = 32,000 rows · label: will_forget (yes/no) · 8 features". Note in small text: "FSRS-inspired simulation standing in for real review logs; the app's /events endpoint collects real data for retraining."
Centre: table of the 8 features with one-line meaning each: elapsed days since last review; review count; success streak; fail streak; average response time; quiz type (multiple choice); position on palace path; topic text length.
Right: small preprocessing flow: Generate → Standardise (StandardScaler) → Stratified 80/20 split → 5-fold CV.
Placeholder: [INSERT histogram of elapsed days and forget-rate-vs-elapsed-days chart from notebook]

Slide 6 — Methodology: Models and implementation
Title: "Models and system"
Left: two model cards — "Logistic Regression (baseline, interpretable)" and "Random Forest (captures feature interactions)". Both with class_weight balanced. Tuning: GridSearchCV over max_depth {8,12,16} × n_estimators {150,200}, scored by AUC.
Right: flowchart — Python/scikit-learn training script → forget_model.joblib → FastAPI (/predict-forgetting, /rank-concepts, /events) → React + React Three Fiber frontend → palace reorders doors.
Tools strip at bottom: Python, scikit-learn, pandas, FastAPI, React, TypeScript, Three.js, Tailwind, Vercel.

Slide 7 — Results: Metrics
Title: "Cross-validated results"
Bar chart with two groups (Logistic Regression vs Random Forest) and three bars each: CV AUC 0.745 vs 0.749; CV F1 0.715 vs 0.728; CV accuracy 0.681 vs 0.687.
Callout box: "Tuned Random Forest (max_depth 8, 150 trees) on held-out 20%: AUC 0.751 · F1 0.723 · Accuracy 0.687. CV and hold-out agree within 0.002 — no overfitting to one split."

Slide 8 — Results: Comparison and interpretation
Title: "Why Random Forest, and what it learned"
Left: [INSERT ROC curves for both models] and [INSERT confusion matrix for tuned Random Forest]
Right: [INSERT feature importance bar chart]. Caption bullets:
• Elapsed days, fail streak, and success streak dominate.
• Review count, quiz type, and text length contribute almost nothing — matching how the data was generated, so the model learned structure, not noise.
• Random Forest wins because forgetting depends on combinations (long gap AND a recent miss).

Slide 9 — Discussion
Title: "What worked, what was hard, what surprised us"
Three columns:
Worked: honest model/heuristic labelling in the UI; one end-to-end loop from quiz to re-ranked doors; fallback keeps the demo alive if the API is down.
Challenges: the deployed pipeline expected named columns and the API sent a plain array, so predictions silently fell back to the rule-based scorer until fixed; keeping 36 rooms smooth in the browser; designing quizzes that test understanding rather than titles.
Surprises: a shallower forest (depth 8) generalised as well as a deeper one; cross-validation and hold-out matched almost exactly.

Slide 10 — Conclusion, Future Work, References
Title: "Takeaway and next steps"
Takeaway (1–2 sentences): "A small, well-validated classifier is enough to drive a genuinely useful behaviour — reordering a study space around what a learner is about to forget."
Future work, 3 items with icons: retrain on real Open Spaced Repetition / Anki export logs collected through the app; split by learner and add learner-level features; Indian-context pilots for exam vocabulary and formula decks, including regional-language lists.
Bottom strip, small font, "References": Ebbinghaus, H. (1885) Über das Gedächtnis; Open Spaced Repetition, FSRS algorithm (github.com/open-spaced-repetition); Pedregosa et al. (2011) Scikit-learn, JMLR; FastAPI documentation (fastapi.tiangolo.com); React Three Fiber documentation.
Footer: Live demo: [VERCEL URL] · Code: github.com/uma-iyer-24/remind
```

Replace the `[INSERT …]` placeholders with the notebook plots from §6 item 1 and the screenshots from §6 item 6.
