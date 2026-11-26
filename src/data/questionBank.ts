import { QuizDifficulty, QuizQuestion } from '../types/academic';

export const BUILTIN_QUESTION_BANK: QuizQuestion[] = [
  // Data Structures & Algorithms
  {
    id: 'q_cs_1',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Time Complexity & Trees',
    difficulty: 'easy',
    question: 'What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (AVL or Red-Black Tree)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'A balanced BST maintains a height of O(log n), so root-to-leaf search takes O(log n) comparisons in the worst case.',
  },
  {
    id: 'q_cs_2',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Graph Traversal',
    difficulty: 'easy',
    question: 'Which data structure is primarily used to implement Breadth-First Search (BFS) on a graph?',
    options: ['Stack', 'Queue', 'Min-Heap', 'Disjoint Set'],
    correctIndex: 1,
    explanation: 'BFS visits nodes level by level using a FIFO Queue so neighbors discovered earlier are expanded before deeper nodes.',
  },
  {
    id: 'q_cs_3',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Sorting Algorithms',
    difficulty: 'medium',
    question: 'Which sorting algorithm guarantees O(n log n) worst-case time complexity while remaining stable?',
    options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Insertion Sort'],
    correctIndex: 2,
    explanation: 'Merge Sort always splits and merges in O(n log n) worst-case time and preserves relative order of equal keys when implemented properly.',
  },
  {
    id: 'q_cs_4',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Shortest Paths',
    difficulty: 'medium',
    question: 'Why does Dijkstra’s algorithm fail when a graph contains negative edge weights?',
    options: [
      'The priority queue overflows with negative keys',
      'Once a vertex is finalized, a later path with a negative edge could still shorten its distance',
      'Dijkstra cannot handle directed graphs',
      'Negative weights always create infinite cycles',
    ],
    correctIndex: 1,
    explanation: 'Dijkstra greedily assumes finalized shortest distances cannot be improved later, which breaks if a future negative-weight edge reduces a path cost.',
  },
  {
    id: 'q_cs_5',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming',
    difficulty: 'hard',
    question: 'In 0/1 Knapsack with N items and capacity W, how can space complexity be reduced from O(N·W) to O(W)?',
    options: [
      'Sort items by weight first',
      'Use a 1D array and iterate capacity from W down to item weight',
      'Iterate capacity from 0 up to W in a 1D array',
      'Replace DP with binary search on value',
    ],
    correctIndex: 1,
    explanation: 'Iterating capacity backward from W down to weight[i] ensures each item is considered at most once using only the previous row values.',
  },
  {
    id: 'q_cs_6',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Hashing & Amortized Analysis',
    difficulty: 'hard',
    question: 'What is the amortized time complexity of n consecutive push operations on a dynamic array that doubles capacity when full?',
    options: ['O(1) per push', 'O(log n) per push', 'O(n) per push', 'O(sqrt(n)) per push'],
    correctIndex: 0,
    explanation: 'Although resizing takes O(k) work, doubling guarantees copy costs sum to < 2n across n pushes, yielding O(1) amortized time per operation.',
  },
  {
    id: 'q_cs_7',
    subjectName: 'Data Structures & Algorithms',
    topic: 'Heaps',
    difficulty: 'medium',
    question: 'What is the tightest time complexity to build a binary heap in-place from an unsorted array of n elements (Floyd’s algorithm)?',
    options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctIndex: 1,
    explanation: 'Bottom-up heapify performs sift-down on nodes near the leaves where heights are small; the geometric series sums to O(n).',
  },

  // Linear Algebra & Vector Calculus
  {
    id: 'q_math_1',
    subjectName: 'Linear Algebra & Vector Calculus',
    topic: 'Eigenvalues & Matrices',
    difficulty: 'easy',
    question: 'If a square matrix A has an eigenvalue of 0, what can be concluded about A?',
    options: [
      'A is orthogonal',
      'A is singular (non-invertible)',
      'A must be symmetric',
      'The trace of A is 0',
    ],
    correctIndex: 1,
    explanation: 'An eigenvalue of 0 implies det(A - 0I) = det(A) = 0, meaning A has a non-trivial null space and is not invertible.',
  },
  {
    id: 'q_math_2',
    subjectName: 'Linear Algebra & Vector Calculus',
    topic: 'Vector Spaces',
    difficulty: 'easy',
    question: 'By the Rank-Nullity Theorem, for an m × n matrix A, what does rank(A) + nullity(A) equal?',
    options: ['m', 'n', 'm + n', 'm - n'],
    correctIndex: 1,
    explanation: 'The dimension of the column space (rank) plus the dimension of the null space (nullity) equals the number of columns n.',
  },
  {
    id: 'q_math_3',
    subjectName: 'Linear Algebra & Vector Calculus',
    topic: 'Orthogonality',
    difficulty: 'medium',
    question: 'Which statement is always true for a real symmetric matrix S?',
    options: [
      'All eigenvalues are positive',
      'Eigenvectors corresponding to distinct eigenvalues are orthogonal',
      'Its determinant is always 1',
      'It cannot have repeated eigenvalues',
    ],
    correctIndex: 1,
    explanation: 'By the Spectral Theorem, real symmetric matrices have real eigenvalues and eigenvectors from distinct eigenspaces are mutually orthogonal.',
  },
  {
    id: 'q_math_4',
    subjectName: 'Linear Algebra & Vector Calculus',
    topic: 'Multivariable Calculus',
    difficulty: 'medium',
    question: 'What does the gradient vector ∇f(x, y) represent geometrically at a differentiable point?',
    options: [
      'Direction of zero change along the surface',
      'Direction of steepest ascent, perpendicular to the level curve',
      'The curvature of the tangent plane',
      'The curl of the scalar field',
    ],
    correctIndex: 1,
    explanation: 'The directional derivative D_u f = ∇f · u is maximized when u points in the direction of ∇f, which is orthogonal to the level set.',
  },
  {
    id: 'q_math_5',
    subjectName: 'Linear Algebra & Vector Calculus',
    topic: 'SVD & Projections',
    difficulty: 'hard',
    question: 'In Singular Value Decomposition A = UΣV^T, the non-zero singular values of A are the square roots of the eigenvalues of which matrix?',
    options: ['A + A^T', 'A^T A', 'A^-1', 'U V^T'],
    correctIndex: 1,
    explanation: 'Since A^T A = V (Σ^T Σ) V^T, the eigenvalues of A^T A are σ_i^2, so singular values σ_i = sqrt(λ_i(A^T A)).',
  },
  {
    id: 'q_math_6',
    subjectName: 'Linear Algebra & Vector Calculus',
    topic: 'Vector Calculus Theorems',
    difficulty: 'hard',
    question: 'According to the Divergence Theorem (Gauss’s Theorem), the outward flux of a vector field F across a closed surface S equals:',
    options: [
      'The line integral of F around the boundary',
      'The triple integral of ∇ · F over the enclosed volume V',
      'The surface integral of ∇ × F over S',
      'Zero for every smooth field',
    ],
    correctIndex: 1,
    explanation: 'The Divergence Theorem equates total outward flux ∬_S F · dS to the volume integral of divergence ∭_V (∇ · F) dV.',
  },

  // Thermodynamics & Statistical Mechanics
  {
    id: 'q_phys_1',
    subjectName: 'Thermodynamics & Statistical Mechanics',
    topic: 'Laws of Thermodynamics',
    difficulty: 'easy',
    question: 'In an isothermal expansion of an ideal gas, what is the change in internal energy ΔU?',
    options: ['Positive', 'Negative', 'Zero', 'Equal to work done'],
    correctIndex: 2,
    explanation: 'For an ideal gas, internal energy depends solely on temperature (U = f/2 nRT). Constant temperature means ΔT = 0, so ΔU = 0.',
  },
  {
    id: 'q_phys_2',
    subjectName: 'Thermodynamics & Statistical Mechanics',
    topic: 'Heat Engines',
    difficulty: 'easy',
    question: 'What is the maximum theoretical efficiency of a Carnot engine operating between a hot reservoir at 600 K and a cold reservoir at 300 K?',
    options: ['25%', '50%', '66.7%', '100%'],
    correctIndex: 1,
    explanation: 'Carnot efficiency η = 1 - T_c / T_h = 1 - 300 / 600 = 0.50, or 50%.',
  },
  {
    id: 'q_phys_3',
    subjectName: 'Thermodynamics & Statistical Mechanics',
    topic: 'Entropy & Reversible Processes',
    difficulty: 'medium',
    question: 'For an adiabatic reversible (isentropic) expansion of an ideal gas, how does temperature change?',
    options: [
      'Temperature increases because heat enters',
      'Temperature decreases as the gas performs work using internal energy',
      'Temperature remains constant',
      'Temperature oscillates around equilibrium',
    ],
    correctIndex: 1,
    explanation: 'In an adiabatic expansion Q = 0, so ΔU = -W. Positive expansion work decreases internal energy and therefore lowers temperature.',
  },
  {
    id: 'q_phys_4',
    subjectName: 'Thermodynamics & Statistical Mechanics',
    topic: 'Statistical Mechanics',
    difficulty: 'medium',
    question: 'In Boltzmann’s entropy formula S = k_B ln Ω, what does Ω represent?',
    options: [
      'Total thermal energy of the reservoir',
      'Number of accessible microstates corresponding to the macrostate',
      'Average kinetic energy per degree of freedom',
      'Partition function of the canonical ensemble',
    ],
    correctIndex: 1,
    explanation: 'Ω (multiplicity) counts the number of distinct microscopic configurations consistent with the observed macroscopic constraints.',
  },
  {
    id: 'q_phys_5',
    subjectName: 'Thermodynamics & Statistical Mechanics',
    topic: 'Thermodynamic Potentials',
    difficulty: 'hard',
    question: 'At constant temperature and pressure (T, P), a spontaneous chemical or physical process moves toward minimizing which potential?',
    options: [
      'Helmholtz Free Energy (F)',
      'Internal Energy (U)',
      'Gibbs Free Energy (G)',
      'Enthalpy (H)',
    ],
    correctIndex: 2,
    explanation: 'Gibbs free energy G = H - TS decreases (ΔG < 0) for any spontaneous irreversible process held at constant temperature and pressure.',
  },

  // Modern Economic History
  {
    id: 'q_hist_1',
    subjectName: 'Modern Economic History',
    topic: 'Industrial Revolution',
    difficulty: 'easy',
    question: 'Which innovation most directly decoupled industrial factory location from fast-flowing rivers during the First Industrial Revolution?',
    options: [
      'The spinning jenny',
      'Watt’s separate-condenser steam engine',
      'The telegraph',
      'The Bessemer steel process',
    ],
    correctIndex: 1,
    explanation: 'Rotary steam engines allowed factories to operate in urban centers near coal and labor rather than beside rural watermills.',
  },
  {
    id: 'q_hist_2',
    subjectName: 'Modern Economic History',
    topic: 'Bretton Woods & Monetary Systems',
    difficulty: 'medium',
    question: 'Under the 1944 Bretton Woods system, major currencies were pegged to the US dollar, which itself was convertible into:',
    options: [
      'Silver at $1.29 per ounce',
      'Gold at $35 per ounce',
      'Special Drawing Rights only',
      'British Pound Sterling',
    ],
    correctIndex: 1,
    explanation: 'Bretton Woods established a gold-exchange standard where the US dollar was fixed to gold at $35/oz for foreign central banks.',
  },
  {
    id: 'q_hist_3',
    subjectName: 'Modern Economic History',
    topic: 'Great Depression Policy',
    difficulty: 'medium',
    question: 'Why did adherence to the Classical Gold Standard deepen the 1930s Great Depression across participating economies?',
    options: [
      'It forced central banks to keep interest rates high and restrict money supply to defend gold reserves',
      'It triggered immediate hyperinflation in every European nation',
      'It eliminated tariffs on agricultural exports',
      'It prohibited commercial banks from holding government bonds',
    ],
    correctIndex: 0,
    explanation: 'Countries defending gold parities could not expand monetary policy during deflationary shocks, transmitting contraction globally.',
  },
  {
    id: 'q_hist_4',
    subjectName: 'Modern Economic History',
    topic: 'Postwar Trade & Institutions',
    difficulty: 'hard',
    question: 'Which principle formed the core non-discrimination rule of the 1947 General Agreement on Tariffs and Trade (GATT)?',
    options: [
      'Mercantilist Quota Parity',
      'Most-Favored-Nation (MFN) treatment',
      'Floating Exchange Indexing',
      'Import Substitution Mandates',
    ],
    correctIndex: 1,
    explanation: 'Article I MFN required any tariff concession granted to one contracting party to be extended unconditionally to all GATT members.',
  },
];

