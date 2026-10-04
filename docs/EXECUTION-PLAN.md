# ReMind — Palace execution plan

**Status:** In progress. Phases 1–10 are largely in the running app. This document is the product spec for the spatial palace and the checklist for what is still open.

`docs/DESIGN.md` remains the original rubric and ML-pipeline plan. Where they disagree on the palace (topic cap, first-word props, indigo/amber chrome, arcade color), this document wins.

Do not rebuild the app. Do not replace working components wholesale. Do not label a heuristic as a model prediction.

---

## 1. Architecture (as built)

| Layer | Where | What it does |
|-------|--------|----------------|
| Web | `apps/web` — React 18, Vite, Tailwind, Zustand persist (`remind-session`), React Three Fiber + drei, Framer Motion | Routes: `/`, `/create`, `/palace`, `/architecture` |
| API | `apps/api` — FastAPI | `POST /api/v1/rank-concepts`, `POST /api/v1/predict-forgetting`, `POST /api/v1/events`, `GET /health` |
| Model | scikit-learn Random Forest, `forget_model.joblib` via `ml_service.py` | Predicts **forgetting probability** and reorders doors. It does not classify topics or write quiz text. |
| Fallback | `apps/web/src/lib/api.ts` `heuristicRank` | Same job as the API when it is unreachable. UI must say `model` or `heuristic` (`scoringSource`). |
| Deploy | Root `vercel.json` builds `apps/web` only. API is a separate host (local `:8000`). Vite proxies `/api`. | No LLM. No env var is required for the palace to run; the model file is bundled with the API. |

### Topic path

```
textarea
  → parseTopicLines          (one line = one topic)
  → conceptsFromLines        (full title kept)
  → classifyTopic            (full string, longer phrase wins)
  → knowledgeFor             (definition, hook, use, distinction, scenario)
  → session.concepts         (Zustand, persisted)
  → MemorySculpture          (SemanticId → procedural mesh)
  → room quiz / final quiz   (knowledge text, never the title as the answer)
```

### Palace path

`getPalaceSlot` places one room per concept along `-Z`. `DOOR_SPACING` is `6.2` (room depth along the corridor is about `5.5`, so spacing must stay above that or rooms intersect). The player position lives in refs. `RenderBudget` pauses the WebGL loop when the tab is hidden, the window is blurred, or a panel blocks the view.

Forget-model ranking still sets `pathIndex` and labels the most fragile topic. The HUD “next topic” queue is separate: unseen topics first, then lowest mastery. Those two orders can disagree; that is an open product choice, not a bug in the model.

---

## 2. Design principles

The palace should feel like a calm library or museum: concepts turned into physical objects the learner can walk back to.

Attention stays on the concept. A visual element earns its place only if it helps memory, shows progress, gives feedback, or helps navigation.

Palette for UI and architecture: ivory, charcoal, muted gray, beige, muted teal, restrained brass. Color in a sculpture may carry meaning (cluster groups, a slope, a margin). Saturated rainbow chrome does not.

Scoring is recall, not an exam grade. Unseen topics stay out of the average. The forgetting model is never described as having written a quiz or classified a topic.

---

## 3. Requirements and current status

### Phase 1 — Topic input

**Requirement.** One non-empty line is one topic. No cap. Ignore blank lines and extra whitespace. Strip `1.` / `1)` / `-` / `*` markers (up to a few stacked). Keep commas inside the title. Show the format, a short example, and a live count. Block Build when the count is 0.

**Now.** `parseTopics.ts` and `CreatePage.tsx` do this. `session.ts` no longer slices to 30. Create page uses the ivory field.

**Open.** Landing page is still the dark indigo/amber hero. Demo-deck start skips the textarea, which is fine; the cap must stay off that path too (it does).

### Phase 2 — Full topic through the model

**Requirement.** Never `split(" ")[0]`. The stored title, label, quiz target, and sculpture classifier all see the same string.

**Now.** `conceptsFromLines` stores the full line. `classifyTopic` matches phrases inside the full lowercased title. Longer rules are listed before shorter ones (`random forest` before anything tree-like; bare `tree` is not a rule, so “family tree” does not become a decision tree).

**Open.** Demo-deck titles that miss every phrase (`Bias–variance`, `Precision & recall`, `ROC-AUC`, and similar) stay `generic` and keep the deck’s real definition for the quiz. That is correct. They still need a category fallback that is more than a pedestal mark when a keyword fits (`tree`, `network`, `graph`, and so on). `prop-map.json` remains the generic-shape fallback only.

### Phase 3 — Semantic sculptures

**Requirement.** A reusable map: full title → `SemanticId` → procedural object with a compact footprint, a label, and a hook. Supported shapes:

