import { CampusPilotData } from '../types/academic';
import { addDays, getTodayISO } from '../utils/dateUtils';

export const STUDENT_AVATAR_PATH = '/src/assets/images/avatar_student_profile_1795700059178.jpg';

export function createSeedData(): CampusPilotData {
  const today = getTodayISO();
  const nowISO = new Date().toISOString();

  return {
    profile: {
      name: 'Maya Lin',
      email: 'maya.lin@university.edu',
      university: 'Pacific Institute of Technology',
      major: 'Computer Science & Applied Math',
      year: 'Junior (Class of 2027)',
      bio: 'Focusing on algorithms, systems architecture, and statistical mechanics this semester.',
      avatarUrl: STUDENT_AVATAR_PATH,
    },
    preferences: {
      dailyStudyGoalHours: 4,
      preferredStartHour: 15,
      preferredEndHour: 21,
      focusBlockMinutes: 60,
      weekStartsOn: 'monday',
      showCompletedInOverview: true,
    },
    subjects: [
      {
        id: 'subj_cs301',
        code: 'CS 301',
        name: 'Data Structures & Algorithms',
        instructor: 'Prof. Elena Vance',
        examDate: addDays(today, 9),
        color: '#91A5D5',
      },
      {
        id: 'subj_math240',
        code: 'MATH 240',
        name: 'Linear Algebra & Vector Calculus',
        instructor: 'Dr. Julian Park',
        examDate: addDays(today, 14),
        color: '#6BA888',
      },
      {
        id: 'subj_phys210',
        code: 'PHYS 210',
        name: 'Thermodynamics & Statistical Mechanics',
        instructor: 'Prof. Henrik Lindqvist',
        examDate: addDays(today, 21),
        color: '#C79B5E',
      },
      {
        id: 'subj_hist115',
        code: 'HIST 115',
        name: 'Modern Economic History',
        instructor: 'Dr. Clara Moreno',
        examDate: addDays(today, 18),
        color: '#A78BBE',
      },
    ],
    topics: [
      {
        id: 'top_1',
        subjectId: 'subj_cs301',
        chapter: 'Chapter 4: Graph Algorithms',
        title: 'Dijkstra & Bellman-Ford Shortest Paths',
        estimatedHours: 2,
        completed: true,
      },
      {
        id: 'top_2',
        subjectId: 'subj_cs301',
        chapter: 'Chapter 5: Dynamic Programming',
        title: 'Sequence Alignment & Knapsack Optimizations',
        estimatedHours: 2,
        completed: false,
      },
      {
        id: 'top_3',
        subjectId: 'subj_cs301',
        chapter: 'Chapter 6: Amortized Analysis',
        title: 'Fibonacci Heaps & Union-Find Complexity',
        estimatedHours: 1.5,
        completed: false,
      },
      {
        id: 'top_4',
        subjectId: 'subj_math240',
        chapter: 'Unit 3: Spectral Theory',
        title: 'Diagonalization & Singular Value Decomposition',
        estimatedHours: 2,
        completed: false,
      },
      {
        id: 'top_5',
        subjectId: 'subj_math240',
        chapter: 'Unit 4: Vector Fields',
        title: 'Stokes’ Theorem & Divergence Integrals',
        estimatedHours: 2,
        completed: false,
      },
      {
        id: 'top_6',
        subjectId: 'subj_phys210',
        chapter: 'Module 2: Second Law',
        title: 'Carnot Cycles, Entropy & Free Energy Potentials',
        estimatedHours: 1.5,
        completed: false,
      },
      {
        id: 'top_7',
        subjectId: 'subj_hist115',
        chapter: 'Week 7: Interwar Finance',
        title: 'Classical Gold Standard & Bretton Woods Shift',
        estimatedHours: 1,
        completed: true,
      },
    ],
    studySessions: [
      {
        id: 'sess_1',
        subjectId: 'subj_cs301',
        topicId: 'top_1',
        title: 'Shortest Paths & Relaxation Proofs',
        date: addDays(today, -3),
        startTime: '16:00',
        durationMinutes: 90,
        completed: true,
        source: 'manual',
      },
      {
        id: 'sess_2',
        subjectId: 'subj_math240',
        topicId: 'top_4',
        title: 'Orthogonal Projections Problem Set Review',
        date: addDays(today, -2),
        startTime: '17:00',
        durationMinutes: 75,
        completed: true,
        source: 'manual',
      },
      {
        id: 'sess_3',
        subjectId: 'subj_hist115',
        topicId: 'top_7',
        title: 'Bretton Woods Primary Source Readings',
        date: addDays(today, -1),
        startTime: '15:30',
        durationMinutes: 60,
        completed: true,
        source: 'manual',
      },
      {
        id: 'sess_4',
        subjectId: 'subj_phys210',
        topicId: 'top_6',
        title: 'Entropy & Maxwell Relations Practice',
        date: addDays(today, -1),
        startTime: '18:00',
        durationMinutes: 60,
        completed: true,
        source: 'manual',
      },
      {
        id: 'sess_today_1',
        subjectId: 'subj_cs301',
        topicId: 'top_2',
        title: 'Dynamic Programming State Transitions & Knapsack',
        date: today,
        startTime: '15:00',
        durationMinutes: 90,
        completed: false,
        source: 'manual',
      },
      {
        id: 'sess_today_2',
        subjectId: 'subj_math240',
        topicId: 'top_4',
        title: 'Singular Value Decomposition Derivation',
        date: today,
        startTime: '17:30',
        durationMinutes: 60,
        completed: true,
        source: 'manual',
      },
      {
        id: 'sess_future_1',
        subjectId: 'subj_cs301',
        topicId: 'top_3',
        title: 'Amortized Potential Method Exercises',
        date: addDays(today, 1),
        startTime: '15:00',
        durationMinutes: 60,
        completed: false,
        source: 'smart-plan',
      },
      {
        id: 'sess_future_2',
        subjectId: 'subj_math240',
        topicId: 'top_5',
        title: 'Divergence Theorem Surface Flux Integrals',
        date: addDays(today, 2),
        startTime: '16:00',
        durationMinutes: 75,
        completed: false,
        source: 'smart-plan',
      },
    ],
    assignments: [
      {
        id: 'asg_1',
        title: 'Problem Set 5: Dynamic Programming & Memoization',
        subjectId: 'subj_cs301',
        description: 'Implement 0/1 Knapsack with space optimization and edit-distance reconstruction in C++/Python.',
        dueDate: addDays(today, 2),
        priority: 'high',
        status: 'in-progress',
        createdAt: nowISO,
      },
      {
        id: 'asg_2',
        title: 'Eigenvalue Decomposition & PCA Lab',
        subjectId: 'subj_math240',
        description: 'Compute covariance eigenvectors on the iris dataset and prove orthogonal invariance.',
        dueDate: addDays(today, 4),
        priority: 'high',
        status: 'pending',
        createdAt: nowISO,
      },
      {
        id: 'asg_3',
        title: 'Lab Report: Heat Engine Efficiency Curves',
        subjectId: 'subj_phys210',
        description: 'Analyze Stirling cycle pressure-volume telemetry and compare against theoretical Carnot limits.',
        dueDate: addDays(today, -1),
        priority: 'medium',
        status: 'pending',
        createdAt: nowISO,
      },
      {
        id: 'asg_4',
        title: 'Policy Brief: 1931 Gold Standard Exit',
        subjectId: 'subj_hist115',
        description: '1,500-word synthesis comparing UK and US monetary responses during the 1931–1933 banking crisis.',
        dueDate: addDays(today, 7),
        priority: 'medium',
        status: 'pending',
        createdAt: nowISO,
      },
      {
        id: 'asg_5',
        title: 'Graph Traversal & Topological Sort Benchmark',
        subjectId: 'subj_cs301',
        description: 'Runtime profiling of Kahn’s algorithm vs DFS post-order on sparse DAGs.',
        dueDate: addDays(today, -3),
        priority: 'low',
        status: 'completed',
        createdAt: nowISO,
        completedAt: nowISO,
      },
      {
        id: 'asg_6',
        title: 'Vector Calculus Quiz Prep Sheet',
        subjectId: 'subj_math240',
        description: 'Worked solutions for line integrals and conservative vector fields.',
        dueDate: addDays(today, -2),
        priority: 'medium',
        status: 'completed',
        createdAt: nowISO,
        completedAt: nowISO,
      },
    ],
    notes: [
      {
        id: 'note_1',
        title: 'Dynamic Programming Patterns & Recurrence Design',
        subjectId: 'subj_cs301',
        pinned: true,
        tags: ['algorithms', 'exam-prep', 'dp'],
        content: `Core Steps for Formulating a DP Solution:
1. Define the subproblem state clearly (what minimal variables capture past choices?).
2. Write the recurrence relation connecting larger states to smaller subproblems.
3. Identify base cases and topological evaluation order.
4. Check if space can be compressed from 2D O(N·W) to 1D O(W) by iterating backwards.

Key Examples:
- 0/1 Knapsack: dp[w] = max(dp[w], dp[w - wt[i]] + val[i]) for w = W down to wt[i]
- Longest Common Subsequence: match increments diagonal dp[i-1][j-1] + 1
- Edit Distance: min(insert, delete, replace) + 1`,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        id: 'note_2',
        title: 'Spectral Theorem & SVD Intuition',
        subjectId: 'subj_math240',
        pinned: true,
        tags: ['linear-algebra', 'svd'],
        content: `Every real symmetric matrix S = Q Λ Q^T can be orthogonally diagonalized.
- Distinct eigenvalues guarantee orthogonal eigenvectors.
- For general m × n matrix A, Singular Value Decomposition factors A = U Σ V^T.
- Columns of V are eigenvectors of A^T A (right singular vectors).
- Columns of U are eigenvectors of A A^T (left singular vectors).
- Rank-k approximation keeps only the largest k singular values (Eckart-Young theorem).`,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        id: 'note_3',
        title: 'Thermodynamic Potentials & Legendre Transforms',
        subjectId: 'subj_phys210',
        pinned: false,
        tags: ['thermodynamics', 'potentials'],
        content: `Fundamental thermodynamic relation: dU = T dS - P dV + μ dN.

By swapping natural variables via Legendre transforms:
- Enthalpy: H = U + PV  -> dH = T dS + V dP
- Helmholtz Free Energy: F = U - TS -> dF = -S dT - P dV (minimized at constant T, V)
- Gibbs Free Energy: G = H - TS -> dG = -S dT + V dP (minimized at constant T, P)`,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        id: 'note_4',
        title: 'Bretton Woods Architecture (1944–1971)',
        subjectId: 'subj_hist115',
        pinned: false,
        tags: ['monetary-history', 'macro'],
        content: `Main pillars established at Mount Washington Hotel, New Hampshire:
- Adjustable peg exchange rates anchored to the US Dollar ($35/oz gold convertibility).
- IMF created to provide short-term balance-of-payments liquidity.
- IBRD (World Bank) tasked with postwar reconstruction lending.
- Triffin Dilemma: global liquidity growth required US deficits that eventually undermined gold backing.`,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ],
    quizAttempts: [
      {
        id: 'qa_1',
        subjectName: 'Data Structures & Algorithms',
        topic: 'Graph & Sorting',
        difficulty: 'medium',
        totalQuestions: 4,
        score: 3,
        completedAt: addDays(today, -2) + 'T18:20:00.000Z',
        questionIds: ['q_cs_1', 'q_cs_2', 'q_cs_3', 'q_cs_4'],
        answers: { q_cs_1: 1, q_cs_2: 1, q_cs_3: 2, q_cs_4: 0 },
      },
      {
        id: 'qa_2',
        subjectName: 'Linear Algebra & Vector Calculus',
        topic: 'Eigenvalues & Gradients',
        difficulty: 'medium',
        totalQuestions: 4,
        score: 4,
        completedAt: addDays(today, -1) + 'T19:45:00.000Z',
        questionIds: ['q_math_1', 'q_math_2', 'q_math_3', 'q_math_4'],
        answers: { q_math_1: 1, q_math_2: 1, q_math_3: 1, q_math_4: 1 },
      },
    ],
    activityLog: [
      {
        id: 'act_1',
        type: 'study',
        description: 'Completed 60m study session: Singular Value Decomposition Derivation',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'act_2',
        type: 'quiz',
        description: 'Scored 4/4 (100%) on Linear Algebra & Vector Calculus quiz',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
      {
        id: 'act_3',
        type: 'note',
        description: 'Updated note: Dynamic Programming Patterns & Recurrence Design',
        timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      },
      {
        id: 'act_4',
        type: 'assignment',
        description: 'Completed assignment: Vector Calculus Quiz Prep Sheet',
        timestamp: new Date(Date.now() - 46 * 3600 * 1000).toISOString(),
      },
    ],
  };
}
