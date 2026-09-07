import React from "react";
import { motion, type Transition } from "framer-motion";

export interface FlowerProps {
  stemType?: "normal" | "wavy";
  hasLeaves?: boolean;
  petalLayers?: 1 | 2;
  petalColor?: "default" | "white";
  centerColor?: "default" | "black";
  className?: string;
  animate?: boolean;
}

export const FlowerSVG: React.FC<FlowerProps> = ({
  stemType = "normal",
  hasLeaves = false,
  petalLayers = 1,
  petalColor = "default",
  centerColor = "default",
  className = "w-48 h-72",
  animate = true,
}) => {
  const colorMap = {
    petal: {
      default: "#F472B6",
      white: "#FFFFFF",
    },
    center: {
      default: "#FBBF24",
      black: "#1F2937",
    },
  };

  const actualPetalColor = colorMap.petal[petalColor];
  const actualCenterColor = colorMap.center[centerColor];

  const stemPaths = {
    normal: "M 100 280 L 100 160",
    wavy: "M 100 280 Q 80 240 100 210 T 100 160",
  };

  const springTransition: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 15,
  };

  const colorTransition: Transition = {
    duration: 0.6,
    ease: "easeInOut",
  };

  const petalAngles = [0, 60, 120, 180, 240, 300];

  return (
    <svg viewBox="0 0 200 300" className={`overflow-visible ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      <g id="flower-group">
        <motion.path
          d={stemPaths[stemType]}
          fill="none"
          stroke="#10B981"
          strokeWidth="8"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1, d: stemPaths[stemType] }}
          transition={{
            pathLength: { duration: 0.8, ease: "easeOut" },
            d: { duration: 0.5, ease: "easeInOut" },
          }}
        />

        {hasLeaves && (
          <g id="leaves">
            <motion.path
              d="M 100 220 C 70 210 50 220 40 200 C 60 190 90 200 100 220 Z"
              fill="#059669"
              initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...springTransition, delay: 0.4 }}
              style={{ transformOrigin: "100px 220px" }}
            />
            <motion.path
              d="M 100 200 C 130 190 150 200 160 180 C 140 170 110 180 100 200 Z"
              fill="#059669"
              initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...springTransition, delay: 0.5 }}
              style={{ transformOrigin: "100px 200px" }}
            />
          </g>
        )}

        <g id="flower-head" transform="translate(100, 160)" filter="url(#soft-shadow)">
          {petalLayers === 2 && (
            <motion.g
              id="outer-petal-layer"
              initial={
                animate ? { scale: 0, opacity: 0, rotate: -30 } : { scale: 1.25, opacity: 0.8, rotate: 30 }
              }
              animate={{ scale: 1.25, opacity: 0.8, rotate: 30 }}
              transition={{ ...springTransition, delay: 0.3 }}
            >
              {petalAngles.map((angle, index) => (
                <motion.path
                  key={`outer-petal-${index}`}
                  d="M 0 0 C -20 -35 -15 -65 0 -80 C 15 -65 20 -35 0 0 Z"
                  fill={actualPetalColor}
                  stroke="#E11D48"
                  strokeWidth="1.5"
                  transform={`rotate(${angle})`}
                  animate={{ fill: actualPetalColor }}
                  transition={colorTransition}
                />
              ))}
            </motion.g>
          )}

          <motion.g
            id="inner-petal-layer"
            initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springTransition, delay: 0.2 }}
          >
            {petalAngles.map((angle, index) => (
              <motion.path
                key={`inner-petal-${index}`}
                d="M 0 0 C -20 -35 -15 -65 0 -80 C 15 -65 20 -35 0 0 Z"
                fill={actualPetalColor}
                stroke={petalColor === "white" ? "#CBD5E1" : "#DB2777"}
                strokeWidth="2"
                transform={`rotate(${angle})`}
                animate={{ fill: actualPetalColor }}
                transition={colorTransition}
              />
            ))}
          </motion.g>

          <motion.circle
            cx="0"
            cy="0"
            r="22"
            fill={actualCenterColor}
            stroke="#D97706"
            strokeWidth="2.5"
            initial={animate ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1, fill: actualCenterColor }}
            transition={{
              scale: { ...springTransition, delay: 0.6 },
              fill: colorTransition,
            }}
          />
        </g>
      </g>
    </svg>
  );
};
