import React, { useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

const RED = 'rgb(215, 48, 39)';
const YELLOW = 'rgb(255, 218, 0)';
const LIGHT_GREEN = 'rgb(145, 207, 96)';
const GREEN = 'rgb(51, 160, 44)';

const VISIBLE_ITEMS = 5;

const HUDContainer = styled.div`
  height: 100%;
  width: 100%;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
  border-radius: 2px;
`;

const ScrollableContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
  scrollbar-width: none; 
  &::-webkit-scrollbar { display: none; }
`;

const HeatStripWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* Apply the smooth gradient across the entire scrollable height */
  background: ${props => props.gradient};
`;

const Row = styled.div`
  height: ${100 / VISIBLE_ITEMS}%; 
  flex-shrink: 0; 
  display: flex;
  align-items: center;
  padding-left: 4px;
  color: white;
  font-size: 10px;
  /* Remove individual bgColor to let the parent gradient show through */
  border-bottom: 1px solid rgba(255,255,255,0.05);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
`;

const LeftVerticalBar = ({ gameImpacts, currentScoreLabel }) => {
  const scrollRef = useRef(null);

  const { normalizedData, gradientString } = useMemo(() => {
    if (!gameImpacts || gameImpacts.length === 0) {
      return { normalizedData: [], gradientString: 'transparent' };
    }

    const maxGreenImpact = _.maxBy(gameImpacts, ({ impactValue }) => impactValue);
    const maxRedImpact = _.maxBy(gameImpacts, ({ impactValue }) => -impactValue);

    const data = gameImpacts.map((item, index) => {
      const val = item.impactValue > 0
          ? item.impactValue / (maxGreenImpact?.impactValue || 1)
          : item.impactValue / Math.abs(maxRedImpact?.impactValue || 1);

      let color = YELLOW;
      if (val <= -0.75) color = RED;
      else if (val < 0) color = YELLOW;
      else if (val < 0.75) color = LIGHT_GREEN;
      else color = GREEN;

      // Calculate percentage stop for the gradient
      const stopPosition = (index / (gameImpacts.length - 1)) * 100;

      return { ...item, color, stopPosition };
    });

    // Create a smooth gradient string
    const stops = data.map(item => `${item.color} ${item.stopPosition}%`);
    const gradient = `linear-gradient(to bottom, ${stops.join(', ')})`;

    return { normalizedData: data, gradientString: gradient };
  }, [gameImpacts]);

  useEffect(() => {
    if (!scrollRef.current || !normalizedData.length) return;

    const index = normalizedData.findIndex(
      item => item.gameScoreLabel === currentScoreLabel
    );

    if (index === -1) return;

    const container = scrollRef.current;
    // itemHeight is 1/5th of the visible viewport
    const itemHeight = container.offsetHeight / VISIBLE_ITEMS;

    // Center the active item in the 3rd slot of the 5 visible slots
    const targetScroll = (index * itemHeight) - (itemHeight * 2);

    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }, [normalizedData, currentScoreLabel]);

  return (
    <HUDContainer>
      <ScrollableContent ref={scrollRef}>
        <HeatStripWrapper gradient={gradientString}>
          {normalizedData.map((item, index) => (
            <Row key={index}>
              {item.gameScoreLabel}
            </Row>
          ))}
        </HeatStripWrapper>
      </ScrollableContent>
    </HUDContainer>
  );
};

export default LeftVerticalBar;