// ── カラーID（1文字キー） ─────────────────────────────────────────
export type ColorId = 'R' | 'G' | 'B' | 'Y' | 'P' | 'C' | 'O';

// ── カラーパレット（彩度低め） ────────────────────────────────────
export const COLORS: Record<ColorId, string> = {
  R: '#C87E7E',
  G: '#78B87A',
  B: '#7A9FC4',
  Y: '#C8BE6A',
  P: '#9E82B0',
  C: '#6ABAC8',
  O: '#C89870',
};

// ── データ構造 ────────────────────────────────────────────────────
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

// ── 全ステージパターン ────────────────────────────────────────────
export const STAGE_PATTERNS: LevelPattern[][] = [

  // ━━ Stage 1: 3色・空き1・ギミックなし ━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 1, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','R','G'] },
        { stack: ['B','B','G'] },
        { stack: ['R','G','B'] },
        { empty: true },
      ],
      colors: ['R','G','B'],
    },
    {
      stage: 1, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['R','G','B'] },
        { stack: ['R','R','G'] },
        { stack: ['B','B','G'] },
        { empty: true },
      ],
      colors: ['R','G','B'],
    },
    {
      stage: 1, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['R','R','B'] },
        { stack: ['G','G','B'] },
        { stack: ['R','G','B'] },
        { empty: true },
      ],
      colors: ['R','G','B'],
    },
  ],

  // ━━ Stage 2: 4色・？3〜4個・空き1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 2, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','?','G'], actual: ['R','B','G'] },
        { stack: ['Y','?','R'], actual: ['Y','B','R'] },
        { stack: ['?','G','Y'], actual: ['R','G','Y'] },
        { stack: ['B','B','?'], actual: ['B','B','Y'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
    {
      stage: 2, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['?','R','Y'], actual: ['G','R','Y'] },
        { stack: ['B','?','G'], actual: ['B','R','G'] },
        { stack: ['Y','B','R'] },
        { stack: ['G','?','?'], actual: ['G','Y','B'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
    {
      stage: 2, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['R','R','?'], actual: ['R','R','B'] },
        { stack: ['?','G','?'], actual: ['Y','G','B'] },
        { stack: ['Y','Y','G'] },
        { stack: ['B','?','R'], actual: ['B','Y','R'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
  ],

  // ━━ Stage 3: 5色・？5〜8個・空き0 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 3, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['?','R','?'], actual: ['P','R','G'] },
        { stack: ['?','?','B'], actual: ['Y','P','B'] },
        { stack: ['G','?','Y'], actual: ['G','R','Y'] },
        { stack: ['P','P','?'], actual: ['P','P','B'] },
        { stack: ['R','R','?'], actual: ['R','R','Y'] },
        { stack: ['B','Y','G'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
    {
      stage: 3, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['?','?','?'], actual: ['R','G','B'] },
        { stack: ['?','Y','?'], actual: ['P','Y','R'] },
        { stack: ['?','?','G'], actual: ['B','Y','G'] },
        { stack: ['R','R','P'] },
        { stack: ['B','B','Y'] },
        { stack: ['P','G','?'], actual: ['P','G','R'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
    {
      stage: 3, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['?','R','R'], actual: ['P','R','R'] },
        { stack: ['G','?','?'], actual: ['G','B','Y'] },
        { stack: ['Y','Y','P'] },
        { stack: ['B','B','?'], actual: ['B','B','G'] },
        { stack: ['P','P','?'], actual: ['P','P','Y'] },
        { stack: ['R','G','B'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
  ],

  // ━━ Stage 4: 6色・？10〜15個・空き2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 4, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['?','?','?'], actual: ['R','G','B'] },
        { stack: ['?','?','?'], actual: ['Y','P','C'] },
        { stack: ['?','R','?'], actual: ['C','R','G'] },
        { stack: ['G','?','?'], actual: ['G','Y','P'] },
        { stack: ['B','P','?'], actual: ['B','P','Y'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
    {
      stage: 4, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['?','?','?'], actual: ['R','G','B'] },
        { stack: ['?','?','?'], actual: ['Y','P','C'] },
        { stack: ['?','?','R'], actual: ['C','G','R'] },
        { stack: ['G','?','P'], actual: ['G','Y','P'] },
        { stack: ['B','?','?'], actual: ['B','R','Y'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
    {
      stage: 4, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['?','?','?'], actual: ['R','G','B'] },
        { stack: ['?','?','?'], actual: ['Y','P','C'] },
        { stack: ['?','?','?'], actual: ['C','R','G'] },
        { stack: ['?','?','?'], actual: ['G','Y','P'] },
        { stack: ['?','?','R'], actual: ['B','P','R'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C'],
    },
  ],

  // ━━ Stage 5: 7色・capacity6・空き2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 5, pattern: 1, capacity: 6,
      bottles: [
        { stack: ['?','?','?','?','?','R'], actual: ['O','C','P','Y','G','R'] },
        { stack: ['?','?','?','?','?','?'], actual: ['R','B','C','O','Y','P'] },
        { stack: ['G','?','?','?','?','?'], actual: ['G','R','B','C','O','Y'] },
        { stack: ['B','B','?','?','?','?'], actual: ['B','B','G','R','C','O'] },
        { stack: ['Y','Y','Y','?','?','?'], actual: ['Y','Y','Y','P','G','R'] },
        { stack: ['P','P','P','?','?','?'], actual: ['P','P','P','C','B','Y'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C','O'],
    },
    {
      stage: 5, pattern: 2, capacity: 6,
      bottles: [
        { stack: ['?','?','?','?','?','?'], actual: ['R','G','B','Y','P','C'] },
        { stack: ['?','?','?','?','?','?'], actual: ['O','R','C','P','Y','G'] },
        { stack: ['?','?','?','?','?','G'], actual: ['B','Y','P','C','O','G'] },
        { stack: ['R','R','?','?','?','?'], actual: ['R','R','B','Y','P','C'] },
        { stack: ['B','B','B','?','?','?'], actual: ['B','B','B','G','O','R'] },
        { stack: ['Y','Y','?','?','?','?'], actual: ['Y','Y','P','C','O','G'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C','O'],
    },
    {
      stage: 5, pattern: 3, capacity: 6,
      bottles: [
        { stack: ['?','?','?','?','R','G'], actual: ['O','C','P','Y','R','G'] },
        { stack: ['?','?','?','B','B','B'], actual: ['R','C','O','B','B','B'] },
        { stack: ['G','G','?','?','?','?'], actual: ['G','G','Y','P','C','O'] },
        { stack: ['Y','Y','Y','?','?','?'], actual: ['Y','Y','Y','R','C','P'] },
        { stack: ['P','P','P','?','?','?'], actual: ['P','P','P','G','O','B'] },
        { stack: ['C','C','C','?','?','?'], actual: ['C','C','C','R','Y','G'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C','O'],
    },
  ],
];

// ── パターンをゲーム状態に変換 ────────────────────────────────────
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

// 後方互換
export const LEVELS_CONFIG = STAGE_PATTERNS.map((_, i) => ({ stageNumber: i + 1 }));
