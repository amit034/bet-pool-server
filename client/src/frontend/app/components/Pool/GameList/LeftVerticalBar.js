import React, { useMemo, useRef, useLayoutEffect, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

const RED = 'rgb(215, 48, 39)';
const YELLOW = 'rgb(255, 218, 0)';
const LIGHT_GREEN = 'rgb(145, 207, 96)';
const GREEN = 'rgb(51, 160, 44)';

const VISIBLE_ITEMS = 5;

/** Triangle pointing left; sits past the sidebar edge (right: -7px) so it floats into the match area. */
const CurrentScorePointer = styled.div`
  position: absolute;
  right: -7px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  opacity: 0.8;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 6px solid #eab704;
  filter: drop-shadow(0 0 3px rgba(234, 183, 4, 0.85));
  z-index: 4;
  pointer-events: none;
`;

const HUDContainer = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  background: #111111;
  position: relative;
  overflow: hidden;
  border-radius: 0;
`;

const ScrollableContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeatStripWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${(props) => props.gradient};
`;

const Row = styled.div`
  height: ${100 / VISIBLE_ITEMS}%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
  font-size: 9px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
`;

const LeftVerticalBar = ({ gameImpacts, currentScoreLabel, gameSideRef }) => {
  const scrollRef = useRef(null);
  const hudRef = useRef(null);
  const activeRowRef = useRef(null);
  const [pointerTopPx, setPointerTopPx] = useState(null);

  const { normalizedData, gradientString } = useMemo(() => {
    if (!gameImpacts || gameImpacts.length === 0) {
      return { normalizedData: [], gradientString: 'transparent' };
    }

    const maxGreenImpact = _.maxBy(gameImpacts, ({ impactValue }) => impactValue);
    const maxRedImpact = _.maxBy(gameImpacts, ({ impactValue }) => -impactValue);
    const denom = Math.max(gameImpacts.length - 1, 1);

    const data = gameImpacts.map((item, index) => {
      const val =
        item.impactValue > 0
          ? item.impactValue / (maxGreenImpact?.impactValue || 1)
          : item.impactValue / Math.abs(maxRedImpact?.impactValue || 1);

      let color = YELLOW;
      if (val <= -0.75) color = RED;
      else if (val < 0) color = YELLOW;
      else if (val < 0.75) color = LIGHT_GREEN;
      else color = GREEN;

      const stopPosition = (index / denom) * 100;

      return { ...item, color, stopPosition };
    });

    const stops = data.map((item) => `${item.color} ${item.stopPosition}%`);
    const gradient = `linear-gradient(to bottom, ${stops.join(', ')})`;

    return { normalizedData: data, gradientString: gradient };
  }, [gameImpacts]);

  const currentIndex =
    normalizedData.length > 0
      ? normalizedData.findIndex((item) => item.gameScoreLabel === currentScoreLabel)
      : -1;
  const showScoreMarker = currentIndex >= 0;

  const updatePointerTop = useCallback(() => {
    const side = gameSideRef?.current;
    const row = activeRowRef.current;
    if (!side || !row || currentIndex < 0) {
      setPointerTopPx(null);
      return;
    }
    const sideRect = side.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const centerY = rowRect.top + rowRect.height / 2 - sideRect.top;
    setPointerTopPx(centerY);
  }, [currentIndex, gameSideRef]);

  /** Do not use scrollIntoView — it scrolls ancestor scrollers (Swiper / window) and breaks layout. */
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    const row = activeRowRef.current;
    if (!sc || !row || currentIndex < 0) return;

    const rowTop = row.offsetTop;
    const rowH = row.offsetHeight;
    const ch = sc.clientHeight;
    const ideal = rowTop + rowH / 2 - ch / 2;
    const maxScroll = Math.max(0, sc.scrollHeight - ch);
    sc.scrollTop = Math.min(Math.max(0, ideal), maxScroll);

    updatePointerTop();
  }, [currentIndex, currentScoreLabel, normalizedData, updatePointerTop]);

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    const onScrollOrResize = () => updatePointerTop();
    sc.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onScrollOrResize);
      if (hudRef.current) ro.observe(hudRef.current);
      if (gameSideRef?.current) ro.observe(gameSideRef.current);
    }

    return () => {
      sc.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (ro) ro.disconnect();
    };
  }, [updatePointerTop, normalizedData.length, showScoreMarker, gameSideRef]);

  return (
    <>
      <div className="game-side-heat">
        <HUDContainer ref={hudRef}>
          <ScrollableContent ref={scrollRef}>
            <HeatStripWrapper gradient={gradientString}>
              {normalizedData.map((item, index) => (
                <Row
                  key={index}
                  ref={index === currentIndex ? activeRowRef : undefined}
                >
                  {item.gameScoreLabel}
                </Row>
              ))}
            </HeatStripWrapper>
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
