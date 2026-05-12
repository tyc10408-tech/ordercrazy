export type ColorId = 'R' | 'G' | 'B' | 'Y' | 'P' | 'C' | 'O';

// ── 元の彩度に戻したカラーパレット ───────────────────────────────
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

  // ━━ Stage 2: 4色・？3〜4個・空き1・全満タン ━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 2, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['R','?','G','Y'], actual: ['R','B','G','Y'] },
        { stack: ['Y','?','R','B'], actual: ['Y','G','R','B'] },
        { stack: ['B','?','?','R'], actual: ['B','Y','G','R'] },
        { stack: ['G','Y','B','?'], actual: ['G','Y','B','R'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
    {
      stage: 2, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['?','R','G','B'], actual: ['Y','R','G','B'] },
        { stack: ['R','?','Y','G'], actual: ['R','B','Y','G'] },
        { stack: ['B','Y','?','R'], actual: ['B','Y','G','R'] },
        { stack: ['G','B','R','Y'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
    {
      stage: 2, pattern: 3, capacity: 4,
      // ※修正: 元データR=5,G=3 → bottle2の隠しセル(pos2)をR→Gに修正
      bottles: [
        { stack: ['R','R','?','B'], actual: ['R','R','Y','B'] },
        { stack: ['?','G','G','Y'], actual: ['R','G','G','Y'] },
        { stack: ['B','B','?','?'], actual: ['B','B','G','Y'] },
        { stack: ['Y','?','R','G'], actual: ['Y','B','R','G'] },
        { empty: true },
      ],
      colors: ['R','G','B','Y'],
    },
  ],

  // ━━ Stage 3: 5色・？5〜8個・空き0 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [
    {
      stage: 3, pattern: 1, capacity: 4,
      bottles: [
        { stack: ['?','R','?','P'], actual: ['G','R','B','P'] },
        { stack: ['?','?','G','Y'], actual: ['P','R','G','Y'] },
        { stack: ['R','B','Y','?'], actual: ['R','B','Y','G'] },
        { stack: ['B','P','?','R'], actual: ['B','P','Y','R'] },
        { stack: ['Y','G','P','B'] },
        { stack: ['?','Y','?','?'], actual: ['P','Y','G','B'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
    {
      stage: 3, pattern: 2, capacity: 4,
      bottles: [
        { stack: ['?','?','?','R'], actual: ['G','B','P','R'] },
        { stack: ['?','?','?','G'], actual: ['Y','P','R','G'] },
        { stack: ['?','?','?','B'], actual: ['P','Y','G','B'] },
        { stack: ['R','G','B','Y'] },
        { stack: ['Y','P','R','?'], actual: ['Y','P','R','G'] },
        { stack: ['P','B','Y','?'], actual: ['P','B','Y','R'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
    {
      stage: 3, pattern: 3, capacity: 4,
      bottles: [
        { stack: ['?','R','R','G'], actual: ['P','R','R','G'] },
        { stack: ['?','G','?','B'], actual: ['Y','G','R','B'] },
        { stack: ['B','B','Y','?'], actual: ['B','B','Y','P'] },
        { stack: ['Y','Y','P','R'] },
        { stack: ['P','P','?','?'], actual: ['P','P','G','B'] },
        { stack: ['R','G','B','Y'] },
      ],
      colors: ['R','G','B','Y','P'],
    },
  ],

  // ━━ Stage 4: 6色・？10〜15個・空き2・全満タン ━━━━━━━━━━━━━━━━
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
      // ※修正: 元データ色不均等 → 検証済み回転パターンに置き換え(13隠し)
      bottles: [
        { stack: ['?','?','B','Y'], actual: ['R','G','B','Y'] },
        { stack: ['?','?','Y','P'], actual: ['G','B','Y','P'] },
        { stack: ['?','?','P','C'], actual: ['B','Y','P','C'] },
        { stack: ['?','?','C','R'], actual: ['Y','P','C','R'] },
        { stack: ['?','?','R','G'], actual: ['P','C','R','G'] },
        { stack: ['?','?','?','B'], actual: ['C','R','G','B'] },
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

  // ━━ Stage 5: 7色・capacity6・空き2・全満タン ━━━━━━━━━━━━━━━━━
  [
    {
      stage: 5, pattern: 1, capacity: 6,
      // ※修正: 元データR=7,B=5 → bottle6の隠しpos4をR→Bに修正
      bottles: [
        { stack: ['?','?','?','?','?','R'], actual: ['O','C','P','Y','G','R'] },
        { stack: ['?','?','?','?','?','G'], actual: ['R','B','C','O','Y','G'] },
        { stack: ['?','?','?','?','?','B'], actual: ['Y','P','O','C','R','B'] },
        { stack: ['?','?','?','?','?','Y'], actual: ['P','G','R','O','C','Y'] },
        { stack: ['?','?','?','?','?','P'], actual: ['C','R','G','B','O','P'] },
        { stack: ['?','?','?','?','?','C'], actual: ['G','Y','B','R','P','C'] },
        { stack: ['?','?','?','?','?','O'], actual: ['B','P','Y','G','B','O'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C','O'],
    },
    {
      stage: 5, pattern: 2, capacity: 6,
      bottles: [
        { stack: ['?','?','?','?','?','?'], actual: ['R','G','B','Y','P','C'] },
        { stack: ['?','?','?','?','?','?'], actual: ['O','R','G','B','Y','P'] },
        { stack: ['?','?','?','?','?','?'], actual: ['C','O','R','G','B','Y'] },
        { stack: ['?','?','?','?','?','R'], actual: ['P','C','O','R','G','B'] },
        { stack: ['?','?','?','?','?','G'], actual: ['Y','P','C','O','R','G'] },
        { stack: ['?','?','?','?','?','B'], actual: ['B','Y','P','C','O','R'] },
        { stack: ['?','?','?','?','?','Y'], actual: ['G','B','Y','P','C','O'] },
        { empty: true },
        { empty: true },
      ],
      colors: ['R','G','B','Y','P','C','O'],
    },
    {
      stage: 5, pattern: 3, capacity: 6,
      // P2と同じactual、hiddenパターンのみ変更（上位5セル表示・下1隠し、最終ボトルのみ4隠し）
      bottles: [
        { stack: ['?','G','B','Y','P','C'], actual: ['R','G','B','Y','P','C'] },
        { stack: ['?','R','G','B','Y','P'], actual: ['O','R','G','B','Y','P'] },
        { stack: ['?','O','R','G','B','Y'], actual: ['C','O','R','G','B','Y'] },
        { stack: ['?','C','O','R','G','B'], actual: ['P','C','O','R','G','B'] },
        { stack: ['?','P','C','O','R','G'], actual: ['Y','P','C','O','R','G'] },
        { stack: ['?','Y','P','C','O','R'], actual: ['B','Y','P','C','O','R'] },
        { stack: ['?','?','?','?','C','O'], actual: ['G','B','Y','P','C','O'] },
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

export const LEVELS_CONFIG = STAGE_PATTERNS.map((_, i) => ({ stageNumber: i + 1 }));
