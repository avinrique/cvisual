'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Narration from '@/components/shared/Narration';
import BitCharacter from '@/components/shared/BitCharacter';
import GlowBox from '@/components/shared/GlowBox';
import InteractiveIndicator from '@/components/shared/InteractiveIndicator';
import { useAppStore } from '@/lib/store';

/* ─── Fence SVG helpers ─── */
const FENCE_Y = 80;
const POST_HEIGHT = 50;
const SECTION_WIDTH = 50;
const POST_COLOR = '#A78BFA'; // purple
const RAIL_COLOR = '#60A5FA'; // blue

function FencePost({ x, broken = false, delay = 0 }: { x: number; broken?: boolean; delay?: number }) {
  if (broken) return null;
  return (
    <motion.line
      x1={x} y1={FENCE_Y} x2={x} y2={FENCE_Y + POST_HEIGHT}
      stroke={POST_COLOR} strokeWidth={4} strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    />
  );
}

function FenceSection({
  x, width, delay = 0, falling = false,
}: { x: number; width: number; delay?: number; falling?: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={falling
        ? { opacity: [0, 1, 1], rotate: [0, 0, 15], y: [0, 0, 20] }
        : { opacity: 1 }
      }
      transition={falling
        ? { delay, duration: 1.2, times: [0, 0.3, 1] }
        : { delay, duration: 0.3 }
      }
      style={{ transformOrigin: `${x}px ${FENCE_Y + 15}px` }}
    >
      <line
        x1={x} y1={FENCE_Y + 15} x2={x + width} y2={FENCE_Y + 15}
        stroke={RAIL_COLOR} strokeWidth={3}
      />
      <line
        x1={x} y1={FENCE_Y + 35} x2={x + width} y2={FENCE_Y + 35}
        stroke={RAIL_COLOR} strokeWidth={3}
      />
    </motion.g>
  );
}

function Fence({
  sections,
  posts,
  fallingLast = false,
  svgWidth = 340,
  svgHeight = 160,
}: {
  sections: number;
  posts: number;
  fallingLast?: boolean;
  svgWidth?: number;
  svgHeight?: number;
}) {
  const startX = (svgWidth - sections * SECTION_WIDTH) / 2;
  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      {Array.from({ length: sections }).map((_, i) => {
        const isFalling = fallingLast && i === sections - 1 && posts <= sections;
        return (
          <FenceSection
            key={`s-${i}`}
            x={startX + i * SECTION_WIDTH}
            width={SECTION_WIDTH}
            delay={i * 0.15}
            falling={isFalling}
          />
        );
      })}
      {Array.from({ length: posts }).map((_, i) => (
        <FencePost
          key={`p-${i}`}
          x={startX + i * SECTION_WIDTH}
          delay={i * 0.15}
        />
      ))}
    </svg>
  );
}

/* ─── Pizza slice ─── */
function PizzaSlice({ x, y, fade = false, delay = 0 }: { x: number; y: number; fade?: boolean; delay?: number }) {
  return (
    <motion.circle
      cx={x} cy={y} r={14}
      fill="#F59E0B"
      stroke="#D97706"
      strokeWidth={2}
      initial={{ opacity: 0, scale: 0 }}
      animate={fade ? { opacity: [1, 0], scale: [1, 0.3] } : { opacity: 1, scale: 1 }}
      transition={fade ? { delay, duration: 0.6 } : { delay, duration: 0.3 }}
    />
  );
}

