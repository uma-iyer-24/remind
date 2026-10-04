/** Full-topic semantic classification. Longer phrases win. Never uses the first word alone. */

export type SemanticId =
  | "hierarchicalClustering"
  | "kmeans"
  | "decisionTree"
  | "randomForest"
  | "gradientDescent"
  | "neuralNetwork"
  | "svm"
  | "crossValidation"
  | "regularization"
  | "linearRegression"
  | "classification"
  | "overfitting"
  | "underfitting"
  | "knn"
  | "pca"
  | "clustering"
  | "optimization"
  | "regression"
  | "graph"
  | "probability"
  | "database"
  | "sorting"
  | "recursion"
  | "generic";

const RULES: { id: SemanticId; phrases: string[] }[] = [
  { id: "hierarchicalClustering", phrases: ["hierarchical clustering", "agglomerative", "divisive clustering", "dendrogram"] },
  { id: "kmeans", phrases: ["k-means", "k means", "kmeans"] },
  { id: "randomForest", phrases: ["random forest", "random forests"] },
  { id: "decisionTree", phrases: ["decision tree", "decision trees", "cart tree"] },
  { id: "gradientDescent", phrases: ["gradient descent", "stochastic gradient", "sgd", "learning rate"] },
  { id: "neuralNetwork", phrases: ["neural network", "neural networks", "deep learning", "multilayer perceptron"] },
  { id: "svm", phrases: ["support vector", "svm"] },
  { id: "crossValidation", phrases: ["cross-validation", "cross validation", "k-fold"] },
  { id: "regularization", phrases: ["regularization", "regularisation", "ridge regression", "lasso"] },
  { id: "linearRegression", phrases: ["linear regression"] },
  { id: "overfitting", phrases: ["overfitting", "over-fitting", "overfit"] },
  { id: "underfitting", phrases: ["underfitting", "under-fitting", "underfit"] },
  { id: "knn", phrases: ["k-nearest", "k nearest", "nearest neighbor", "nearest neighbour", "knn"] },
  { id: "pca", phrases: ["principal component", "pca"] },
  { id: "classification", phrases: ["classification", "classifier"] },
  { id: "clustering", phrases: ["clustering", "cluster analysis"] },
  { id: "optimization", phrases: ["optimization", "optimise", "optimize", "learning rate"] },
  { id: "regression", phrases: ["regression"] },
  { id: "probability", phrases: ["probability", "distribution", "bayes"] },
  { id: "database", phrases: ["database", "sql", "index"] },
  { id: "sorting", phrases: ["sorting", "sort algorithm"] },
  { id: "recursion", phrases: ["recursion", "recursive"] },
  { id: "graph", phrases: ["graph", "network"] },
];

export function classifyTopic(title: string): SemanticId {
  const lower = ` ${title.toLowerCase().replace(/[_/]+/g, " ")} `;
  for (const rule of RULES) {
    if (rule.phrases.some((phrase) => lower.includes(phrase))) return rule.id;
  }
  return "generic";
}

/** Sculpture only. Phrase rules win. A leftover keyword picks a category shape. Quiz text stays on classifyTopic. */
const SCULPTURE_FALLBACK: { id: SemanticId; pattern: RegExp }[] = [
  { id: "database", pattern: /\b(sql|databases?)\b/ },
  { id: "recursion", pattern: /\brecurs/ },
  { id: "sorting", pattern: /\bsort/ },
  { id: "regression", pattern: /\bregress/ },
  { id: "clustering", pattern: /\bcluster/ },
  { id: "decisionTree", pattern: /\btree\b/ },
  { id: "graph", pattern: /\b(graphs?|networks?)\b/ },
];

export function sculptureFor(title: string): SemanticId {
  const specific = classifyTopic(title);
  if (specific !== "generic") return specific;
  const lower = title.toLowerCase().replace(/[_/]+/g, " ");
  for (const rule of SCULPTURE_FALLBACK) {
    if (rule.pattern.test(lower)) return rule.id;
  }
  return "generic";
}

export interface TopicKnowledge {
  definition: string;
  hook: string;
  application: string;
  distinction: string;
  scenarioPrompt: string;
  scenarioAnswer: string;
}