export interface QuizConfig {
  subjectName: string; // 'ALL' or subject name
  topicQuery: string;
  difficulty: QuizDifficulty | 'mixed';
  count: number;
}

/**
 * Selects matching questions from the built-in bank.
 * Structured as a pure async-ready service so a future AI question generator
 * can be plugged in behind the same interface without changing UI consumers.
 */
export function generateQuizQuestions(config: QuizConfig): QuizQuestion[] {
  let pool = [...BUILTIN_QUESTION_BANK];

  if (config.subjectName !== 'ALL') {
    const exactSubject = pool.filter(
      (q) => q.subjectName.toLowerCase() === config.subjectName.toLowerCase(),
    );
    if (exactSubject.length > 0) {
      pool = exactSubject;
    }
  }

  if (config.difficulty !== 'mixed') {
    const diffFiltered = pool.filter((q) => q.difficulty === config.difficulty);
    if (diffFiltered.length > 0) {
      pool = diffFiltered;
    }
  }

  const query = config.topicQuery.trim().toLowerCase();
  if (query) {
    const scored = pool.map((q) => {
      const hay = `${q.topic} ${q.question} ${q.subjectName}`.toLowerCase();
      const words = query.split(/\s+/).filter(Boolean);
      const hits = words.reduce((acc, w) => (hay.includes(w) ? acc + 1 : acc), 0);
      return { q, hits };
    });
    const matched = scored.filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits);
    if (matched.length >= Math.min(config.count, 2)) {
      pool = matched.map((m) => m.q);
    } else if (matched.length > 0) {
      // Put keyword matches first, then fill from remaining pool
      const matchedIds = new Set(matched.map((m) => m.q.id));
      pool = [...matched.map((m) => m.q), ...pool.filter((q) => !matchedIds.has(q.id))];
    }
  } else {
    // Lightly shuffle when no keyword ordering is needed
    pool.sort(() => Math.random() - 0.5);
  }

  // If user selected a subject with fewer questions than requested count, pad cleanly from remaining bank
  if (pool.length < config.count) {
    const existingIds = new Set(pool.map((q) => q.id));
    const extras = BUILTIN_QUESTION_BANK.filter((q) => !existingIds.has(q.id)).sort(
      () => Math.random() - 0.5,
    );
    pool = [...pool, ...extras];
  }

  return pool.slice(0, Math.min(config.count, pool.length));
}
