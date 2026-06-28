import React from 'react';
import classNames from 'classnames';
import { winner2OddsBase } from "../../../utils/betScoring";

function formatOdds(value, showAsBonus = false) {
    if (value == null || value === '') {
        return '–';
    }
    return value === 0 ? 0 :  showAsBonus ? `+${value}` : value;
}

/**
 * @param {'xs'|'sm'|'md'} size — xs/sm always smaller than score line
 */
const LABELS = {
    md: ['H', 'D', 'A'],
    sm: ['H', 'D', 'A'],
    xs: ['H', 'D', 'A'],
};

const GameOddsDisplay = ({ odds1, oddsX, odds2, className, size = 'md' , showAsBonus = false}) => {
    const [homeL, drawL, awayL] = LABELS[size] || LABELS.md;
    const hasOdds = (odds1 != null || oddsX != null || odds2 != null) && (Number(odds1) > 0 && Number(oddsX) > 0 && Number(odds2) > 0);
    if (!hasOdds) {
        return null;
    }
    const odds1Label = showAsBonus ? formatOdds(winner2OddsBase(odds1),true) : formatOdds(odds1);
    const oddsXLabel = showAsBonus ? formatOdds(winner2OddsBase(oddsX),true) : formatOdds(oddsX);
    const odds2Label = showAsBonus ? formatOdds(winner2OddsBase(odds2),true) : formatOdds(odds2);
    return (
        <div className={classNames('game-odds', `game-odds--${size}`, className)}>
            <div className="odds-title-row">
                <div>{homeL}</div>
                <div>{drawL}</div>
                <div>{awayL}</div>
            </div>
            <div className="odds-title-values">
                <div>{ odds1Label }</div>
                <div>{ oddsXLabel }</div>
                <div>{ odds2Label }</div>
            </div>
        </div>
    );
};

export default GameOddsDisplay;