| Topic idea | Object |
|------------|--------|
| Decision tree | Trunk, branches, nodes, leaves |
| Hierarchical clustering | Merge tree |
| K-means / clustering | Piles around centers |
| Gradient descent / optimization | Ball on a slope |
| Neural network | Layered nodes and links |
| SVM / classification | Points and a margin |
| Random forest | Several trees |
| Cross-validation | Folds |
| Regularization | A fence around a fit |
| Regression | Line through points; overfitting wavy; underfitting a stiff ruler |
| KNN | Query point and neighbors |
| PCA | Points projected onto a plane |
| Graph | Connected nodes |
| Probability | A distribution |
| Database | Stacked disks |
| Sorting | Ordered blocks |
| Recursion | Nested repeats |
| Anything else | Category keyword, then a quiet pedestal — never a random primitive |

**Now.** `topicKnowledge.ts` is the classifier and the knowledge base. `MemorySculpture.tsx` switches on `SemanticId` and builds those meshes from a small muted material set (ink, paper, leaf, wood, teal, clay, sand). The room shows the full title under the sculpture (truncated in the mesh at 42 characters; the stored title is unchanged).

**Open.** Hover is not a separate state. A title with no phrase match and no category keyword is still `PedestalMark`. The foyer is calmer than the old manor, and the landing page is still the dark hero.

### Phase 4 — Quizzes and learning state

**Requirement.** A room quiz tests the room’s topic: definition, use, distinction, scenario, recognition of the *idea*. Options are explanations from other topics, not titles. No duplicate options. State per topic: `new → encountered → reviewed → mastered`, plus attempts, last result, mastery in `[0, 1]`.

**Now.** `buildQuizQuestions` builds five templates from `knowledgeFor`. Distractors are other topics’ definition, application, distinction, scenario, or hook. Titles are not answers. `recordQuiz` sets `encountered`, updates streaks, and sets mastery:

- pass: `min(1, prev * 0.35 + ratio * 0.65)`
- fail: `max(0, prev * 0.55 + ratio * 0.25)`

New topics start at mastery `0`. Overall recall is the mean of **encountered** topics only. “Next topic” prefers unseen, then lowest mastery.

**Open.** Question order inside a room is fixed (meaning, use, distinct, scene, hook), not chosen from a weakness. Shuffle uses `Math.random`, so a refresh changes option order; that is acceptable. Generic deck topics reuse the stored definition for meaning/use, so those two stems can feel close.

### Phase 5 — Room layout

**Requirement.** One clear centerpiece, empty space around it, deterministic placement, no accidental overlap. Secondary objects smaller. Decor very quiet.

**Now.** Sculpture sits on the study table at the center with the title beneath it. Extra gem tidbit on the portrait wall is gone. Rug is muted burgundy and beige. “Topic reviewed” appears as small text after a quiz (`encountered` or `reviewCount > 0`).

**Open.** A reviewed room still holds a fireplace, portrait, bookshelf, window, chair, plant, and two wall notes. Those compete with the sculpture. Target layout:

- center: sculpture (largest) and label
- one side: portrait / memory hook
- other side: one quiet support (chair or plant, not both plus a lamp)
- back: one context piece

Same topic list must keep the same arrangement. It already does, because placement is not random.

### Phase 6 — Corridor

**Requirement.** Short gallery, not a long empty hall. Rooms in walk order, then a final review. Subtle landmarks and plaques. Quotes stay small.

**Now.** `DOOR_SPACING = 6.2`. Walls are `palaceTheme.wall` (cream). Chair rail is trim. Sconces every third bay, warm shade. Rainbow paintings removed from the corridor. `HALL_QUOTES` are plaques (“Small steps become lasting memories.” and the other four lines from the spec). A finale marker (`__finale__`) sits past the last door; `E` opens the final quiz.

**Open.** Foyer art and plants are still the older colorful manor. Quote spacing is even along corridor length; with many topics the plaques should not stack on doors. Keep at least one clear step of floor between a door and a plaque.

### Phase 7 — Progress

**Requirement.** Always visible. Based on topics reviewed, not distance walked. Example: `7 / 10 topics explored`. Must not cover the 3D view.

**Now.** Palace header shows explored count and a bar. Explored means `encountered` or `reviewCount > 0`.

### Phase 8 — Recall score

**Requirement.** Persistent. Weighted average of encountered topics. Unseen topics do not inflate it. Labeled as recall, not a grade.

**Now.** Header shows `Recall —` until the first review, then the percentage. Portrait popup repeats `Topic reviewed · recall N%` after a review.

### Phase 9 — Final review

**Requirement.** End of the hall. Mixed conceptual questions across the user’s topics, different stems from the room quiz where possible. Results: topics explored, questions answered, correct count, overall recall, per-topic breakdown.

**Now.** `FinalQuizPanel` asks up to 8 questions. A topic with `reviewCount > 0` skips the five room styles and gets a transfer or contrast question instead. Finishing the check calls `recordFinalReview`, which updates mastery for the topics that were asked and does not re-rank doors.

### Phase 10 — HUD and neutral UI

