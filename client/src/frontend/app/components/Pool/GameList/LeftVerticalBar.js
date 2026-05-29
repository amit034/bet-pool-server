import React, { useMemo, useRef, useLayoutEffect, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

// ── RE-ENGINEERED "PREMIUM OCEAN" PALETTE ────────────────────────────────────
// These match the sophisticated, desaturated tones in your mockup.
const COLOR_POS_10 = 'rgba(20, 148, 120, 0.85)';  // Your Ocean Green (Anchor)
const COLOR_POS_08 = 'rgba(85, 153, 125, 0.85)';  // Deep Teal-Sage
const COLOR_POS_06 = 'rgba(147, 159, 138, 0.85)'; // Your Sea Green

// +0.4 to +0.2: The Transition Range
const COLOR_POS_04 = 'rgba(174, 175, 136, 0.85)'; // Muted Moss
const COLOR_POS_02 = 'rgba(205, 215, 160, 0.85)'; // Soft Sage

// 0.0: The Neutral Midpoint
const COLOR_NEUTRAL = 'rgba(225, 210, 140, 0.85)'; // Soft Golden Yellow

// -0.2 to -0.6: The "Negative" Warm Range
const COLOR_NEG_02 = 'rgba(205, 189, 133, 0.95)'; // Your Bronze Gold
const COLOR_NEG_04 = 'rgba(182, 159, 105, 0.95)'; // Your Yellow_4 (Golden Sand)
const COLOR_NEG_06 = 'rgba(153, 120, 81, 0.95)';  // Your Mouse Beige (Bronze-Sand)

// -1.0: The Warning/Negative Anchor
const COLOR_NEG_10 = 'rgba(158, 42, 43, 0.8)';    // Elegant, deep rust red

const IMPACT_PALETTE = [
  COLOR_NEG_10, // -1.0 (Rust Red)
  COLOR_NEG_06, // -0.8
  COLOR_NEG_04, // -0.6
  COLOR_NEG_02, // -0.4
  COLOR_NEUTRAL, // -0.2 to 0.1 (The "Soft Yellow" Midpoint)
  COLOR_POS_02, // 0.2
  COLOR_POS_04, // 0.4
  COLOR_POS_06, // 0.6
  COLOR_POS_08, // 0.8
  COLOR_POS_10  // 1.0 (Ocean Green)
]
const VISIBLE_ITEMS = 5;
const SCORE_HEADER_HEIGHT = 20;

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
  z-index: 2;
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

/* One stacking context: gradient → frosted glass → text. iOS Safari / Simulator often drops
   text that sits *under* a backdrop-filter layer even when the gradient still shows through. */
const HeatScrollInner = styled.div`
  position: relative;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeatGradientBg = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background-color: #000;
  background-image: ${({ gradient }) =>
    gradient && gradient !== 'transparent' ? gradient : 'none'};
  pointer-events: none;
`;

const RowsLayer = styled.div`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Row = styled.div`
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 10px is below iOS Safari’s comfortable minimum; 11px + text-size-adjust avoids missing/invisible labels */
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 3;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
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
    const denom = Math.max(gameImpacts.length, 1);

    const data = _.compact(_.map(gameImpacts, (item, index) => {
      if (_.isNil(item) || _.isNil(item.gameScoreLabel)) {
        return null;
      }
      const val = item.impactValue >= 0 
        ? (maxPos !== 0 ? item.impactValue / maxPos : 0)
        : (maxNeg !== 0 ? item.impactValue / Math.abs(maxNeg) : 0);
    
      /** * 2. Pick Color from Palette
       * We map -1 to 1 into an index range of 0 to 9.
       * Formula: ((val + 1) / 2) * (Palette Length - 1)
       */
      const colorIndex = Math.round(((val + 1) / 2) * (IMPACT_PALETTE.length - 1));
      const color = IMPACT_PALETTE[colorIndex];
    
      const stopPosition = ((index + 0.5) / denom) * 100;
      return { ...item, color, val, stopPosition };
    }));

    const compactData = _.compact(data);
    const stops = compactData.map((item) => `${item.color} ${item.stopPosition}%`);
    const gradient = stops.length
        ? `linear-gradient(to bottom, ${stops.join(', ')})`
        : 'transparent';

    return { normalizedData: compactData, gradientString: gradient };
  }, [gameImpacts]);

  // 2. Position the Golden Pointer
  const updatePointerTop = useCallback(() => {
    if (!activeRowRef.current || !hudRef.current) return;
    const rowRect = activeRowRef.current.getBoundingClientRect();
    const hudRect = hudRef.current.getBoundingClientRect();
    const relativeTop = rowRect.top - hudRect.top + rowRect.height / 2;
    setPointerTopPx(relativeTop + SCORE_HEADER_HEIGHT);
  }, []);

  // 3. Sync Scroll Position
  useLayoutEffect(() => {
    if (currentIndex >= 0 && scrollRef.current && activeRowRef.current) {
      const rowHeight = 22;
      const centerOffset = (VISIBLE_ITEMS * rowHeight) / 2 - rowHeight / 2;
      scrollRef.current.scrollTop = currentIndex * rowHeight - centerOffset + SCORE_HEADER_HEIGHT;
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
            <HeatScrollInner>
              <HeatGradientBg gradient={gradientString} aria-hidden />
              <VanillaGlassOverlay />
              <RowsLayer>
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
              </RowsLayer>
            </HeatScrollInner>
          </ScrollableContent>
        </HUDContainer>
      </div>
      {showScoreMarker && pointerTopPx != null ? (
        <CurrentScorePointer aria-hidden style={{ top: pointerTopPx }} />
      ) : null}
    </>
  );
};

export default LeftVerticalBar;