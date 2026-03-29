import React, { useMemo, useRef, useLayoutEffect, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

// ── RE-ENGINEERED "PREMIUM OCEAN" PALETTE ────────────────────────────────────
// These match the sophisticated, desaturated tones in your mockup.
const OCEAN_GREEN = 'rgba(20, 148, 120, 0.85)';  // The "Ocean Green" you requested
const SAGE_GREEN = 'rgb(230, 255, 212)';   // Soft, desaturated mint/sage
const BRONZE_GOLD = 'rgb(250, 248, 157)';  // Sophisticated bronze-sand
const RUST_RED = 'rgba(158, 42, 43, 0.8)';       // Elegant, deep rust red

const VISIBLE_ITEMS = 5;

// ── STYLED COMPONENTS ────────────────────────────────────────────────────────
const HUDContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #000; /* Deep base for color pop */
`;

// THIS IS THE NEW VANILLA LAYER
const VanillaGlassOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2; /* Sits above the gradient, below the text */
  pointer-events: none;

  /* 1. The "Milky" tint and blur */
  background: linear-gradient(
    135deg, 
    rgba(255, 255, 255, 0.18) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    transparent 100%
  );
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);

  /* 2. The Specular highlight (the white edge shine) */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent 20%);
  }
`;

const HeatStripWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  background: ${({ gradient }) => gradient || 'transparent'};
  display: flex;
  flex-direction: column;
  z-index: 1; /* Lowest layer */
`;

const Row = styled.div`
  height: 22px; 
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #FFFFFF; /* Brighter text to cut through the frost */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 3; /* Highest layer - floats ON the glass */
  transition: all 0.2s ease;
`;

const CurrentScorePointer = styled.div`
  position: absolute;
  right: -7px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 6px solid #eab704;
  filter: drop-shadow(0 0 5px rgba(234, 183, 4, 0.9));
  z-index: 10;
  pointer-events: none;
`;

const ScrollableContent = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
const LeftVerticalBar = ({
  gameImpacts = [],
  currentIndex = -1,
  showScoreMarker = true,
  gameSideRef
}) => {
  const scrollRef = useRef(null);
  const hudRef = useRef(null);
  const activeRowRef = useRef(null);
  const [pointerTopPx, setPointerTopPx] = useState(null);

  // 1. Calculate Tiered Colors using the "Premium Ocean" Palette
  const { normalizedData, gradientString } = useMemo(() => {
    if (!gameImpacts || gameImpacts.length === 0) {
      return { normalizedData: [], gradientString: 'transparent' };
    }

    const maxPos = _.maxBy(gameImpacts, (i) => i.impactValue)?.impactValue || 1;
    const maxNeg = Math.abs(_.minBy(gameImpacts, (i) => i.impactValue)?.impactValue || -1);
    const denom = Math.max(gameImpacts.length - 1, 1);

    const data = gameImpacts.map((item, index) => {
      const val = item.impactValue >= 0 
        ? item.impactValue / maxPos 
        : item.impactValue / maxNeg;

      // Logic to assign the new sophisticated colors
      let color = BRONZE_GOLD;
      if (item.impactValue > 0) {
        color = val >= 0.8 ? OCEAN_GREEN : SAGE_GREEN;
      } else if (item.impactValue < 0) {
        color = val <= -0.8 ? RUST_RED : BRONZE_GOLD;
      }

      const stopPosition = (index / denom) * 100;
      return { ...item, color, val, stopPosition };
    });

    const stops = data.map((item) => `${item.color} ${item.stopPosition}%`);
    const gradient = `linear-gradient(to bottom, ${stops.join(', ')})`;

    return { normalizedData: data, gradientString: gradient };
  }, [gameImpacts]);

  // 2. Position the Golden Pointer
  const updatePointerTop = useCallback(() => {
    if (!activeRowRef.current || !hudRef.current) return;
    const rowRect = activeRowRef.current.getBoundingClientRect();
    const hudRect = hudRef.current.getBoundingClientRect();
    const relativeTop = rowRect.top - hudRect.top + rowRect.height / 2;
    setPointerTopPx(relativeTop);
  }, []);

  // 3. Sync Scroll Position
  useLayoutEffect(() => {
    if (currentIndex >= 0 && scrollRef.current && activeRowRef.current) {
      const rowHeight = 22;
      const centerOffset = (VISIBLE_ITEMS * rowHeight) / 2 - rowHeight / 2;
      scrollRef.current.scrollTop = currentIndex * rowHeight - centerOffset;
      updatePointerTop();
    }
  }, [currentIndex, normalizedData.length, updatePointerTop]);

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onUpdate = () => updatePointerTop();
    sc.addEventListener('scroll', onUpdate, { passive: true });
    window.addEventListener('resize', onUpdate);
    return () => {
      sc.removeEventListener('scroll', onUpdate);
      window.removeEventListener('resize', onUpdate);
    };
  }, [updatePointerTop]);

  return (
    <>
      <div className="game-side-heat">
        <HUDContainer ref={hudRef}>
          <ScrollableContent ref={scrollRef}>
            <HeatStripWrapper gradient={gradientString}>
              {normalizedData.map((item, index) => {
                const isCurrent = index === currentIndex;
                return (
                  <Row
                    key={index}
                    ref={isCurrent ? activeRowRef : undefined}
                    style={isCurrent ? {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontWeight: 900,
                      opacity: 1
                    } : undefined}
                  >
                    {item.gameScoreLabel}
                  </Row>
                );
              })}
            </HeatStripWrapper>
          </ScrollableContent>
        </HUDContainer>
        <VanillaGlassOverlay />
      </div>
      {showScoreMarker && pointerTopPx != null ? (
        <CurrentScorePointer aria-hidden style={{ top: pointerTopPx }} />
      ) : null}
    </>
  );
};

export default LeftVerticalBar;