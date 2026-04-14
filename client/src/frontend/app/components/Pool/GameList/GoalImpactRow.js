import React, { useCallback } from 'react';
import { Icon } from 'semantic-ui-react';
import classNames from 'classnames';

const formatScoreLabel = (label) => {
    if (!label) return '';
    return String(label).replace('-', ':');
};

const ImpactItem = ({ side, impact, onOpenScenario }) => {
    const hasStandings = Boolean(impact && Array.isArray(impact.finalState) && impact.finalState.length > 0);
    const clickable = hasStandings && typeof onOpenScenario === 'function';

    const isUp = Boolean(impact && impact.rankDiff > 0);
    const isDown = Boolean(impact && impact.rankDiff < 0);
    const impactModifier = !impact ? 'neutral' : isUp ? 'up' : isDown ? 'down' : 'neutral';

    const open = useCallback(() => {
        if (clickable && impact) onOpenScenario({ side, impact, impactModifier });
    }, [clickable, impact, impactModifier, onOpenScenario, side]);

    const onKeyDown = useCallback(
        (e) => {
            if (!clickable) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        },
        [clickable, open]
    );

    if (!impact) {
        return <div className="game-impact-footer__half-inner game-impact-footer__half-inner--neutral" />;
    }

    const pts = impact.scoreDiff;
    const ptsText = pts > 0 || impact.rankDiff !== 0 ? `(${pts} pts)` : pts < 0 || impact.rankDiff < 0 ? `(${pts} pts)` : '-';
    const rankText = impact.rankDiff !== 0 ? Math.abs(impact.rankDiff) : '-';

    return (
        <div
            className={classNames(
                `game-impact-footer__half-inner game-impact-footer__half-inner--${impactModifier}`,
                clickable && 'game-impact-footer__half-inner--clickable'
            )}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? open : undefined}
            onKeyDown={clickable ? onKeyDown : undefined}
        >
            <span className="game-impact-footer__cluster">
                {isUp && <Icon name="caret up" className="game-impact-footer__arrow" fitted />}
                {isDown && <Icon name="caret down" className="game-impact-footer__arrow" fitted />}
                {!isUp && !isDown && <span className="game-impact-footer__arrow game-impact-footer__arrow--placeholder" />}
                <span className="game-impact-footer__rank">{rankText}</span>
                <span className="game-impact-footer__points">{ptsText}</span>
            </span>
            <span className="game-impact-footer__pred-score">{formatScoreLabel(impact.gameScoreLabel)}</span>
        </div>
    );
};

const GoalImpactRow = ({ homeImpact, awayImpact, onOpenScenario }) => {
    return (
        <div className="game-impact-footer">
            <div className="game-impact-footer__half game-impact-footer__half--home">
                <ImpactItem side="home" impact={homeImpact} onOpenScenario={onOpenScenario} />
            </div>
            <div className="game-impact-footer__half game-impact-footer__half--away">
                <ImpactItem side="away" impact={awayImpact} onOpenScenario={onOpenScenario} />
            </div>
        </div>
    );
};

export default GoalImpactRow;
