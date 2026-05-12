import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { cn } from './lib/utils';
import Bottle from './components/Bottle';
import { STAGE_PATTERNS, ColorId, parsePattern } from './types';
import { RefreshCcw, Undo2, ChevronRight, Trophy } from 'lucide-react';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [bottles, setBottles] = useState<ColorId[][]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<ColorId[][][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStageSelect, setShowStageSelect] = useState(false);
  const [revealedMask, setRevealedMask] = useState<boolean[][]>([]);
  const [capacity, setCapacity] = useState(4);

  // ── レベル初期化（3パターンからランダム選択） ─────────────────
  const initLevel = useCallback((index: number) => {
    const patterns = STAGE_PATTERNS[index];
    if (!patterns) return;

    const randomIdx = Math.floor(Math.random() * patterns.length);
    const pattern = patterns[randomIdx];
    const { bottles: b, revealedMask: m, capacity: cap } = parsePattern(pattern);

    setBottles(b);
    setRevealedMask(m);
    setCapacity(cap);
    setSelectedIdx(null);
    setUndoStack([]);
    setIsWon(false);
    setIsAnimating(false);

    if (index === 0) setShowTutorial(true);
    setShowStageSelect(false);
  }, []);

  useEffect(() => {
    initLevel(currentLevelIndex);
  }, [currentLevelIndex, initLevel]);

  // ── 勝利判定 ───────────────────────────────────────────────────
  // 「各色の全ユニットが1本のボトルに集約され、
  //   各ボトルが単色（またはEmpty）」の状態でクリア
  useEffect(() => {
    if (bottles.length === 0 || isAnimating) return;

    const nonEmpty = bottles.filter(b => b.length > 0);
    if (nonEmpty.length === 0) return;

    // 各ボトルが単色か
    const allSorted = nonEmpty.every(b => b.every(c => c === b[0]));
    if (!allSorted) return;

    // 同じ色のボトルが2本以上ないか
    const colorSet = new Set(nonEmpty.map(b => b[0]));
    if (colorSet.size === nonEmpty.length) {
      setIsWon(true);
    }
  }, [bottles, isAnimating]);

  // ── ボトルクリック ────────────────────────────────────────────
  const handleBottleClick = async (idx: number) => {
    if (isWon || isAnimating || showTutorial || showStageSelect) return;

    // タップ開示: トップセルが隠れていたら表示
    if (bottles[idx].length > 0) {
      const topIdx = bottles[idx].length - 1;
      setRevealedMask(prev => {
        if (prev[idx]?.[topIdx]) return prev;
        const next = prev.map(m => [...m]);
        next[idx][topIdx] = true;
        return next;
      });
    }

    if (selectedIdx === null) {
      if (bottles[idx].length > 0) {
        setSelectedIdx(idx);
      }
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      const source = bottles[selectedIdx];
      const target = bottles[idx];

      if (source.length === 0) { setSelectedIdx(null); return; }

      const sourceColor = source[source.length - 1];
      const targetColor = target.length > 0 ? target[target.length - 1] : null;
      const canPour =
        (targetColor === null || targetColor === sourceColor) &&
        target.length < capacity;

      if (canPour) {
        await executePour(selectedIdx, idx);
      } else {
        setSelectedIdx(null);
      }
    }
  };

  const bottleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const executePour = async (fromIdx: number, toIdx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const sourceRef = bottleRefs.current[fromIdx];
    const targetRef = bottleRefs.current[toIdx];
    if (!sourceRef || !targetRef) { setIsAnimating(false); return; }

    const sourceColor = bottles[fromIdx][bottles[fromIdx].length - 1];
    let unitsToMove = 0;
    const snapshot = bottles.map(b => [...b]);

    while (
      snapshot[fromIdx].length > 0 &&
      snapshot[fromIdx][snapshot[fromIdx].length - 1] === sourceColor &&
      snapshot[toIdx].length + unitsToMove < capacity
    ) {
      unitsToMove++;
      snapshot[fromIdx].pop();
    }

    const oldFromLength = bottles[fromIdx].length;
    const oldToLength = bottles[toIdx].length;
    const newFromLength = oldFromLength - unitsToMove;
    const newToLength = oldToLength + unitsToMove;

    const sRect = sourceRef.getBoundingClientRect();
    const tRect = targetRef.getBoundingClientRect();
    const xOffset = toIdx > fromIdx ? -bWidth * 0.6 : bWidth * 0.6;
    const distanceX = tRect.left - sRect.left + xOffset;
    const distanceY = tRect.top - sRect.top - bHeight * 0.55;

    const timeline = gsap.timeline({
      onComplete: () => {
        setUndoStack([bottles.map(b => [...b])]);

        const finalBottles = bottles.map(b => [...b]);
        for (let i = 0; i < unitsToMove; i++) {
          const color = finalBottles[fromIdx].pop();
          if (color) finalBottles[toIdx].push(color);
        }
        setBottles(finalBottles);

        setRevealedMask(prev => {
          const next = prev.map(m => [...m]);
          for (let j = Math.max(0, newFromLength - 1); j <= oldFromLength - 2; j++) {
            next[fromIdx][j] = true;
          }
          for (let j = oldToLength; j < newToLength && j < capacity; j++) {
            next[toIdx][j] = true;
          }
          return next;
        });

        setIsAnimating(false);
        setSelectedIdx(null);
        gsap.set(sourceRef, { x: 0, y: 0, rotation: 0, zIndex: 10 });
      },
    });

    timeline.to(sourceRef, { x: distanceX, y: distanceY, duration: 0.18, ease: 'power2.out', zIndex: 100 });
    timeline.to(sourceRef, { rotation: toIdx > fromIdx ? 85 : -85, duration: 0.12, ease: 'power2.inOut' }, '-=0.03');

    for (let i = 0; i < unitsToMove; i++) {
      timeline.to({}, {
        duration: 0.08,
        onStart: () => {
          setBottles(prev => {
            const next = prev.map(b => [...b]);
            const color = next[fromIdx].pop();
            if (color) next[toIdx].push(color);
            return next;
          });
        },
      });
    }

    timeline.to(sourceRef, { rotation: 0, duration: 0.12, ease: 'power1.inOut' });
    timeline.to(sourceRef, { x: 0, y: 0, duration: 0.15, ease: 'power2.inOut' }, '-=0.03');
  };

  const undo = () => {
    if (undoStack.length === 0 || isAnimating) return;
    setBottles(undoStack[0]);
    setUndoStack([]);
    setSelectedIdx(null);
  };

  const nextStage = () => {
    if (currentLevelIndex < STAGE_PATTERNS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      initLevel(currentLevelIndex);
    }
  };

  const [windowDim, setWindowDim] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  useEffect(() => {
    const handleResize = () => setWindowDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bWidth = Math.min(60, Math.max(30, (windowDim.w - 100) / (bottles.length || 9)));
  const bHeight = Math.min(windowDim.h * 0.52, bWidth * capacity * 0.95);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden font-sans select-none"
      style={{
        backgroundImage: "url('https://lh3.googleusercontent.com/d/1Y_hvRo2iMfxBg3dhmogwNeP19zlpmFkM')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header className="relative pt-12 pb-4 w-full flex flex-col items-center gap-4 z-30">
        <h1 className="text-4xl md:text-5xl font-black text-emerald-900 tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          Order Crazy's copy
        </h1>
        <button
          onClick={() => setShowStageSelect(true)}
          className="bg-white/95 backdrop-blur-sm px-10 py-2 rounded-full border-2 border-emerald-300 shadow-lg hover:scale-105 transition-transform active:scale-95"
        >
          <span className="text-xl font-bold text-emerald-700 uppercase tracking-widest">
            ステージ {currentLevelIndex + 1} ▼
          </span>
        </button>
      </header>

      <main className="flex-grow w-full max-w-7xl px-4 md:px-8 pb-[120px] pt-[80px] flex items-center justify-center overflow-visible">
        <div className="flex flex-row flex-nowrap justify-center items-end gap-1 md:gap-6 w-full overflow-visible">
          {bottles.map((bottleColors, i) => (
            <Bottle
              key={`${currentLevelIndex}-${i}`}
              ref={(el) => (bottleRefs.current[i] = el)}
              colors={bottleColors}
              isSelected={selectedIdx === i}
              width={bWidth}
              height={bHeight}
              tilt={0}
              capacity={capacity}
              revealedMask={revealedMask[i]}
              onClick={() => handleBottleClick(i)}
            />
          ))}
        </div>
      </main>

      <footer className="fixed bottom-12 w-full flex justify-center gap-8 z-40">
        <button
          onClick={() => initLevel(currentLevelIndex)}
          disabled={isAnimating}
          className="group flex items-center gap-3 bg-white/95 hover:bg-white px-10 py-5 rounded-full shadow-xl border-2 border-orange-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className="w-6 h-6 text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-black text-gray-800 text-lg">リセット</span>
        </button>
        <button
          onClick={undo}
          disabled={undoStack.length === 0 || isAnimating}
          className="group flex items-center gap-3 bg-white/95 hover:bg-white px-10 py-5 rounded-full shadow-xl border-2 border-blue-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none grayscale-[0.5]"
        >
          <Undo2 className="w-6 h-6 text-blue-500 group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-gray-800 text-lg">1手戻る</span>
        </button>
      </footer>

      <AnimatePresence>
        {showStageSelect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full flex flex-col items-center gap-8 shadow-2xl border-4 border-emerald-300">
              <h3 className="text-3xl font-black text-emerald-900">ステージ選択</h3>
              <div className="grid grid-cols-3 gap-4 w-full">
                {STAGE_PATTERNS.map((_, idx) => (
                  <button key={idx}
                    onClick={() => { setCurrentLevelIndex(idx); setShowStageSelect(false); }}
                    className={cn(
                      'aspect-square rounded-2xl flex items-center justify-center text-2xl font-black shadow-md transition-all active:scale-90',
                      currentLevelIndex === idx
                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    )}>
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowStageSelect(false)} className="text-gray-400 font-bold hover:text-gray-600">
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full flex flex-col items-center gap-8 shadow-2xl border-4 border-emerald-200">
              <div className="text-center">
                <h3 className="text-2xl font-black text-emerald-900 mb-4">遊び方</h3>
                <p className="text-gray-700 font-bold leading-relaxed">
                  同じ色の液体を重ねて、<br />
                  瓶を1色だけにしよう！<br />
                  <span className="text-gray-500 text-sm mt-2 block">「？」はタップすると色が分かるよ</span>
                </p>
              </div>
              <button onClick={() => setShowTutorial(false)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-full font-black text-xl shadow-lg transition-all active:translate-y-1">
                了解！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWon && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-16 flex flex-col items-center gap-10 shadow-2xl border-x-[12px] border-emerald-100">
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-gray-800 tracking-tighter">クリア！</h2>
                <p className="text-emerald-600 font-bold text-xl mt-4">
                  ステージ {currentLevelIndex + 1} をクリアしました。
                </p>
              </div>
              <button onClick={nextStage}
                className="flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white px-16 py-6 rounded-full font-black text-3xl shadow-[0_10px_0_rgb(5,150,105)] active:shadow-none active:translate-y-2 transition-all group">
                {currentLevelIndex < STAGE_PATTERNS.length - 1 ? '次のステージ' : 'もう一度遊ぶ'}
                <ChevronRight className="w-10 h-10 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