**Requirement.** Top left: where and which topic. Top right: progress and recall. Center: the 3D view. A small panel for the current object. No neon, no full-screen chrome.

**Now.** `PalaceHud` and `PalacePage` header are ivory and charcoal. HUD names the section, the topic, progress, recall, and the next topic. Forget probability stays available and is labeled with its source.

**Open.** Landing, architecture page, and foyer still use the original dark/amber look. Bring those surfaces onto the same ivory system without rewriting their content.

### Phase 11 — Performance

**Requirement.** Keep the existing pause-when-hidden behavior, refs for the player, no per-frame React state, shared materials, few lights.

**Now.** `RenderBudget`, dpr cap, no shadows, room lights only while inside, portrait texture cache, corridor sconces thinned. Preserve these in every later edit.

**Open.** Large topic counts still spawn one room mesh group each. If a list is very long, mount only rooms near the player. Do not instance the semantic sculptures until a list is actually slow; they are the memory and should stay readable.

---

## 4. Learning state

```
new          encountered = false, reviewCount = 0, mastery = 0
encountered  player opened the room or the portrait
reviewed     reviewCount > 0 (a room quiz was submitted)
mastered     mastery is high (display threshold: 0.8) after repeated correct reviews
```

Room quiz is only the current concept. The walk queue for “what next” uses learning state. Door order from the forgetting model is a separate signal (“fragile”), shown as such.

Overall recall:

```
seen = concepts where encountered
recall = round(mean(seen.mastery) * 100)    if seen is empty, show an em dash
```

---

## 5. What must stay true about ML

- Topic meaning is a deterministic phrase table in `topicKnowledge.ts`. It is not a model output.
- Forgetting probability and door rank come from the Random Forest when `/api/v1/rank-concepts` returns `source: "model"`.
- If the API is down, `heuristicRank` runs and the UI says heuristic.
- Final-quiz text is the same knowledge table. Do not add an LLM call to “sound smarter.”
- Custom lines that miss the table get a generic explanation that is not the title string. If the demo deck already has a real definition, keep that definition.

---

## 6. Remaining work (in order)

1. **Calm the foyer** — done. Cream walls, charcoal trim, muted rugs, two quiet plaques, brass columns. Entrance copy points down the gallery.
2. **Thin each room** — done. Center table holds the sculpture and title. Portrait on the left wall, one chair, one plaque, one back window. Room shells are cream.
3. **Category fallback** — done. After the phrase rules, a whole-word keyword picks the sculpture: tree, network, graph, cluster, regress, sort, recurs, sql, database. Quiz text still uses the phrase table. Anything else stays a pedestal.
4. **Final quiz writes mastery** — done. Topics that were asked get a recall update. Door order is not re-ranked. A topic that already had a room quiz skips those five question styles.
5. **Landing and architecture chrome** — done. Ivory pages, charcoal type, teal labels. The plain-English “How it works” section is still there.
6. **Browser pass** — done. A numbered list of 36 lines (blank line ignored, commas kept) built a palace. Recall stayed blank until the Decision Trees room quiz, then showed 65%. Doors along the corridor stay separated. The sculpture sits above the bottom prompt. The final check wrote recall for the topics it asked and left door order unchanged.
7. **Far-room culling** — not needed. With 36 rooms loaded, frame time stayed near 9ms at the 95th percentile. `RenderBudget` stays.

After each step, `npx tsc --noEmit` in `apps/web` must pass, and a room quiz must still update mastery and show `model` or `heuristic` honestly.

---

## 7. Acceptance checklist

| Criterion | Status |
|-----------|--------|
| More than 30 topics can be entered | Done |
| One topic = one line; blanks ignored; bullets stripped; commas kept | Done |
| Format example and live count; empty input blocked | Done |
| Full topic string preserved; no first-word split | Done |
| Semantic sculptures for the listed ML ideas | Done |
| Decision tree, hierarchy, descent, and network read as those ideas | Done in `MemorySculpture` |
| Unknown topics fall back by keyword, not a random primitive | Done |
| Room quiz tests understanding; answers are not titles | Done |
| Distractors come from other topics’ explanations | Done |
| Room quiz matches the current topic | Done |
| Per-topic learning state and recall over encountered topics only | Done |
| Progress and recall visible without covering the view | Done |
| Rooms closer; corridor shorter; quote plaques | Done (`DOOR_SPACING` 6.2) |
| “Topic reviewed” after a room quiz | Done |
| Final review at the end, with per-topic breakdown | Done |
| Neutral palette on the walk and the create page | Done |
| Neutral palette on the foyer | Done |
| Neutral palette on landing and architecture | Done |
| Room clutter reduced to a single focal object | Done |
| Smooth with a long list; existing pause behavior kept | Done. 36 rooms stayed smooth; culling not added |
| Forgetting model still real, and heuristics labeled | Done |

Success is a student who can look at the object the next day and name the concept, and who can answer why it works, not only what it is called.