const KB: Record<Exclude<SemanticId, "generic">, TopicKnowledge> = {
  hierarchicalClustering: {
    definition: "It builds a hierarchy of clusters by progressively merging or splitting groups of similar points.",
    hook: "A family tree of groups: small clusters join into larger ones.",
    application: "Use it when you want nested group relationships and do not want to fix the number of clusters first.",
    distinction: "Unlike k-means, it does not start from a chosen k. It reveals a tree of merges.",
    scenarioPrompt: "You do not know how many clusters exist and want to inspect nested groupings. Which method fits?",
    scenarioAnswer: "Hierarchical clustering, because it produces a merge tree instead of one flat partition.",
  },
  kmeans: {
    definition: "It assigns points to a chosen number of clusters by moving centers toward the mean of nearby points.",
    hook: "Several piles of points, each gathered around its own center.",
    application: "Use it when you already have a reasonable number of groups and want a flat partition.",
    distinction: "Unlike hierarchical clustering, you must choose k before you start.",
    scenarioPrompt: "You know you want exactly four customer groups. Which method is the direct fit?",
    scenarioAnswer: "K-means, because it partitions data into a fixed number of centers.",
  },
  decisionTree: {
    definition: "It splits data with a sequence of yes/no questions until each leaf predicts a label or value.",
    hook: "A tree: each branch is a question, each leaf is a decision.",
    application: "Use it when you want a model a person can read as a flowchart.",
    distinction: "A single tree is one flowchart. A random forest is many trees voting together.",
    scenarioPrompt: "You need a readable flowchart of decisions. Which model matches?",
    scenarioAnswer: "A decision tree, because each split is an explicit question.",
  },
  randomForest: {
    definition: "It trains many decision trees on different samples and lets them vote.",
    hook: "A grove of trees, not one trunk.",
    application: "Use it when one tree overfits and you want a more stable vote.",
    distinction: "It is an ensemble of trees, not a single decision tree and not a neural net.",
    scenarioPrompt: "One decision tree memorizes the training set. What related method averages many trees?",
    scenarioAnswer: "A random forest, which lets many trees vote.",
  },
  gradientDescent: {
    definition: "It repeatedly steps parameters in the direction that most reduces the loss.",
    hook: "A ball rolling downhill toward the lowest point.",
    application: "Use it to fit models whose loss you can differentiate, including neural networks.",
    distinction: "The learning rate sets the step size. It does not choose the number of clusters.",
    scenarioPrompt: "Which technique uses a learning rate to control how far parameters move each update?",
    scenarioAnswer: "Gradient descent, because the learning rate is the size of each downhill step.",
  },
  neuralNetwork: {
    definition: "It passes inputs through layers of connected nodes, each applying a weighted sum and a nonlinearity.",
    hook: "Beads in rows, with threads between the rows.",
    application: "Use it when the relationship is complex and you have enough data to learn features.",
    distinction: "Layers of weighted connections are not a single tree split and not a separating hyperplane.",
    scenarioPrompt: "Which model is built from stacked layers of connected units?",
    scenarioAnswer: "A neural network.",
  },
  svm: {
    definition: "It finds a boundary that separates classes with the widest possible margin.",
    hook: "Two crowds held apart by a clear fence.",
    application: "Use it for classification when a wide, stable boundary matters.",
    distinction: "It separates classes with a margin. It does not build a cluster hierarchy.",
    scenarioPrompt: "You want the widest gap between two classes. Which method looks for that margin?",
    scenarioAnswer: "A support vector machine.",
  },
  crossValidation: {
    definition: "It rotates which slice of data is held out so every fold is used once for testing.",
    hook: "A stack of folders: one is the test fold, the rest train.",
    application: "Use it to estimate generalization before touching a final test set.",
    distinction: "It is an evaluation procedure, not a model like a tree or a network.",
    scenarioPrompt: "You want a fair estimate of accuracy without a single lucky split. What procedure fits?",
    scenarioAnswer: "Cross-validation, which rotates the held-out fold.",
  },
  regularization: {
    definition: "It adds a penalty on large weights so the model stays simpler and generalizes better.",
    hook: "A fence around the weights so they cannot grow without a cost.",
    application: "Use it when the model fits training noise and you want to restrain complexity.",
    distinction: "It constrains the model. It is not the same as collecting more clusters.",
    scenarioPrompt: "Training error is tiny but weights are huge. What idea directly penalizes that?",
    scenarioAnswer: "Regularization, which charges a cost for large parameters.",
  },
  linearRegression: {
    definition: "It fits a straight line (or plane) that best predicts a numeric target from the inputs.",
    hook: "A taut string through a cloud of points.",
    application: "Use it when the relationship is roughly linear and the target is a number.",
    distinction: "The output is a continuous fit, not a class label from a tree.",
    scenarioPrompt: "You want to predict a number with a straight relationship. Which method is the baseline?",
    scenarioAnswer: "Linear regression.",
  },
  classification: {
    definition: "It assigns each example to one of a set of discrete categories.",
    hook: "Objects sorted into labeled bins.",
    application: "Use it when the answer is a category, not a number.",
    distinction: "Classification predicts a label. Regression predicts a quantity.",
    scenarioPrompt: "The target is spam or not spam. What kind of task is that?",
    scenarioAnswer: "Classification, because the output is a category.",
  },
  overfitting: {
    definition: "The model follows training points so closely that it fails on new data.",
    hook: "A line that bends to touch every dot, including the noise.",
    application: "Recognize it when training scores are excellent and held-out scores collapse.",
    distinction: "Overfitting is too much flexibility. Underfitting is too little.",
    scenarioPrompt: "A model is nearly perfect on training data and poor on unseen data. Which concept is that?",
    scenarioAnswer: "Overfitting.",
  },
  underfitting: {
    definition: "The model is too simple to capture the real pattern, so it fails even on training data.",
    hook: "A stiff ruler laid across a curve it cannot follow.",
    application: "Recognize it when both training and test error stay high.",
    distinction: "Underfitting lacks capacity. Overfitting has too much and memorizes noise.",
    scenarioPrompt: "Both training and test error are high for a very simple model. What is happening?",
    scenarioAnswer: "Underfitting.",
  },
  knn: {
    definition: "It predicts a point from the labels of the closest stored examples.",
    hook: "A query dot with a ring of nearest neighbors.",
    application: "Use it when similar past examples should vote on a new one.",
    distinction: "It memorizes examples. It does not fit a global line or a weight vector.",
    scenarioPrompt: "A new point should inherit the label of nearby examples. Which method does that?",
    scenarioAnswer: "K-nearest neighbors.",
  },
  pca: {
    definition: "It projects many features onto a few axes that keep the most variation.",
    hook: "A cloud of points pressed onto a flatter sheet.",
    application: "Use it to compress features or to see the main directions of spread.",
    distinction: "It reduces dimensions. It does not assign cluster labels by itself.",
    scenarioPrompt: "You have dozens of correlated measurements and want a few summary axes. What fits?",
    scenarioAnswer: "Principal component analysis.",
  },
  clustering: {
    definition: "It groups similar points together without using predefined labels.",
    hook: "Unlabeled objects gathering into visible piles.",
    application: "Use it to discover structure when you do not have category labels.",
    distinction: "Clustering is unsupervised grouping. Classification uses known labels.",
    scenarioPrompt: "You have no labels and want to discover groups. What family of methods fits?",
    scenarioAnswer: "Clustering.",
  },
  optimization: {
    definition: "It searches for parameter values that make an objective better.",
    hook: "A path stepping toward a lower valley.",
    application: "Use it whenever a model is fit by minimizing a loss.",
    distinction: "Optimization updates parameters. It is not a data-splitting procedure.",
    scenarioPrompt: "You need to move weights to reduce a loss. What are you doing?",
    scenarioAnswer: "Optimization.",
  },
  regression: {
    definition: "It predicts a numeric value rather than a category.",
    hook: "A fitted curve through measured points.",
    application: "Use it when the answer is a quantity such as price or temperature.",
    distinction: "Regression outputs a number. Classification outputs a class.",
    scenarioPrompt: "You must predict house price. What kind of task is that?",
    scenarioAnswer: "Regression.",
  },
  graph: {
    definition: "It represents entities as nodes and relationships as edges.",
    hook: "Dots joined by lines.",
    application: "Use it when connections matter as much as the items themselves.",
    distinction: "A graph stores links. A list does not show who connects to whom.",
    scenarioPrompt: "Friendships between people are the data. What structure fits?",
    scenarioAnswer: "A graph of nodes and edges.",
  },
  probability: {
    definition: "It describes how likely different outcomes are.",
    hook: "A curve showing which outcomes are common and which are rare.",
    application: "Use it to reason under uncertainty instead of a single certain label.",
    distinction: "Probability is a measure of chance, not a clustering algorithm.",
    scenarioPrompt: "You need the chance of each class, not only the winning class. What idea is that?",
    scenarioAnswer: "Probability.",
  },
  database: {
    definition: "It stores structured records so they can be queried reliably.",
    hook: "Stacked disks of records.",
    application: "Use it when data must be saved, filtered, and joined.",
    distinction: "A database persists records. A model learns a pattern from them.",
    scenarioPrompt: "You need durable tables you can query. What are you using?",
    scenarioAnswer: "A database.",
  },
  sorting: {
    definition: "It rearranges items into a defined order.",
    hook: "Blocks lined up from small to large.",
    application: "Use it when order itself is the goal or a step toward faster search.",
    distinction: "Sorting orders items. Clustering groups similar ones without a total order.",
    scenarioPrompt: "You need names in alphabetical order. What are you doing?",
    scenarioAnswer: "Sorting.",
  },
  recursion: {
    definition: "A procedure solves a problem by calling itself on a smaller piece.",
    hook: "The same shape nested inside itself, getting smaller.",
    application: "Use it for trees, nested structures, and divide-and-conquer steps.",
    distinction: "Recursion repeats a function on a smaller input. A loop repeats a block in place.",
    scenarioPrompt: "A function handles a tree by calling itself on each subtree. What pattern is that?",
    scenarioAnswer: "Recursion.",
  },
};

export function knowledgeFor(title: string): TopicKnowledge & { semanticId: SemanticId } {
  const semanticId = classifyTopic(title);
  if (semanticId === "generic") {
    return {
      semanticId,
      definition: `${title} is a distinct idea in this palace. Recall what it does, when you would use it, and how it differs from the neighboring topics.`,
      hook: `Picture “${title}” as one physical object you can walk back to.`,
      application: `Choose ${title} when the problem matches that idea more closely than the other topics here.`,
      distinction: `${title} is not interchangeable with the other topics in this palace.`,
      scenarioPrompt: `Which statement best captures “${title}”?`,
      scenarioAnswer: `Treat “${title}” as its own idea: what it does, when to use it, and how it differs from the other topics.`,
    };
  }
  return { semanticId, ...KB[semanticId] };
}
