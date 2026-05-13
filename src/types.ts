export type ColorId = 'R' | 'G' | 'B' | 'Y' | 'P' | 'C' | 'O';

export const COLORS: Record<ColorId, string> = {
  R: '#FF5252',
  G: '#4CAF50',
  B: '#448AFF',
  Y: '#FFEB3B',
  P: '#9C27B0',
  C: '#00BCD4',
  O: '#FF9800',
};

export interface PatternBottle {
  stack?: (ColorId | '?')[];
  actual?: ColorId[];
  empty?: true;
}

export interface LevelPattern {
  stage: number;
  pattern: number;
  capacity: number;
  bottles: PatternBottle[];
  colors: ColorId[];
}

export const STAGE_PATTERNS: LevelPattern[][] = [

  // ━━ Stage 1: 3色・空き1・全満タン ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 1, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','R','G','B'] },
        { stack: ['G','G','B','R'] },
        { stack: ['B','B','R','G'] },
        { empty: true },
      ],
      colors: ['R','G','B'],
    },
    {
      stage: 1, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['R','G','B','R'] },
        { stack: ['G','B','R','G'] },
        { stack: ['B','R','G','B'] },
        { empty: true },
      ],
      colors: ['R','G','B'],
    },
    {
      stage: 1, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['R','R','R','G'] },
        { stack: ['B','B','B','R'] },
        { stack: ['G','G','G','B'] },
        { empty: true },
      ],
      colors: ['R','G','B'],
    },
  ],

  // ━━ Stage 2: 4色・？あり・空き1・全満タン ━━━━━━━━━━━━━━━━━━━━
  // ルール: トップは常に実際の色（?はトップに存在しない）
  [
    {
      stage: 2, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','?','G','B'], actual: ['R','Y','G','B'] },
        { stack: ['G','?','B','R'], actual: ['G','Y','B','R'] },
        { stack: ['B','?','R','G'], actual: ['B','Y','R','G'] },
        { stack: ['Y','?','R','G'], actual: ['Y','B','R','G'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
    {
      stage: 2, pattern: 2, capacity: 4,
      // ※修正: btl3のトップ ? → R（実際の色）
      bottles: [
        { stack: ['R','?','G','B'], actual: ['R','Y','G','B'] },
        { stack: ['G','R','?','Y'], actual: ['G','R','B','Y'] },
        { stack: ['B','?','R','G'], actual: ['B','Y','R','G'] },
        { stack: ['Y','B','G','R'], actual: ['Y','B','G','R'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
    {
      stage: 2, pattern: 3, capacity: 4,
      // ※修正: btl3のトップ ? → G（実際の色）
      bottles: [
        { stack: ['R','G','?','B'], actual: ['R','G','Y','B'] },
        { stack: ['G','B','?','R'], actual: ['G','B','Y','R'] },
        { stack: ['B','?','R','Y'], actual: ['B','G','R','Y'] },
        { stack: ['Y','R','B','G'], actual: ['Y','R','B','G'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
  ],

  // ━━ Stage 3: 5色・空きなし（初期）・全色4個・合計20個 ━━━━━━━━━
  // ルール: トップは常に実際の色（?はトップに存在しない）
  // クリア条件: 5本が満タン単色（1本が自然に空になる）
  [
    {
      stage: 3, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','?','G','G'], actual: ['R','R','G','G'] },
        { stack: ['G','?','B','B'], actual: ['G','G','B','B'] },
        { stack: ['B','?','Y'],     actual: ['B','B','Y'] },
        { stack: ['Y','?','Y','P'], actual: ['Y','Y','Y','P'] },
        { stack: ['P','?','P'],     actual: ['P','P','P'] },
        { stack: ['R','R'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
    {
      stage: 3, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['R','?','?','G'], actual: ['R','G','G','G'] },
        { stack: ['G','B'] },
        { stack: ['?','B','B','Y'], actual: ['B','B','B','Y'] },
        { stack: ['?','Y','Y','P'], actual: ['Y','Y','Y','P'] },
        { stack: ['?','?','P'],     actual: ['P','P','P'] },
        { stack: ['?','?','R'],     actual: ['R','R','R'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
    {
      stage: 3, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['?','R','B'],     actual: ['R','R','B'] },
        { stack: ['G','G','?','Y'], actual: ['G','G','G','Y'] },
        { stack: ['B','B','?','G'], actual: ['B','B','B','G'] },
        { stack: ['Y','Y','?','P'], actual: ['Y','Y','Y','P'] },
        { stack: ['P','?','P'],     actual: ['P','P','P'] },
        { stack: ['?','R'],         actual: ['R','R'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
  ],

  // ━━ Stage 4: 6色・？10〜18個・空き2・全満タン ━━━━━━━━━━━━━━━━
  [
    {
      stage: 4, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['?','?','?','R'], actual: ['G','B','Y','R'] },
        { stack: ['?','?','?','G'], actual: ['P','C','R','G'] },
        { stack: ['?','?','?','B'], actual: ['Y','P','C','B'] },
        { stack: ['?','?','?','Y'], actual: ['B','R','G','Y'] },
        { stack: ['?','?','?','P'], actual: ['C','G','B','P'] },
        { stack: ['?','?','?','C'], actual: ['R','Y','P','C'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
    {
      stage: 4, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','?','?','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','?','?','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
    {
      stage: 4, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['?','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['?','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['?','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['?','?','?','R'], actual: ['C','R','G','B'] },
        { stack: ['?','?','?','G'], actual: ['Y','P','C','G'] },
        { stack: ['?','?','?','B'], actual: ['R','Y','P','B'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
  ],

  // ━━ Stage 5: 6色・各色8個・空き1+最大3追加・特別ギミック ━━━━━━
  [
    {
      stage: 5, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','?','?','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','?','?','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','B','?','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','R','?','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
    {
      stage: 5, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','?','?','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','?','?','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','Y','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','B','?','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','R','?','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
    {
      stage: 5, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','?','?','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','?','?','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { stack: ['R','?','?','?'], actual: ['R','G','B','Y'] },
        { stack: ['P','?','?','?'], actual: ['P','C','R','G'] },
        { stack: ['B','?','?','?'], actual: ['B','Y','P','C'] },
        { stack: ['G','B','Y','?'], actual: ['G','B','Y','P'] },
        { stack: ['C','R','G','?'], actual: ['C','R','G','B'] },
        { stack: ['Y','?','?','?'], actual: ['Y','P','C','R'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
  ],
];

export function parsePattern(pattern: LevelPattern): {
  bottles: ColorId[][];
  revealedMask: boolean[][];
  capacity: number;
} {
  const { capacity } = pattern;
  const bottles: ColorId[][] = [];
  const revealedMask: boolean[][] = [];

  for (const bottle of pattern.bottles) {
    const maskRow: boolean[] = Array(capacity).fill(false);
    if (bottle.empty) {
      bottles.push([]);
    } else {
      const stack = bottle.stack!;
      const actual = (bottle.actual ?? stack) as ColorId[];
      bottles.push([...actual]);
      for (let j = 0; j < stack.length; j++) {
        maskRow[j] = stack[j] !== '?';
      }
    }
    revealedMask.push(maskRow);
  }
  return { bottles, revealedMask, capacity };
}

export const STAGE5_ORDER: ColorId[] = ['R', 'G', 'B', 'Y', 'P', 'C'];
export const LEVELS_CONFIG = STAGE_PATTERNS.map((_, i) => ({ stageNumber: i + 1 }));
