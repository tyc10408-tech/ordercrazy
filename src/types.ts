export type ColorId = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'cyan';

export interface LevelData {
  bottles: ColorId[][];
  emptyBottles: number;
}

export const COLORS: Record<ColorId, string> = {
  red: '#FF5252',
  blue: '#448AFF',
  green: '#4CAF50',
  yellow: '#FFEB3B',
  purple: '#9C27B0',
  orange: '#FF9800',
  pink: '#E91E63',
  cyan: '#00BCD4',
};

export interface LevelConfig {
  colors: number;
  empty: number;
  isBlind: boolean;
}

export const LEVELS_CONFIG: LevelConfig[] = [
  { colors: 2, empty: 1, isBlind: false }, // Stage 1
  { colors: 3, empty: 2, isBlind: false }, // Stage 2
  { colors: 4, empty: 1, isBlind: false }, // Stage 3
  { colors: 5, empty: 1, isBlind: true },  // Stage 4 (Blind)
  { colors: 6, empty: 2, isBlind: true },  // Stage 5 (Boss, Blind)
];

export const generateShuffle = (numColors: number, numEmpty: number): ColorId[][] => {
  const colorKeys = Object.keys(COLORS) as ColorId[];
  const selectedColors = colorKeys.slice(0, numColors);
  
  const generateValidShuffle = (): ColorId[][] => {
    let allUnits: ColorId[] = [];
    selectedColors.forEach(color => {
      for (let i = 0; i < 4; i++) {
        allUnits.push(color);
      }
    });

    for (let i = allUnits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allUnits[i], allUnits[j]] = [allUnits[j], allUnits[i]];
    }

    const bottles: ColorId[][] = [];
    for (let i = 0; i < numColors; i++) {
      bottles.push(allUnits.slice(i * 4, (i + 1) * 4));
    }

    // Condition: No bottle starts already solved
    const hasAlreadyResolved = bottles.some(bottle => {
      if (bottle.length < 4) return false;
      return bottle.every(c => c === bottle[0]);
    });

    if (hasAlreadyResolved) {
      return generateValidShuffle();
    }

    return bottles;
  };

  const bottles = generateValidShuffle();
  
  for (let i = 0; i < numEmpty; i++) {
    bottles.push([]);
  }

  // Ensure initial mobility
  if (bottles.length > 1) {
    const b0 = bottles[0];
    const lastB = bottles[bottles.length - 1]; 
    if (b0.length === 4) {
      lastB.push(b0.pop()!);
    }
  }

  return bottles;
};
