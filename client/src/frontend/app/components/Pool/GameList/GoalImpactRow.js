import React from 'react';
import { Icon } from 'semantic-ui-react';

const formatScoreLabel = (label) => {
    if (!label) return '';
    return String(label).replace('-', ':');
};

const ImpactItem = ({ impact }) => {
    if (!impact) {
        return <div className="game-impact-footer__half-inner" />;
    }

    const isUp = impact.rankDiff > 0;
    const isDown = impact.rankDiff < 0;
    const impactModifier = isUp ? 'up' : isDown ? 'down' : 'neutral';

    const pts = impact.scoreDiff;
    const ptsText = pts > 0 || impact.rankDiff !== 0 ? `(${pts} pts)` : pts < 0 || impact.rankDiff < 0 ? `(${pts} pts)` : '-';
    const rankText = impact.rankDiff !== 0 ? Math.abs(impact.rankDiff) : '-';

    return (
        <div className={`game-impact-footer__half-inner game-impact-footer__half-inner--${impactModifier}`}>
            <span className="game-impact-footer__cluster">
                {isUp && (
                    <Icon name="caret up 
                    " className="game-impact-footer__arrow" fitted />
                )}
                {isDown && (
                    <Icon name="caret down" className="game-impact-footer__arrow" fitted />
                )}
                {!isUp && !isDown && (
                    <span className="game-impact-footer__arrow game-impact-footer__arrow--placeholder" />
                )}
                <span className="game-impact-footer__rank">{rankText}</span>
                <span className="game-impact-footer__points">{ptsText}</span>
            </span>
            <span className="game-impact-footer__pred-score">
                {formatScoreLabel(impact.gameScoreLabel)}
            </span>
        </div>
    );
};

const GoalImpactRow = ({ homeImpact, awayImpact }) => {
    return (
        <div className="game-impact-footer">
            <div className="game-impact-footer__half game-impact-footer__half--home">
                <ImpactItem impact={homeImpact} />
            </div>
            <div className="game-impact-footer__half game-impact-footer__half--away">
                <ImpactItem impact={awayImpact} />
            </div>
        </div>
    );
};

export default GoalImpactRow;
