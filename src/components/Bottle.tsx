import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ColorId, COLORS } from '../types';
import { cn } from '../lib/utils';

interface BottleProps {
  colors: ColorId[];
  isSelected: boolean;
  tilt: number;
  width?: number;
  height?: number;
  capacity?: number;
  revealedMask?: boolean[];
  onClick: () => void;
}

const Bottle = forwardRef<HTMLDivElement, BottleProps>(({
  colors, isSelected, tilt, width = 64, height = 240,
  capacity = 4, revealedMask, onClick,
}, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        y: isSelected ? -height * 0.2 : 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  }, [isSelected, height]);

  const cellHeight = `${100 / capacity}%`;

  return (
    <div
      ref={ref}
      className={cn('relative cursor-pointer z-10')}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.55))',
      }}
      onClick={onClick}
    >
      <div ref={innerRef} className="w-full h-full relative">

        {/* ガラス本体 */}
        <div
          className="absolute inset-x-0 bottom-0 top-0 rounded-b-full rounded-t-lg overflow-hidden z-20 pointer-events-none"
          style={{
            border: '3px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(1px)',
            boxShadow: 'inset 0 0 0 1.5px rgba(0,0,0,0.18), inset 2px 0 6px rgba(255,255,255,0.25)',
          }}
        >
          <div className="absolute left-2 top-4 bottom-4 w-1 bg-white/30 rounded-full z-30" />

          {/* 液体スタック */}
          <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col-reverse z-10">
            {colors.map((colorId, index) => {
              const isTop = index === colors.length - 1;
              // ── 新ルール: トップセルは常に実際の色を表示、それ以外はマスクで判定 ──
              const isHidden = !isTop && !(revealedMask?.[index] ?? true);

              return (
                <div
                  key={`${index}-${colorId}`}
                  className="w-full relative flex items-center justify-center"
                  style={{
                    height: cellHeight,
                    backgroundColor: isHidden ? '#5a5a6a' : COLORS[colorId],
                    borderTop: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: index === 0 ? `0 0 ${width}px ${width}px` : '0',
                    boxShadow: isHidden ? 'none' : 'inset 0 2px 4px rgba(255,255,255,0.25)',
                  }}
                >
                  {isHidden && (
                    <span
                      className="text-white/40 font-black select-none"
                      style={{ fontSize: `${width * 0.3}px` }}
                    >
                      ?
                    </span>
                  )}
                  {isTop && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/35" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 瓶の口 */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full z-30 pointer-events-none"
          style={{
            width: `${width * 1.25}px`,
            height: `${width * 0.2}px`,
            border: '3px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.25)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  );
});

Bottle.displayName = 'Bottle';

export default Bottle;
