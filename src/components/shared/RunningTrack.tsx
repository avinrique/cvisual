'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import BitCharacter from '@/components/shared/BitCharacter';

interface Station {
  id: string;
  label: string;
  color: string;
  position: 'top' | 'right' | 'bottom';
}

interface RunningTrackProps {
  stations: Station[];
  currentStation: number;
  lap: number;
  jerseyNumber: number | string;
  running: boolean;
  showExit?: boolean;
  exitAtStation?: number;
  showTrampoline?: boolean;
  trampolineAtStation?: number;
  onLapComplete?: () => void;
  crumbling?: boolean;
  className?: string;
}

// Track geometry constants
const CX = 200;
const CY = 180;
const RX = 140;
const RY = 120;
const SVG_W = 400;
const SVG_H = 380;

// Get (x, y) on the ellipse for a given angle in radians
function ellipsePoint(angle: number): { x: number; y: number } {
  return {
    x: CX + RX * Math.cos(angle),
    y: CY + RY * Math.sin(angle),
  };
}

// Station angles: top = -π/2, right = 0, bottom = π/2
const POSITION_ANGLES: Record<string, number> = {
  top: -Math.PI / 2,
  right: 0,
  bottom: Math.PI / 2,
};

function getStationAngle(position: string): number {
  return POSITION_ANGLES[position] ?? 0;
}

function getStationPoint(position: string) {
  return ellipsePoint(getStationAngle(position));
}

