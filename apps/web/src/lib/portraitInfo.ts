/** Portrait art + extra study lines (demo KB). */

export interface PortraitMeta {
  glyph: string;
  subtitle: string;
  facts: string[];
}

const META: Record<string, PortraitMeta> = {
  cv: {
    glyph: "🔄",
    subtitle: "Generalization check",
    facts: [
      "k-fold CV trains on k−1 folds and validates on the held-out fold, rotating until every fold is used once.",
      "Helps detect overfitting before you touch the final test set.",
      "Common choice: k=5 or k=10 for medium-sized tabular datasets.",
    ],
  },
  "bias-variance": {
    glyph: "⚖️",
    subtitle: "Fit vs flexibility",
    facts: [
      "High bias → underfitting; high variance → overfitting on training noise.",
      "Regularization and simpler models reduce variance; more features/complexity can reduce bias.",
      "Goal: lowest total error on unseen data, not zero training error.",
    ],
  },
  "gradient-descent": {
    glyph: "📉",
    subtitle: "Optimization core",
    facts: [
      "Updates weights in the direction that most reduces the loss locally.",
      "Learning rate controls step size — too big oscillates, too small slows convergence.",
      "Variants: SGD, mini-batch, Adam add momentum or adaptive steps.",
    ],
  },
  regularization: {
    glyph: "🧷",
    subtitle: "Keep weights tame",
    facts: [
      "L2 (Ridge) shrinks weights smoothly; L1 (Lasso) can zero some features out.",
      "Dropout and early stopping are also forms of regularization.",
      "Trade-off: stronger penalty → simpler model, may underfit if too harsh.",
    ],
  },
  "precision-recall": {
    glyph: "🎯",
    subtitle: "Imbalanced classes",
    facts: [
      "Precision answers: “Of my positive calls, how many were right?”",
      "Recall answers: “Of all true positives, how many did I find?”",
      "Use both when false positives and false negatives have different costs.",
    ],
  },
  "roc-auc": {
    glyph: "🏔️",
    subtitle: "Ranking quality",
    facts: [
      "ROC plots true positive rate vs false positive rate across thresholds.",
      "AUC ≈ 1.0 means excellent ranking; 0.5 is random guessing.",
      "Useful when you care about ordering scores, not one fixed threshold.",
    ],
  },
  "feature-engineering": {
    glyph: "💎",
    subtitle: "Signal crafting",
    facts: [
      "Good features make patterns easier for models to learn with less data.",
      "Examples: log transforms, interaction terms, date parts, text n-grams.",
      "Domain knowledge often beats raw algorithm tuning alone.",
    ],
  },
  "data-leakage": {
    glyph: "🚰",
    subtitle: "Metrics lie quietly",
    facts: [
      "Leakage happens when test information influences training (e.g. scaling on full dataset).",
      "Target leakage uses future or label-derived columns as inputs.",
      "Fix: fit preprocessors only on training folds inside CV pipelines.",
    ],
  },
  "k-fold": {
    glyph: "🥧",
    subtitle: "CV workhorse",
    facts: [
      "Each of k partitions gets one turn as the validation set.",
      "Stratified k-fold preserves class ratios in classification tasks.",
      "Average metric across folds estimates out-of-sample performance.",
    ],
  },
  hyperparameters: {
    glyph: "🎛️",
    subtitle: "Tuning knobs",
    facts: [
      "Not learned from gradient descent — chosen by search or domain rules.",
      "Grid search tries a lattice; random search often finds good configs faster in high dimensions.",
      "Always validate with CV, never on the test set.",
    ],
  },
  ensemble: {
    glyph: "🎭",
    subtitle: "Many models, one vote",
    facts: [
      "Bagging (e.g. Random Forest) reduces variance by averaging decorrelated trees.",
      "Boosting sequentially corrects errors — watch for overfitting on noisy data.",
      "Diversity among base learners improves ensemble gains.",
    ],
  },
  overfitting: {
    glyph: "🌿",
    subtitle: "Memorization trap",
    facts: [
      "Training accuracy keeps rising while validation error starts climbing.",
      "Signs: very deep trees, tiny datasets, too many features vs samples.",
      "Mitigate with regularization, more data, simpler models, or better CV.",
    ],
  },
  embedding: {
    glyph: "✨",
    subtitle: "Meaning in vectors",
    facts: [
      "Similar items get nearby vectors in continuous space.",
      "Used in word2vec, item recommenders, and deep learning input layers.",
      "Distance (cosine, L2) proxies semantic similarity after training.",
    ],
  },
  loss: {
    glyph: "🔥",
    subtitle: "What we minimize",
    facts: [
      "MSE for regression; cross-entropy for classification are common choices.",
      "The loss landscape shape guides how optimization behaves.",
      "Custom losses encode business costs (e.g. asymmetric false positives).",
    ],
  },
  "learning-rate": {
    glyph: "👣",
    subtitle: "Step size",
    facts: [
      "Too high → loss spikes or NaNs; too low → training takes forever.",
      "Learning rate schedules decay steps over epochs for fine convergence.",
      "Often the first hyperparameter to tune when training neural nets.",
    ],
  },
};

export function getPortraitMeta(conceptId: string, title: string): PortraitMeta {
  return (
    META[conceptId] ?? {
      glyph: "📚",
      subtitle: "Study focus",
      facts: [
        `Anchor "${title}" to this room's colours and objects.`,
        "Revisit the wall plaques for hooks before quizzing.",
        "Spatial memory works best when you tie ideas to distinct places.",
      ],
    }
  );
}
