import React from 'react';
import classNames from 'classnames';

function formatOdds(value) {
    if (value == null || value === '') {
        return '–';
    }
    return value;
}

/**
 * @param {'xs'|'sm'|'md'} size — xs/sm always smaller than score line
 */
const LABELS = {
    md: ['H', 'D', 'A'],
    sm: ['H', 'D', 'A'],
    xs: ['H', 'D', 'A'],
};

const GameOddsDisplay = ({ odds1, oddsX, odds2, className, size = 'md' }) => {
    const [homeL, drawL, awayL] = LABELS[size] || LABELS.md;
    const hasOdds = (odds1 != null || oddsX != null || odds2 != null) && (Number(odds1) > 0 && Number(oddsX) > 0 && Number(odds2) > 0);
    if (!hasOdds) {
        return null;
    }
    return (
        <div className={classNames('game-odds', `game-odds--${size}`, className)}>
            <div className="odds-title-row">
                <div>{homeL}</div>
                <div>{drawL}</div>
                <div>{awayL}</div>
            </div>
            <div className="odds-title-values">
                <div>{formatOdds(odds1)}</div>
                <div>{formatOdds(oddsX)}</div>
                <div>{formatOdds(odds2)}</div>
            </div>
        </div>
    );
};

export default GameOddsDisplay;
