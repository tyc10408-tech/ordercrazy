import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { cn } from './lib/utils';
import Bottle from './components/Bottle';
import { STAGE_PATTERNS, STAGE5_ORDER, ColorId, parsePattern, COLORS } from './types';
import { RefreshCcw, Undo2, ChevronRight, Trophy, PackageCheck, Info } from 'lucide-react';

const IS_STAGE5 = (idx: number) => idx === 4;

const lsGet = (key: string) => { try { return localStorage.getItem(key) === '1'; } catch { return false; } };
const lsSet = (key: string) => { try { localStorage.setItem(key, '1'); } catch {} };

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

  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [extraEmpty, setExtraEmpty] = useState(0);
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [orderCompleteColor, setOrderCompleteColor] = useState<ColorId | null>(null);
  const [showStage5Warning, setShowStage5Warning] = useState(false);

  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => lsGet('oc_tutorial'));
  const [hasSeenStage5Warning, setHasSeenStage5Warning] = useState(() => lsGet('oc_s5warn'));

  const closeTutorial = () => { setShowTutorial(false); setHasSeenTutorial(true); lsSet('oc_tutorial'); };
  const closeStage5Warning = () => { setShowStage5Warning(false); setHasSeenStage5Warning(true); lsSet('oc_s5warn'); };

  const currentOrderIndexRef = useRef(0);
  const extraEmptyRef = useRef(0);
  const capacityRef = useRef(4);
  const currentLevelIndexRef = useRef(0);
  const revealedMaskRef = useRef<boolean[][]>([]);

  useEffect(() => { currentOrderIndexRef.current = currentOrderIndex; }, [currentOrderIndex]);
  useEffect(() => { extraEmptyRef.current = extraEmpty; }, [extraEmpty]);
  useEffect(() => { capacityRef.current = capacity; }, [capacity]);
  useEffect(() => { currentLevelIndexRef.current = currentLevelIndex; }, [currentLevelIndex]);
  useEffect(() => { revealedMaskRef.current = revealedMask; }, [revealedMask]);

  const initLevel = useCallback((index: number) => {
    const patterns = STAGE_PATTERNS[index];
    if (!patterns) return;
    const randomIdx = Math.floor(Math.random() * patterns.length);
    const { bottles: b, revealedMask: m, capacity: cap } = parsePattern(patterns[randomIdx]);
    setBottles(b);
    setRevealedMask(m);
    revealedMaskRef.current = m;
    setCapacity(cap);
    setSelectedIdx(null);
    setUndoStack([]);
    setIsWon(false);
    setIsAnimating(false);
    setShowOrderComplete(false);
    setOrderCompleteColor(null);
    if (IS_STAGE5(index)) {
      setCurrentOrderIndex(0); setExtraEmpty(0);
      currentOrderIndexRef.current = 0; extraEmptyRef.current = 0;
    } else {
      setCurrentOrderIndex(0); setExtraEmpty(0);
    }
    if (index === 0 && !hasSeenTutorial) setShowTutorial(true);
    if (IS_STAGE5(index) && !hasSeenStage5Warning) setShowStage5Warning(true);
    setShowStageSelect(false);
  }, [hasSeenTutorial, hasSeenStage5Warning]);

  useEffect(() => { initLevel(currentLevelIndex); }, [currentLevelIndex, initLevel]);

  // 勝利判定: 全ステージ「満タン+単色+全?開示済み」
  useEffect(() => {
    if (bottles.length === 0 || isAnimating) return;
    const nonEmpty = bottles.filter(b => b.length > 0);
    if (nonEmpty.length === 0) return;
    const cap = capacityRef.current;
    const allFullSorted = nonEmpty.every(b => b.length === cap && b.every(c => c === b[0]));
    if (!allFullSorted) return;
    const allRevealed = bottles.every((bottle, i) =>
      bottle.every((_, j) => revealedMask[i]?.[j] !== false)
    );
    if (allRevealed) setIsWon(true);
  }, [bottles, isAnimating, revealedMask]);

  const handleBottleClick = async (idx: number) => {
    if (isWon || isAnimating || showTutorial || showStageSelect || showStage5Warning) return;
    if (selectedIdx === null) {
      if (bottles[idx].length > 0) setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      const source = bottles[selectedIdx];
      const target = bottles[idx];
      if (source.length === 0) { setSelectedIdx(null); return; }
      const sourceColor = source[source.length - 1];
      const targetColor = target.length > 0 ? target[target.length - 1] : null;
      const canPour = (targetColor === null || targetColor === sourceColor) && target.length < capacity;
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

    const cap = capacityRef.current;
    const sourceColor = bottles[fromIdx][bottles[fromIdx].length - 1];
    let unitsToMove = 0;
    const snapshot = bottles.map(b => [...b]);
    const mask = revealedMaskRef.current;

    // 隠しセルで中断（同じ色でも?は分けて注ぐ）
    while (
      snapshot[fromIdx].length > 0 &&
      snapshot[fromIdx][snapshot[fromIdx].length - 1] === sourceColor &&
      snapshot[toIdx].length + unitsToMove < cap
    ) {
      const currentTopIdx = snapshot[fromIdx].length - 1;
      if (unitsToMove > 0 && !mask[fromIdx]?.[currentTopIdx]) break;
      unitsToMove++;
      snapshot[fromIdx].pop();
    }

    const oldFromLength = bottles[fromIdx].length;
    const oldToLength = bottles[toIdx].length;
    const newFromLength = oldFromLength - unitsToMove;
    const newToLength = oldToLength + unitsToMove;
    const bottlesAtStart = bottles.map(b => [...b]);

    const sRect = sourceRef.getBoundingClientRect();
    const tRect = targetRef.getBoundingClientRect();

    // ── ボトル口位置調整 ──────────────────────────────────────────
    // xOffset: ソースが目標中心に寄るほど値を下げる（0.35 = 適度な近接感）
    // distanceY: ソースが目標の口の上に来るよう高さを調整（0.42）
    const xOffset = toIdx > fromIdx ? -bWidth * 0.35 : bWidth * 0.35;
    const distanceX = tRect.left - sRect.left + xOffset;
    const distanceY = tRect.top - sRect.top - bHeight * 0.42;

    const timeline = gsap.timeline({
      onComplete: () => {
        let finalBottles = bottlesAtStart.map(b => [...b]);
        for (let i = 0; i < unitsToMove; i++) {
          const color = finalBottles[fromIdx].pop();
          if (color) finalBottles[toIdx].push(color);
        }

        let addEmpty = false;
        let completedColor: ColorId | null = null;
        const lvl = currentLevelIndexRef.current;
        if (IS_STAGE5(lvl)) {
          const oIdx = currentOrderIndexRef.current;
          const eEmpty = extraEmptyRef.current;
          if (oIdx < STAGE5_ORDER.length && eEmpty < 3) {
            const target = STAGE5_ORDER[oIdx];
            const justCompleted = finalBottles.some((b, bi) => {
              const wasComplete = bottlesAtStart[bi].length === cap &&
                bottlesAtStart[bi].every(c => c === bottlesAtStart[bi][0]) &&
                bottlesAtStart[bi][0] === target;
              const isNowComplete = b.length === cap && b.every(c => c === b[0]) && b[0] === target;
              return !wasComplete && isNowComplete;
            });
            if (justCompleted) {
              addEmpty = true; completedColor = target;
              const nextOIdx = oIdx + 1; const nextEEmpty = eEmpty + 1;
              setCurrentOrderIndex(nextOIdx); setExtraEmpty(nextEEmpty);
              currentOrderIndexRef.current = nextOIdx; extraEmptyRef.current = nextEEmpty;
              setOrderCompleteColor(target); setShowOrderComplete(true);
              setTimeout(() => setShowOrderComplete(false), 2500);
            }
          }
        }

        if (addEmpty) finalBottles = [...finalBottles, []];
        if (!IS_STAGE5(lvl)) setUndoStack([bottlesAtStart]);
        setBottles(finalBottles);

        // ── ?開示: ボトルが元の位置に戻った瞬間（onComplete）で一括更新 ──
        setRevealedMask(prev => {
          const next = prev.map(m => [...m]);
          for (let j = Math.max(0, newFromLength - 1); j <= oldFromLength - 2; j++) {
            if (next[fromIdx]) next[fromIdx][j] = true;
          }
          for (let j = oldToLength; j < newToLength && j < cap; j++) {
            if (next[toIdx]) next[toIdx][j] = true;
          }
          if (addEmpty) next.push(Array(cap).fill(false));
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
      const ii = i;
      timeline.to({}, {
        duration: 0.08,
        onStart: () => {
          // フラッシュ防止: toIdx の被覆セルと注がれるセルを開示
          // fromIdx は onComplete まで更新しない（?遅延開示のため）
          setRevealedMask(prev => {
            const next = prev.map(m => [...m]);
            const toTopBefore = oldToLength + ii - 1;
            if (toTopBefore >= 0 && next[toIdx]) next[toIdx][toTopBefore] = true;
            const newTopInTo = oldToLength + ii;
            if (next[toIdx] && newTopInTo < cap) next[toIdx][newTopInTo] = true;
            return next;
          });
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
    if (undoStack.length === 0 || isAnimating || IS_STAGE5(currentLevelIndex)) return;
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
    const h = () => setWindowDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const bWidth = Math.min(56, Math.max(26, (windowDim.w - 80) / Math.max(bottles.length, 8)));
  const bHeight = Math.min(windowDim.h * 0.5, bWidth * capacity * 0.95);

  const currentOrderColor = IS_STAGE5(currentLevelIndex) && currentOrderIndex < STAGE5_ORDER.length
    ? STAGE5_ORDER[currentOrderIndex] : null;

  const handleInfoClick = () => {
    if (IS_STAGE5(currentLevelIndex)) setShowStage5Warning(true);
    else setShowTutorial(true);
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden font-sans select-none"
      style={{
        backgroundImage: "url('https://lh3.googleusercontent.com/d/1Y_hvRo2iMfxBg3dhmogwNeP19zlpmFkM')",
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      }}
    >
      <button onClick={handleInfoClick}
        className="fixed top-4 right-4 z-[90] bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-emerald-300 hover:scale-110 transition-transform active:scale-95">
        <Info className="w-5 h-5 text-emerald-600" />
      </button>

      <header className="relative pt-10 pb-2 w-full flex flex-col items-center gap-3 z-30">
        <h1 className="text-3xl md:text-5xl font-black text-emerald-900 tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          Order Crazy's copy
        </h1>
        <button onClick={() => setShowStageSelect(true)}
          className="bg-white/95 backdrop-blur-sm px-10 py-2 rounded-full border-2 border-emerald-300 shadow-lg hover:scale-105 transition-transform active:scale-95">
          <span className="text-lg font-bold text-emerald-700 uppercase tracking-widest">
            ステージ {currentLevelIndex + 1} ▼
          </span>
        </button>
        {IS_STAGE5(currentLevelIndex) && (
          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border-2 border-emerald-200">
            {currentOrderColor ? (
              <>
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-gray-700 text-sm">Next Order:</span>
                <div className="w-7 h-7 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: COLORS[currentOrderColor] }} />
                <span className="font-bold text-emerald-600 text-sm">空き +{extraEmpty}/3</span>
              </>
            ) : (
              <span className="font-black text-emerald-600 text-sm">🎉 All Orders Cleared!</span>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow w-full pb-[120px] pt-6 flex items-center justify-center overflow-x-auto">
        <div className="flex flex-row flex-nowrap justify-center items-end gap-1 md:gap-4 px-4 min-w-max mx-auto">
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
              isAnimating={isAnimating}
              onClick={() => handleBottleClick(i)}
            />
          ))}
        </div>
      </main>

      <footer className="fixed bottom-10 w-full flex justify-center gap-6 z-40">
        <button onClick={() => initLevel(currentLevelIndex)} disabled={isAnimating}
          className="group flex items-center gap-2 bg-white/95 hover:bg-white px-8 py-4 rounded-full shadow-xl border-2 border-orange-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
          <RefreshCcw className="w-5 h-5 text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-black text-gray-800">リセット</span>
        </button>
        {!IS_STAGE5(currentLevelIndex) && (
          <button onClick={undo} disabled={undoStack.length === 0 || isAnimating}
            className="group flex items-center gap-2 bg-white/95 hover:bg-white px-8 py-4 rounded-full shadow-xl border-2 border-blue-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none grayscale-[0.5]">
            <Undo2 className="w-5 h-5 text-blue-500 group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-gray-800">1手戻る</span>
          </button>
        )}
      </footer>

      <AnimatePresence>
        {showOrderComplete && orderCompleteColor && (
          <motion.div initial={{ opacity: 0, y: -40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className="fixed top-36 left-1/2 -translate-x-1/2 z-[300] bg-white rounded-2xl px-8 py-4 shadow-2xl border-2 border-emerald-300 flex items-center gap-4">
            <div className="w-9 h-9 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: COLORS[orderCompleteColor] }} />
            <div>
              <p className="font-black text-gray-800">Order Complete!</p>
              <p className="font-bold text-emerald-600 text-sm">+1 Empty Bottle Added 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStage5Warning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl border-4 border-red-200">
              <div className="text-5xl">⚠️</div>
              <h3 className="text-2xl font-black text-gray-800 text-center">ステージ5 特別ルール</h3>
              <ul className="text-gray-700 font-bold leading-relaxed space-y-3 w-full">
                <li className="flex items-start gap-2"><span className="text-red-500 text-lg">×</span><span>このステージでは手順を戻せません！</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 text-lg">✓</span><span>指定の色のボトルを完成させると空きボトルが1本追加（最大+3本）</span></li>
                <li className="flex items-start gap-2"><span className="text-blue-500 text-lg">●</span><span>オーダーを無視してもクリアは可能です</span></li>
              </ul>
              <button onClick={closeStage5Warning}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-full font-black text-xl shadow-lg transition-all active:translate-y-1 w-full">
                了解！開始する
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStageSelect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full flex flex-col items-center gap-8 shadow-2xl border-4 border-emerald-300">
              <h3 className="text-3xl font-black text-emerald-900">ステージ選択</h3>
              <div className="grid grid-cols-3 gap-4 w-full">
                {STAGE_PATTERNS.map((_, idx) => (
                  <button key={idx} onClick={() => { setCurrentLevelIndex(idx); setShowStageSelect(false); }}
                    className={cn('aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 text-xl font-black shadow-md transition-all active:scale-90',
                      currentLevelIndex === idx ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')}>
                    <span>{idx + 1}</span>
                    {idx === 4 && <span className="text-xs font-bold opacity-70">SPECIAL</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowStageSelect(false)} className="text-gray-400 font-bold hover:text-gray-600">閉じる</button>
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
                  同じ色の液体を重ねて、<br />瓶を1色で満タンにしよう！<br />
                  <span className="text-gray-500 text-sm mt-2 block">「？」は上の液体が別のボトルへ<br />移動した瞬間に色が分かるよ</span>
                </p>
              </div>
              <button onClick={closeTutorial}
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
              className="bg-white rounded-[4rem] p-14 flex flex-col items-center gap-8 shadow-2xl border-x-[12px] border-emerald-100">
              <motion.div animate={{ rotate: [0,-15,15,-15,15,0], scale: [1,1.1,1,1.1,1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner">
                <Trophy className="w-14 h-14 text-yellow-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-gray-800 tracking-tighter">クリア！</h2>
                <p className="text-emerald-600 font-bold text-xl mt-3">ステージ {currentLevelIndex + 1} をクリアしました。</p>
                {IS_STAGE5(currentLevelIndex) && (
                  <p className="text-gray-500 font-bold text-sm mt-2">オーダー達成: {Math.min(currentOrderIndex, 3)}/3</p>
                )}
              </div>
              <button onClick={nextStage}
                className="flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white px-14 py-5 rounded-full font-black text-2xl shadow-[0_10px_0_rgb(5,150,105)] active:shadow-none active:translate-y-2 transition-all group">
                {currentLevelIndex < STAGE_PATTERNS.length - 1 ? '次のステージ' : 'もう一度遊ぶ'}
                <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
