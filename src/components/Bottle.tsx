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
  isBlind?: boolean;
  revealedMask?: boolean[];
  onClick: () => void;
}

const Bottle = forwardRef<HTMLDivElement, BottleProps>(({
  colors, isSelected, tilt, width = 64, height = 240,
  isBlind = false, revealedMask, onClick
}, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        y: isSelected ? -height * 0.2 : 0,
        duration: 0.25,
        ease: "power2.out"
      });
    }
  }, [isSelected, height]);

  return (
    <div
      ref={ref}
      className={cn("relative cursor-pointer z-10")}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={onClick}
    >
      <div ref={innerRef} className="w-full h-full relative">
        {/* Glass Body */}
        <div className="absolute inset-x-0 bottom-0 top-0 border-4 border-white/70 bg-white/10 backdrop-blur-[1px] rounded-b-full rounded-t-lg shadow-xl overflow-hidden z-20 pointer-events-none">
          {/* Inner Highlight */}
          <div className="absolute left-2 top-4 bottom-4 w-1 bg-white/20 rounded-full z-30" />

          {/* Liquid Stack */}
          <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col-reverse z-10">
            {colors.map((colorId, index) => {
              // Only hide if isBlind is active AND this specific unit hasn't been revealed (top unit or previously top)
              const isHidden = isBlind && !(revealedMask?.[index] ?? false);

              return (
                <div
                  key={`${index}-${colorId}`}
                  className="w-full relative flex items-center justify-center"
                  style={{
                    height: '25%',
                    backgroundColor: isHidden ? '#71717a' : COLORS[colorId],
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: index === 0 ? `0 0 ${width}px ${width}px` : '0',
                  }}
                >
                  {isHidden && (
                    <span
                      className="text-white/30 font-black select-none"
                      style={{ fontSize: `${width * 0.3}px` }}
                    >
                      ?
                    </span>
                  )}
                  {/* Liquid surface highlight */}
                  {index === colors.length - 1 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottle Rim */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-white/70 bg-white/20 rounded-full z-30 pointer-events-none shadow-sm"
          style={{
            width: `${width * 1.25}px`,
            height: `${width * 0.2}px`,
          }}
        />
      </div>
    </div>
  );
});

Bottle.displayName = 'Bottle';

export default Bottle;