// Build crumbling segments (6 arcs)
function buildSegments(): string[] {
  const segments: string[] = [];
  const count = 6;
  for (let i = 0; i < count; i++) {
    const startAngle = (i / count) * Math.PI * 2;
    const endAngle = ((i + 1) / count) * Math.PI * 2;
    const start = ellipsePoint(startAngle);
    const end = ellipsePoint(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    segments.push(
      `M ${start.x} ${start.y} A ${RX} ${RY} 0 ${largeArc} 1 ${end.x} ${end.y}`
    );
  }
  return segments;
}

export default function RunningTrack({
  stations,
  currentStation,
  lap,
  jerseyNumber,
  running,
  showExit = false,
  exitAtStation = 0,
  showTrampoline = false,
  trampolineAtStation = 0,
  onLapComplete,
  crumbling = false,
  className = '',
}: RunningTrackProps) {
  const prevStationRef = useRef(currentStation);
  const prevLapRef = useRef(lap);

  const handleLapComplete = useCallback(() => {
    onLapComplete?.();
  }, [onLapComplete]);

  // Detect lap completion
  useEffect(() => {
    if (lap > prevLapRef.current) {
      handleLapComplete();
    }
    prevStationRef.current = currentStation;
    prevLapRef.current = lap;
  }, [currentStation, lap, handleLapComplete]);

  // Current runner position on the track
  const stationPos =
    stations[currentStation]?.position ?? 'top';
  const runnerPoint = getStationPoint(stationPos);

  const segments = buildSegments();

  // Station box dimensions
  const boxW = 80;
  const boxH = 32;

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="overflow-visible"
      >
        <defs>
          {/* Glow filter for the track */}
          <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Drop shadow for station boxes */}
          <filter id="station-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* ── Track ── */}
        {!crumbling ? (
          <>
            {/* Outer glow ring */}
            <ellipse
              cx={CX}
              cy={CY}
              rx={RX + 4}
              ry={RY + 4}
              fill="none"
              stroke="var(--accent-blue, #00BFFF)"
              strokeWidth={1}
              opacity={0.15}
            />
            {/* Main track */}
            <ellipse
              cx={CX}
              cy={CY}
              rx={RX}
              ry={RY}
              fill="none"
              stroke="var(--text-dim, #6B7394)"
              strokeWidth={6}
              strokeDasharray="12 6"
              opacity={0.6}
            />
            {/* Lane line */}
            <ellipse
              cx={CX}
              cy={CY}
              rx={RX}
              ry={RY}
              fill="none"
              stroke="var(--accent-blue, #00BFFF)"
              strokeWidth={1.5}
              opacity={0.3}
            />
          </>
        ) : (
          /* Crumbling segments */
          <AnimatePresence>
            {segments.map((d, i) => (
              <motion.path
                key={`seg-${i}`}
                d={d}
                fill="none"
                stroke="var(--text-dim, #6B7394)"
                strokeWidth={6}
                strokeDasharray="12 6"
                opacity={0.6}
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{
                  opacity: [0.6, 0.2, 0],
                  scale: [1, 1.05, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.25,
                  ease: 'easeOut',
                }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              />
            ))}
          </AnimatePresence>
        )}

        {/* ── Lap counter ── */}
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-dim, #6B7394)"
          fontSize={14}
          fontFamily="monospace"
          opacity={0.6}
        >
          Lap {lap}
        </text>

        {/* ── Stations ── */}
        {stations.map((station, i) => {
          const pt = getStationPoint(station.position);
          const isActive = currentStation === i;

          // Offset box so it sits outside the track
          let offsetX = 0;
          let offsetY = 0;
          if (station.position === 'top') offsetY = -28;
          if (station.position === 'bottom') offsetY = 28;
          if (station.position === 'right') offsetX = 28;

          const bx = pt.x + offsetX - boxW / 2;
          const by = pt.y + offsetY - boxH / 2;

          return (
            <g key={station.id}>
              {/* Connection dot on track */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={5}
                fill={station.color}
                opacity={isActive ? 1 : 0.5}
              />
              {isActive && (
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={10}
                  fill="none"
                  stroke={station.color}
                  strokeWidth={1.5}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0.6, 0], scale: [0.8, 1.8] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}

              {/* Station label box */}
              <motion.rect
                x={bx}
                y={by}
                width={boxW}
                height={boxH}
                rx={6}
                fill="var(--bg-surface, #141829)"
                stroke={station.color}
                strokeWidth={isActive ? 2 : 1}
                opacity={isActive ? 1 : 0.7}
                filter="url(#station-shadow)"
                animate={isActive ? { strokeWidth: [2, 3, 2] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              />
              <text
                x={bx + boxW / 2}
                y={by + boxH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={station.color}
                fontSize={12}
                fontFamily="monospace"
                fontWeight={isActive ? 700 : 400}
              >
                {station.label}
              </text>
            </g>
          );
        })}

        {/* ── Exit Door ── */}
        {showExit && stations[exitAtStation] && (() => {
          const exitStation = stations[exitAtStation];
          const pt = getStationPoint(exitStation.position);
          // Place exit further out from the track
          let ex = pt.x;
          let ey = pt.y;
          if (exitStation.position === 'top') ey -= 70;
          if (exitStation.position === 'bottom') ey += 70;
          if (exitStation.position === 'right') ex += 70;

          return (
            <motion.g
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Door frame */}
              <rect
                x={ex - 18}
                y={ey - 24}
                width={36}
                height={48}
                rx={3}
                fill="var(--accent-red, #FF4D6A)"
                opacity={0.9}
              />
              {/* Door inner */}
              <rect
                x={ex - 14}
                y={ey - 20}
                width={28}
                height={40}
                rx={2}
                fill="var(--bg-void, #0A0E27)"
              />
              {/* Door handle */}
              <circle cx={ex + 8} cy={ey} r={2.5} fill="var(--accent-gold, #FFD700)" />
              {/* EXIT label */}
              <text
                x={ex}
                y={ey - 30}
                textAnchor="middle"
                fill="var(--accent-red, #FF4D6A)"
                fontSize={11}
                fontWeight={700}
                fontFamily="monospace"
              >
                EXIT
              </text>
              {/* Glow pulse */}
              <motion.rect
                x={ex - 20}
                y={ey - 26}
                width={40}
                height={52}
                rx={4}
                fill="none"
                stroke="var(--accent-red, #FF4D6A)"
                strokeWidth={1.5}
                animate={{ opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Arrow line from station to exit */}
              <line
                x1={pt.x}
                y1={pt.y}
                x2={ex}
                y2={ey}
                stroke="var(--accent-red, #FF4D6A)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            </motion.g>
          );
        })()}

        {/* ── Trampoline ── */}
        {showTrampoline && stations[trampolineAtStation] && (() => {
          const tramStation = stations[trampolineAtStation];
          const pt = getStationPoint(tramStation.position);
          // Place trampoline on the track at the station
          const tx = pt.x;
          const ty = pt.y;

          return (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring' }}
            >
              {/* Trampoline base */}
              <rect
                x={tx - 20}
                y={ty + 4}
                width={40}
                height={4}
                rx={2}
                fill="var(--accent-purple, #A855F7)"
              />
              {/* Legs */}
              <line
                x1={tx - 16}
                y1={ty + 8}
                x2={tx - 20}
                y2={ty + 18}
                stroke="var(--accent-purple, #A855F7)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={tx + 16}
                y1={ty + 8}
                x2={tx + 20}
                y2={ty + 18}
                stroke="var(--accent-purple, #A855F7)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Bounce arc */}
              <motion.path
                d={`M ${tx - 22} ${ty + 2} Q ${tx} ${ty - 30} ${tx + 22} ${ty + 2}`}
                fill="none"
                stroke="var(--accent-cyan, #22D3EE)"
                strokeWidth={2}
                strokeDasharray="4 3"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              {/* Up arrows */}
              <motion.g
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <text
                  x={tx}
                  y={ty - 22}
                  textAnchor="middle"
                  fill="var(--accent-cyan, #22D3EE)"
                  fontSize={14}
                  fontFamily="monospace"
                  opacity={0.7}
                >
                  ↑
                </text>
              </motion.g>
            </motion.g>
          );
        })()}
      </svg>

      {/* ── Runner (BitCharacter) positioned absolutely ── */}
      <motion.div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          // BitCharacter is ~60px, center it on the track point
          width: 60,
          height: 60,
        }}
        animate={{
          x: runnerPoint.x - 30,
          y: runnerPoint.y - 30,
        }}
        transition={
          running
            ? { duration: 0.6, ease: 'easeInOut' }
            : { duration: 0.3, ease: 'easeOut' }
        }
      >
        <div className="relative">
          <BitCharacter
            mood={running ? 'excited' : crumbling ? 'scared' : 'neutral'}
            size={48}
            color="var(--accent-blue, #00BFFF)"
          />
          {/* Jersey number badge */}
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-code"
            style={{
              background: 'var(--accent-gold, #FFD700)',
              color: 'var(--bg-void, #0A0E27)',
            }}
          >
            {jerseyNumber}
          </div>
        </div>
      </motion.div>

      {/* ── Running dust particles ── */}
      {running && (
        <AnimatePresence>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`dust-${i}-${currentStation}`}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--text-dim, #6B7394)',
                left: runnerPoint.x - 2,
                top: runnerPoint.y + 20,
              }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{
                opacity: 0,
                scale: 0.3,
                x: (i - 1) * 10,
                y: 12 + i * 4,
              }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
