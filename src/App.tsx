import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { cn } from './lib/utils';
import Bottle from './components/Bottle';
import { LEVELS_CONFIG, ColorId, generateShuffle } from './types';
import { RefreshCcw, Undo2, ChevronRight, Trophy } from 'lucide-react';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [bottles, setBottles] = useState<ColorId[][]>([]);
  const [revealedMasks, setRevealedMasks] = useState<boolean[][]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<{ bottles: ColorId[][], masks: boolean[][] }[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStageSelect, setShowStageSelect] = useState(false);

  const [windowDim, setWindowDim] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });

  useEffect(() => {
    const handleResize = () => setWindowDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize level
  const initLevel = useCallback((index: number) => {
    const config = LEVELS_CONFIG[index];
    if (!config) return;

    const shuffled = generateShuffle(config.colors, config.empty);
    
    // Initial masks: only top unit is revealed
    const initialMasks = shuffled.map(b => {
      const mask = [false, false, false, false];
      if (b.length > 0) {
        mask[b.length - 1] = true;
      }
      return mask;
    });

    setBottles(shuffled);
    setRevealedMasks(initialMasks);
    setSelectedIdx(null);
    setUndoStack([]);
    setIsWon(false);
    setIsAnimating(false);

    if (index === 0) {
      setShowTutorial(true);
    }
    setShowStageSelect(false);
  }, []);

  useEffect(() => {
    initLevel(currentLevelIndex);
  }, [currentLevelIndex, initLevel]);

  // Win condition check
  useEffect(() => {
    if (bottles.length === 0 || isAnimating) return;

    const allResolved = bottles.every(bottle => {
      if (bottle.length === 0) return true;
      if (bottle.length < 4) return false;
      const firstColor = bottle[0];
      return bottle.every(c => c === firstColor);
    });

    if (allResolved && bottles.some(b => b.length > 0)) {
      setIsWon(true);
    }
  }, [bottles, isAnimating]);

  const handleBottleClick = async (idx: number) => {
    if (isWon || isAnimating || showTutorial || showStageSelect) return;

    if (selectedIdx === null) {
      if (bottles[idx].length > 0) {
        setSelectedIdx(idx);
      }
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      const source = bottles[selectedIdx];
      const target = bottles[idx];

      if (source.length === 0) {
        setSelectedIdx(null);
        return;
      }

      const sourceColor = source[source.length - 1];
      const targetColor = target.length > 0 ? target[target.length - 1] : null;

      const canPour = (targetColor === null || targetColor === sourceColor) && target.length < 4;

      if (canPour) {
        await executePour(selectedIdx, idx);
      } else {
        setSelectedIdx(null);
      }
    }
  };

  const bottleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const bWidth = Math.min(64, Math.max(36, (windowDim.w - 120) / (bottles.length || 8)));
  const bHeight = bWidth * 3.75;

  const executePour = async (fromIdx: number, toIdx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const sourceRef = bottleRefs.current[fromIdx];
    const targetRef = bottleRefs.current[toIdx];
    
    if (!sourceRef || !targetRef) {
      setIsAnimating(false);
      return;
    }

    const sourceColor = bottles[fromIdx][bottles[fromIdx].length - 1];
    let unitsToMove = 0;
    const currentBottlesSnapshot = bottles.map(b => [...b]);
    
    while (
      currentBottlesSnapshot[fromIdx].length > 0 && 
      currentBottlesSnapshot[fromIdx][currentBottlesSnapshot[fromIdx].length - 1] === sourceColor && 
      currentBottlesSnapshot[toIdx].length + unitsToMove < 4
    ) {
      unitsToMove++;
      currentBottlesSnapshot[fromIdx].pop();
    }

    const sRect = sourceRef.getBoundingClientRect();
    const tRect = targetRef.getBoundingClientRect();
    
    const xOffset = toIdx > fromIdx ? -bWidth * 0.6 : bWidth * 0.6;
    const distanceX = tRect.left - sRect.left + xOffset;
    const distanceY = tRect.top - sRect.top - bHeight * 0.55;

    const timeline = gsap.timeline({
      onComplete: () => {
        setUndoStack(prev => [{ bottles: bottles.map(b => [...b]), masks: revealedMasks.map(m => [...m]) }, ...prev].slice(0, 5));
        
        const finalBottles = bottles.map(b => [...b]);
        const finalMasks = revealedMasks.map(m => [...m]);

        for(let i=0; i<unitsToMove; i++) {
          const color = finalBottles[fromIdx].pop();
          if (color) {
            finalBottles[toIdx].push(color);
            // When moving to target, that slot is revealed
            finalMasks[toIdx][finalBottles[toIdx].length - 1] = true;
          }
        }
        
        // After move, the NEW top of source is revealed
        if (finalBottles[fromIdx].length > 0) {
          finalMasks[fromIdx][finalBottles[fromIdx].length - 1] = true;
        }
        
        setBottles(finalBottles);
        setRevealedMasks(finalMasks);
        setIsAnimating(false);
        setSelectedIdx(null);
        gsap.set(sourceRef, { x: 0, y: 0, rotation: 0, zIndex: 10 });
      }
    });

    timeline.to(sourceRef, {
      x: distanceX,
      y: distanceY,
      duration: 0.25,
      ease: "power2.out",
      zIndex: 100
    });

    timeline.to(sourceRef, {
      rotation: toIdx > fromIdx ? 85 : -85,
      duration: 0.15,
      ease: "power2.inOut"
    }, "-=0.05");

    for (let i = 0; i < unitsToMove; i++) {
      timeline.to({}, {
        duration: 0.1,
        onStart: () => {
          setBottles(prev => {
            const next = prev.map(b => [...b]);
            const color = next[fromIdx].pop();
            if (color) next[toIdx].push(color);
            return next;
          });
          setRevealedMasks(prev => {
            const next = prev.map(m => [...m]);
            // Target slot becomes revealed during transfer
            const targetLen = bottles[toIdx].length + i + 1;
            if (targetLen <= 4) next[toIdx][targetLen - 1] = true;
            return next;
          });
        }
      });
    }

    timeline.to(sourceRef, {
      rotation: 0,
      duration: 0.15,
      ease: "power1.inOut"
    });

    timeline.to(sourceRef, {
      x: 0,
      y: 0,
      duration: 0.2,
      ease: "power2.inOut"
    }, "-=0.05");
  };

  const undo = () => {
    if (undoStack.length === 0 || isAnimating) return;
    const { bottles: prevBottles, masks: prevMasks } = undoStack[0];
    setBottles(prevBottles);
    setRevealedMasks(prevMasks);
    setUndoStack(prev => prev.slice(1));
    setSelectedIdx(null);
  };

  const nextStage = () => {
    if (currentLevelIndex < LEVELS_CONFIG.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      initLevel(currentLevelIndex);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden font-sans select-none"
      style={{
        backgroundImage: "url('https://lh3.googleusercontent.com/d/1Y_hvRo2iMfxBg3dhmogwNeP19zlpmFkM')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <header className="relative pt-12 pb-4 w-full flex flex-col items-center gap-4 z-30">
        <h1 className="text-4xl md:text-5xl font-black text-emerald-900 tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] text-center px-4">
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
        <div 
          className="flex flex-row flex-nowrap justify-center items-end gap-1 md:gap-8 w-full overflow-visible"
        >
          {bottles.map((bottleColors, i) => (
            <Bottle
              key={`${currentLevelIndex}-${i}`}
              ref={(el) => (bottleRefs.current[i] = el)}
              colors={bottleColors}
              isSelected={selectedIdx === i}
              width={bWidth}
              height={bHeight}
              tilt={0}
              isBlind={LEVELS_CONFIG[currentLevelIndex]?.isBlind}
              revealedMask={revealedMasks[i]}
              onClick={() => handleBottleClick(i)}
            />
          ))}
        </div>
      </main>

      <footer className="fixed bottom-12 w-full flex justify-center gap-4 md:gap-8 z-40 px-4">
        <button
          onClick={() => initLevel(currentLevelIndex)}
          disabled={isAnimating}
          className="group flex items-center gap-2 md:gap-3 bg-white/95 hover:bg-white px-6 md:px-10 py-4 md:py-5 rounded-full shadow-xl border-2 border-orange-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className="w-5 h-5 md:w-6 md:h-6 text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-black text-gray-800 text-sm md:text-lg">リセット</span>
        </button>
        <button
          onClick={undo}
          disabled={undoStack.length === 0 || isAnimating}
          className="group flex items-center gap-2 md:gap-3 bg-white/95 hover:bg-white px-6 md:px-10 py-4 md:py-5 rounded-full shadow-xl border-2 border-blue-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Undo2 className="w-5 h-5 md:w-6 md:h-6 text-blue-500 group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-gray-800 text-sm md:text-lg">1手戻る</span>
        </button>
      </footer>

      <AnimatePresence>
        {showStageSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full flex flex-col items-center gap-8 shadow-2xl border-4 border-emerald-300"
            >
              <h3 className="text-3xl font-black text-emerald-900">ステージ選択</h3>
              <div className="grid grid-cols-3 gap-4 w-full">
                {LEVELS_CONFIG.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentLevelIndex(idx);
                      setShowStageSelect(false);
                    }}
                    className={cn(
                      "aspect-square rounded-2xl flex items-center justify-center text-2xl font-black shadow-md transition-all active:scale-90",
                      currentLevelIndex === idx 
                        ? "bg-emerald-500 text-white shadow-emerald-200" 
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowStageSelect(false)}
                className="text-gray-400 font-bold hover:text-gray-600"
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full flex flex-col items-center gap-8 shadow-2xl border-4 border-emerald-200"
            >
              <div className="text-center">
                <h3 className="text-2xl font-black text-emerald-900 mb-4">遊び方</h3>
                <p className="text-gray-700 font-bold leading-relaxed">
                  同じ色の液体を重ねて、瓶を1色で満たそう！<br/>
                  空の瓶も活用してね。
                </p>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-full font-black text-xl shadow-lg transition-all active:translate-y-1"
              >
                了解！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-16 flex flex-col items-center gap-10 shadow-2xl border-x-[12px] border-emerald-100"
            >
              <motion.div 
                animate={{ 
                  rotate: [0, -15, 15, -15, 15, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner"
              >
                <Trophy className="w-16 h-16 text-yellow-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-gray-800 tracking-tighter">クリア！</h2>
                <p className="text-emerald-600 font-bold text-xl mt-4">ステージ {currentLevelIndex + 1} をクリアしました。</p>
              </div>
              <button
                onClick={nextStage}
                className="flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white px-16 py-6 rounded-full font-black text-3xl shadow-[0_10px_0_rgb(5,150,105)] active:shadow-none active:translate-y-2 transition-all group"
              >
                {currentLevelIndex < LEVELS_CONFIG.length - 1 ? '次のステージ' : 'もう一度遊ぶ'}
                <ChevronRight className="w-10 h-10 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