/* ─── Main scene ─── */
export default function OffByOne() {
  const [phase, setPhase] = useState(0);
  const setSceneStepHandler = useAppStore(s => s.setSceneStepHandler);
  const setSceneStepBackHandler = useAppStore(s => s.setSceneStepBackHandler);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  /* Interactive state for phase 2 */
  const [fenceLen, setFenceLen] = useState(5);
  const [wantInclude, setWantInclude] = useState(false);

  const stableStepHandler = useCallback(() => {
    if (phaseRef.current >= 4) return false;
    setPhase(prev => prev + 1);
    return true;
  }, []);

  const stableStepBackHandler = useCallback(() => {
    if (phaseRef.current <= 0) return false;
    setPhase(prev => prev - 1);
    return true;
  }, []);

  useEffect(() => {
    setSceneStepHandler(stableStepHandler);
    setSceneStepBackHandler(stableStepBackHandler);
    return () => {
      setSceneStepHandler(null);
      setSceneStepBackHandler(null);
    };
  }, [setSceneStepHandler, stableStepHandler, setSceneStepBackHandler, stableStepBackHandler]);

  /* ─── Narrations ─── */
  const narrations: Record<number, string> = {
    0: 'The most common loop bug has a name: off-by-one.',
    1: '< vs <= is where most off-by-ones hide.',
    2: 'Do you want to include the endpoint, or stop before it?',
    3: "Integer division throws away the decimal. C doesn't round — it truncates.",
    4: "These three traps catch every beginner. Now they won't catch you.",
  };

  return (
    <div
      data-interactive={phase === 2 ? true : undefined}
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-void"
    >
      <AnimatePresence mode="wait">
        {/* ────────────── PHASE 0: Fence building ────────────── */}
        {phase === 0 && (
          <motion.div
            key="p0"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="font-code text-sm text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Build 5 fence sections... but only 5 posts?
            </motion.p>

            <Fence sections={5} posts={5} fallingLast svgWidth={340} svgHeight={160} />

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <BitCharacter mood="sad" size={45} color="#00BFFF" />
              <span className="text-sm font-code text-dim">5 sections need 6 posts!</span>
            </motion.div>
          </motion.div>
        )}

        {/* ────────────── PHASE 1: Side-by-side < vs <= ────────────── */}
        {phase === 1 && (
          <motion.div
            key="p1"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex gap-10">
              {/* i < 5 */}
              <div className="flex flex-col items-center gap-3">
                <GlowBox color="#22C55E" intensity={0.3}>
                  <pre className="font-code text-sm px-4 py-2">
                    <span className="text-purple">for</span>
                    <span className="text-dim">(i=0; </span>
                    <span className="text-green">i&lt;5</span>
                    <span className="text-dim">; i++)</span>
                  </pre>
                </GlowBox>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map(n => (
                    <motion.div
                      key={n}
                      className="w-9 h-9 rounded bg-green/20 border border-green/40 flex items-center justify-center font-code text-sm text-green"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: n * 0.12 }}
                    >
                      {n}
                    </motion.div>
                  ))}
                </div>
                <motion.span
                  className="font-code text-xs text-green"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  5 iterations
                </motion.span>
                <Fence sections={5} posts={6} svgWidth={280} svgHeight={120} />
              </div>

              {/* i <= 5 */}
              <div className="flex flex-col items-center gap-3">
                <GlowBox color="#EF4444" intensity={0.3}>
                  <pre className="font-code text-sm px-4 py-2">
                    <span className="text-purple">for</span>
                    <span className="text-dim">(i=0; </span>
                    <span className="text-red">i&lt;=5</span>
                    <span className="text-dim">; i++)</span>
                  </pre>
                </GlowBox>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <motion.div
                      key={n}
                      className={`w-9 h-9 rounded flex items-center justify-center font-code text-sm ${
                        n === 5
                          ? 'bg-red/20 border border-red/40 text-red'
                          : 'bg-amber/20 border border-amber/40 text-amber'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: n * 0.12 }}
                    >
                      {n}
                    </motion.div>
                  ))}
                </div>
                <motion.span
                  className="font-code text-xs text-red"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  6 iterations — extra!
                </motion.span>
                <Fence sections={6} posts={7} svgWidth={340} svgHeight={120} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ────────────── PHASE 2: Interactive slider ────────────── */}
        {phase === 2 && (
          <motion.div
            key="p2"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Slider */}
            <GlowBox color="#8B5CF6" intensity={0.3}>
              <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-code text-dim">Fence length:</label>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={fenceLen}
                    onChange={e => setFenceLen(Number(e.target.value))}
                    className="flex-1 accent-purple"
                  />
                  <span className="font-code text-lg text-purple font-bold w-6 text-right">{fenceLen}</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setWantInclude(prev => !prev); }}
                  className="px-4 py-2 rounded-lg text-sm font-code bg-surface border border-white/10 text-dim hover:text-primary transition"
                >
                  {wantInclude
                    ? `I want to include ${fenceLen}`
                    : `I want ${fenceLen} iterations`
                  }
                </button>
              </div>
            </GlowBox>

            {/* Two fences side by side */}
            <div className="flex gap-8">
              {/* i < N */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-code text-xs text-green">
                  i &lt; {fenceLen} — {fenceLen} iterations
                </span>
                <Fence
                  sections={fenceLen}
                  posts={fenceLen + 1}
                  svgWidth={Math.max(200, fenceLen * SECTION_WIDTH + 60)}
                  svgHeight={120}
                />
              </div>

              {/* i <= N */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-code text-xs text-amber">
                  i &lt;= {fenceLen} — {fenceLen + 1} iterations
                </span>
                <Fence
                  sections={fenceLen + 1}
                  posts={fenceLen + 2}
                  svgWidth={Math.max(200, (fenceLen + 1) * SECTION_WIDTH + 60)}
                  svgHeight={120}
                />
              </div>
            </div>

            {/* Recommendation */}
            <motion.div
              className="px-4 py-2 rounded-lg bg-surface border border-white/10 font-code text-sm text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {wantInclude
                ? <span>Use <span className="text-amber">i &lt;= {fenceLen}</span> to include {fenceLen}</span>
                : <span>Use <span className="text-green">i &lt; {fenceLen}</span> for exactly {fenceLen} iterations</span>
              }
            </motion.div>

            <InteractiveIndicator />
          </motion.div>
        )}

        {/* ────────────── PHASE 3: Integer division ────────────── */}
        {phase === 3 && (
          <motion.div
            key="p3"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlowBox color="#F59E0B" intensity={0.4}>
              <pre className="font-code text-xl px-6 py-3 text-center">
                <span className="text-amber">5</span>
                <span className="text-dim"> / </span>
                <span className="text-blue">2</span>
                <span className="text-dim"> = </span>
                <span className="text-red">2</span>
                <span className="text-dim text-sm ml-2">??</span>
              </pre>
            </GlowBox>

            {/* Pizza metaphor */}
            <div className="flex items-center gap-8">
              {/* 5 slices */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-code text-xs text-dim">5 slices</span>
                <svg width={180} height={50}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <PizzaSlice key={i} x={20 + i * 36} y={25} fade={i === 4} delay={0.8 + i * 0.1} />
                  ))}
                </svg>
              </div>

              <span className="font-code text-2xl text-dim">/</span>

              {/* 2 people */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-code text-xs text-dim">2 people</span>
                <div className="flex gap-4">
                  <BitCharacter mood="happy" size={35} color="#00BFFF" />
                  <BitCharacter mood="happy" size={35} color="#22C55E" />
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="flex gap-8">
              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="font-code text-sm text-red">int: 5/2</span>
                <div className="px-4 py-2 rounded-lg bg-red/10 border border-red/30 font-code text-2xl text-red font-bold">
                  2
                </div>
                <span className="font-code text-xs text-dim">remainder lost!</span>
              </motion.div>

              <motion.div
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                <span className="font-code text-sm text-green">fix: 5.0/2</span>
                <div className="px-4 py-2 rounded-lg bg-green/10 border border-green/30 font-code text-2xl text-green font-bold">
                  2.5
                </div>
                <span className="font-code text-xs text-dim">use float!</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ────────────── PHASE 4: Summary tiles ────────────── */}
        {phase === 4 && (
          <motion.div
            key="p4"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
              className="font-display text-2xl text-primary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Beginner Traps
            </motion.h2>

            <div className="flex gap-6">
              {[
                {
                  title: '< vs <=',
                  desc: 'Off by one iteration',
                  color: '#A78BFA',
                  bgClass: 'bg-purple/10 border-purple/30',
                },
                {
                  title: '0 vs 1 start',
                  desc: 'Arrays start at 0',
                  color: '#60A5FA',
                  bgClass: 'bg-blue/10 border-blue/30',
                },
                {
                  title: '5/2 = 2',
                  desc: 'Integer division truncates',
                  color: '#F59E0B',
                  bgClass: 'bg-amber/10 border-amber/30',
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  className={`rounded-xl px-6 py-5 border flex flex-col items-center gap-2 min-w-[160px] ${card.bgClass}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <span className="font-code text-lg font-bold" style={{ color: card.color }}>
                    {card.title}
                  </span>
                  <span className="font-body text-sm text-dim text-center">{card.desc}</span>
                  <svg width={24} height={24} viewBox="0 0 24 24">
                    <path
                      d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z"
                      fill={card.color}
                      opacity={0.7}
                    />
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration */}
      <Narration text={narrations[phase]} delay={0.5} key={phase} />
    </div>
  );
}
