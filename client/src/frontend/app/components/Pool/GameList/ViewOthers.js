import React, { Fragment, useMemo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { getParticipatesWithRank, formatPreviousLegUi } from '../../../utils';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Modal } from 'semantic-ui-react';
import { buildNextGoalViewOthersRows } from './viewOthersNextGoalPreview';
import { buildWeekdayPathViewRows } from './viewOthersWeekdayPathPreview';
import UserAvatar from '../../UserAvatar';
import GameOddsDisplay from './GameOddsDisplay';
import GroupStandingsTable from './GroupStandingsTable';
import { getGroupStandingsBothSides } from '../../../utils/groupStandings';

function ScoreLineCell({ homeTeam, awayTeam, scoreText, scoreClassName, odds1, oddsX, odds2, showOdds }) {
    const hasOdds = showOdds && (odds1 != null || oddsX != null || odds2 != null);
    return (
        <div className="view-others-score-split__line">
            {hasOdds ? (
                <GameOddsDisplay odds1={odds1} oddsX={oddsX} odds2={odds2} size="xs" />
            ) : null}
            <div className="view-others-score-split__line-score">
                <div className="view-others-score-split__mini-flag">
                    <img src={homeTeam.flag} alt="" />
                </div>
                <div className={classNames('view-others-score-split__stack-score', scoreClassName)}>{scoreText}</div>
                <div className="view-others-score-split__mini-flag">
                    <img src={awayTeam.flag} alt="" />
                </div>
            </div>
        </div>
    );
}

function ScoreSplitBody({ hypoAccentClass, kickerText, pairs, showCellOdds }) {
    return (
        <div className="view-others-score-split">
            {kickerText ? (
                <div className="view-others-score-split__strip-kicker">{kickerText}</div>
            ) : null}
            <div className="view-others-score-split__inner">
                <div
                    className="view-others-score-split__col-bg view-others-score-split__col-bg--current"
                    aria-hidden
                />
                <div
                    className={classNames(
                        'view-others-score-split__col-bg',
                        'view-others-score-split__col-bg--hypo',
                        hypoAccentClass
                    )}
                    aria-hidden
                />
                <div className="view-others-score-split__matrix">
                    {_.map(pairs, ({ key, homeTeam, awayTeam, currentText, hypoText, hypoScoreClass, odds1, oddsX, odds2 }) => (
                        <Fragment key={key}>
                            <div className="view-others-score-split__matrix-cell view-others-score-split__matrix-cell--current">
                                <ScoreLineCell
                                    homeTeam={homeTeam}
                                    awayTeam={awayTeam}
                                    scoreText={currentText}
                                    scoreClassName="view-others-score-split__stack-score--on-current-panel"
                                    showOdds={showCellOdds}
                                    odds1={odds1}
                                    oddsX={oddsX}
                                    odds2={odds2}
                                />
                            </div>
                            <div className="view-others-score-split__matrix-cell view-others-score-split__matrix-cell--hypo">
                                <ScoreLineCell
                                    homeTeam={homeTeam}
                                    awayTeam={awayTeam}
                                    scoreText={hypoText}
                                    scoreClassName={hypoScoreClass}
                                    showOdds={showCellOdds}
                                    odds1={odds1}
                                    oddsX={oddsX}
                                    odds2={odds2}
                                />
                            </div>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

function NextGoalSplitPanelHeader({ challenge, splitScores, side, hypoTone }) {
    const {
        id,
        game: { homeTeam, awayTeam, previousLeg },
        playAt,
        odds1,
        oddsX,
        odds2,
    } = challenge;
    const prevLegUi = formatPreviousLegUi(previousLeg);
    const { currentH, currentA, proposedH, proposedA } = splitScores;
    const scoringLabel =
        side === 'home'
            ? homeTeam.shortName || homeTeam.name || 'Home'
            : awayTeam.shortName || awayTeam.name || 'Away';
    const tone =
        hypoTone || (side === 'away' ? 'worst' : 'best');
    const hypoAccentClass =
        tone === 'neutral'
            ? 'view-others-score-split__col-bg--hypo-neutral'
            : tone === 'worst'
            ? 'view-others-score-split__col-bg--hypo-worst'
            : 'view-others-score-split__col-bg--hypo-best';
    const hypoScoreClass =
        tone === 'neutral'
            ? 'view-others-score-split__stack-score--on-hypo-neutral'
            : tone === 'worst'
            ? 'view-others-score-split__stack-score--on-hypo-worst'
            : 'view-others-score-split__stack-score--on-hypo-best';

    return (
        <Modal.Header>
            <li className="challenge-row challenge-row--score-split challenge-row--score-split-panels" key={id}>
                <div className="game-title game-title--score-split">
                    <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                    <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                    {prevLegUi ? (
                        <div className="game-previous-leg game-previous-leg--in-split-header" title={prevLegUi.title}>
                            {prevLegUi.text}
                        </div>
                    ) : null}
                    <div className="game-title__odds-row">
                        <GameOddsDisplay
                            odds1={odds1}
                            oddsX={oddsX}
                            odds2={odds2}
                            size="sm"
                            className="game-odds--title-bar"
                        />
                    </div>
                </div>
                <ScoreSplitBody
                    kickerText={`If ${scoringLabel} scores next…`}
                    hypoAccentClass={hypoAccentClass}
                    showCellOdds={false}
                    pairs={[
                        {
                            key: 'next-goal',
                            homeTeam,
                            awayTeam,
                            currentText: `${currentH} : ${currentA}`,
                            hypoText: `${proposedH} : ${proposedA}`,
                            hypoScoreClass,
                        },
                    ]}
                />
            </li>
        </Modal.Header>
    );
}

function WeekdayPathSplitPanelHeader({ variant, dateLabel, segments }) {
    const scenarioLabel = variant === 'worst' ? 'Worst case path' : 'Best case path';
    const hypoAccentClass =
        variant === 'worst'
            ? 'view-others-score-split__col-bg--hypo-worst'
            : 'view-others-score-split__col-bg--hypo-best';
    const hypoScoreClass =
        variant === 'worst'
            ? 'view-others-score-split__stack-score--on-hypo-worst'
            : 'view-others-score-split__stack-score--on-hypo-best';

    const pairs = _.map(segments, ({ bet, proposedH, proposedA, currentH, currentA }) => {
        const challenge = bet.challenge || {};
        const game = challenge.game || {};
        return {
            key: bet.challengeId,
            homeTeam: game.homeTeam || {},
            awayTeam: game.awayTeam || {},
            currentText: `${currentH} : ${currentA}`,
            hypoText: `${proposedH} : ${proposedA}`,
            hypoScoreClass,
            odds1: challenge.odds1,
            oddsX: challenge.oddsX,
            odds2: challenge.odds2,
        };
    });

    return (
        <Modal.Header>
            <li
                className={classNames(
                    'challenge-row',
                    'challenge-row--score-split',
                    'challenge-row--score-split-panels',
                    'challenge-row--weekday-lines',
                    variant === 'worst' && 'challenge-row--weekday-lines--worst'
                )}
            >
                <div className="game-title game-title--score-split">
                    <div className="game-day">{dateLabel}</div>
                    <div className="game-hour game-hour--scenario">{scenarioLabel}</div>
                </div>
                <ScoreSplitBody hypoAccentClass={hypoAccentClass} pairs={pairs} showCellOdds />
            </li>
        </Modal.Header>
    );
}

const ViewOthers = ({ poolId, clickOnBetChange, nextGoalPreview, weekdayPathPreview }) => {
    const standings = useSelector((state) => _.get(state.pools.standingsByPoolId, String(poolId), []));
    const MatchResult = ({ challenge }) => {
        const { score1, score2, isOpen, odds1, odds2, oddsX } = challenge;
        if (isOpen) {
            return <GameOddsDisplay odds1={odds1} oddsX={oddsX} odds2={odds2} size="sm" />;
        }
        return (
            <div className="game-result game-result--stacked">
                <GameOddsDisplay odds1={odds1} oddsX={oddsX} odds2={odds2} size="xs" />
                <div className="game-result-score">
                    {score1} : {score2}
                </div>
            </div>
        );
    };
    const TeamScore = ({ team: { flag, name }, reverse }) => {
        const className = classNames('team-score', { 'team-reverse': reverse });
        return (
            <div className={className}>
                <div className="team-details">
                    <div className="team-flag">
                        <img className="team-image" src={flag} alt={name} title={name} />
                    </div>
                    <span className="team-name">{name}</span>
                </div>
            </div>
        );
    };
    const ChallengeDetails = ({ challenge }) => {
        const {
            id,
            isOpen,
            game: { homeTeam, awayTeam, previousLeg },
            playAt,
        } = challenge;
        const prevLegUi = formatPreviousLegUi(previousLeg);
        const { homeRows, awayRows, sameGroup } = isOpen
            ? getGroupStandingsBothSides(standings, homeTeam.id, awayTeam.id)
            : { homeRows: [], awayRows: [], sameGroup: true };
        return (
            <Modal.Header>
                <li className="challenge-row" key={id}>
                    <div className="game-title">
                        <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                        <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                        {prevLegUi ? (
                            <div className="game-previous-leg game-previous-leg--in-split-header" title={prevLegUi.title}>
                                {prevLegUi.text}
                            </div>
                        ) : null}
                    </div>
                    <div className="game-body">
                        <TeamScore team={homeTeam} />
                        <MatchResult challenge={challenge} />
                        <TeamScore team={awayTeam} reverse={true} />
                    </div>
                    {isOpen && sameGroup ? (
                        <GroupStandingsTable
                            rows={homeRows}
                            highlightTeamIds={[homeTeam.id, awayTeam.id]}
                        />
                    ) : null}
                    {isOpen && !sameGroup ? (
                        <div className="group-standings-dual">
                            <GroupStandingsTable
                                rows={homeRows}
                                highlightTeamIds={[homeTeam.id]}
                            />
                            <GroupStandingsTable
                                rows={awayRows}
                                highlightTeamIds={[awayTeam.id]}
                            />
                        </div>
                    ) : null}
                </li>
            </Modal.Header>
        );
    };

    const Medal = ({ score, medal }) => {
        const className = classNames('icon star large fitted', {
            outline: medal === 0,
            'bronze-medal': medal === 1,
            'sliver-medal': medal === 2,
            'gold-medal': medal === 3,
        });

        return (
            <div className="bet-score">
                <i className={className}></i>
                <div className="medal-badge">{score}</div>
            </div>
        );
    };

    const WeekdayPathMedalStrip = ({ medals }) => {
        const nodes = _.map(_.forOwnRight(medals || {}), (count, idx) => {
            const medalClass = classNames('icon star large fitted', {
                'bronze-medal': idx === '1',
                'sliver-medal': idx === '2',
                'gold-medal': idx === '3',
            });
            return (
                <div key={idx} className="user-bet-weekday-medal">
                    <i className={medalClass} />
                    <div className="medal-badge">{count}</div>
                </div>
            );
        });
        return <div className="user-bet-weekday-medals">{nodes}</div>;
    };

    const UserBet = ({
        participate,
        bet,
        isOpen,
        showPtsDelta,
        viewerUserId,
        viewerPicks,
        multiGameDay,
        weekdayPathLayout,
    }) => {
        const showViewerPickStrip =
            multiGameDay &&
            viewerUserId != null &&
            String(participate.userId) === String(viewerUserId) &&
            _.size(viewerPicks) > 0;
        const pickStrip = showViewerPickStrip
            ? _.map(viewerPicks, (vp) => {
                  const s1 = vp.score1 != null && vp.score1 !== '' ? vp.score1 : '–';
                  const s2 = vp.score2 != null && vp.score2 !== '' ? vp.score2 : '–';
                  return `${s1} : ${s2}`;
              }).join(' · ')
            : null;

        if (weekdayPathLayout) {
            return (
                <li className="user-bet-row user-bet-row--weekday-path">
                    <div className="user-bet-side">
                        <UserAvatar
                            className="user-bet-image"
                            user={participate}
                            alt={participate.username}
                            title={participate.username}
                        />
                    </div>
                    <div className="user-bet-center">
                        <div className="user-bet-name">
                            {participate.firstName} {participate.lastName}
                        </div>
                        <div className="user-bet-rank">
                            Rank: {participate.rank}
                            {showPtsDelta && participate.ptsDelta != null && participate.ptsDelta !== 0 ? (
                                <span
                                    className={
                                        participate.ptsDelta > 0
                                            ? 'view-others-shell__pts-delta view-others-shell__pts-delta--up'
                                            : 'view-others-shell__pts-delta view-others-shell__pts-delta--down'
                                    }
                                >
                                    {participate.ptsDelta > 0 ? '+' : ''}
                                    {participate.ptsDelta}
                                </span>
                            ) : null}
                            {showPtsDelta && participate.rankDelta != null && participate.rankDelta !== 0 ? (
                                <span
                                    className={
                                        participate.rankDelta > 0
                                            ? 'view-others-shell__rank-delta view-others-shell__rank-delta--up'
                                            : 'view-others-shell__rank-delta view-others-shell__rank-delta--down'
                                    }
                                >
                                    {participate.rankDelta > 0
                                        ? ` ↑${participate.rankDelta}`
                                        : ` ↓${Math.abs(participate.rankDelta)}`}
                                </span>
                            ) : null}
                        </div>
                        {pickStrip ? <div className="user-bet-viewer-picks">{pickStrip}</div> : null}
                    </div>
                    <div className="user-bet-weekday-summary">
                        <WeekdayPathMedalStrip medals={bet.medals} />
                        <div className="user-bet-weekday-score-box">
                            <span>{participate.score}</span>
                        </div>
                    </div>
                </li>
            );
        }

        return (
            <li className="user-bet-row">
                <div className="user-bet-side">
                    <UserAvatar
                        className="user-bet-image"
                        user={participate}
                        alt={participate.username}
                        title={participate.username}
                    />
                </div>
                <div className="user-bet-center">
                    <div className="user-bet-name">
                        {participate.firstName} {participate.lastName}
                    </div>
                    <div className="user-bet-rank">
                        Rank: {participate.rank}{' '}
                        <span className="view-others-shell__pts-muted">({participate.score}pts).</span>
                        {showPtsDelta && participate.ptsDelta != null && participate.ptsDelta !== 0 ? (
                            <span
                                className={
                                    participate.ptsDelta > 0
                                        ? 'view-others-shell__pts-delta view-others-shell__pts-delta--up'
                                        : 'view-others-shell__pts-delta view-others-shell__pts-delta--down'
                                }
                            >
                                {participate.ptsDelta > 0 ? '+' : ''}
                                {participate.ptsDelta}
                            </span>
                        ) : null}
                        {showPtsDelta && participate.rankDelta != null && participate.rankDelta !== 0 ? (
                            <span
                                className={
                                    participate.rankDelta > 0
                                        ? 'view-others-shell__rank-delta view-others-shell__rank-delta--up'
                                        : 'view-others-shell__rank-delta view-others-shell__rank-delta--down'
                                }
                            >
                                {participate.rankDelta > 0
                                    ? ` ↑${participate.rankDelta}`
                                    : ` ↓${Math.abs(participate.rankDelta)}`}
                            </span>
                        ) : null}
                    </div>
                    {pickStrip ? <div className="user-bet-viewer-picks">{pickStrip}</div> : null}
                </div>
                <div className="user-bet-medal">{!isOpen ? <Medal score={bet.score} medal={bet.medal} /> : ''}</div>
                <div className="user-bet-score">
                    {bet.score1 == null && bet.score2 == null ? (
                        <div className="user-bet-unset">unset</div>
                    ) : (
                        <>
                            <div>
                                <span>
                                    {bet.score1} : {bet.score2}
                                </span>
                            </div>
                            {isOpen ? (
                                <div className="users-bets-use-it">
                                    <a
                                        onClick={() => {
                                            clickOnBetChange(bet.challengeId, bet.score1, bet.score2);
                                        }}
                                    >
                                        Use it!
                                    </a>
                                </div>
                            ) : (
                                ''
                            )}
                        </>
                    )}
                </div>
            </li>
        );
    };

    const BetsList = ({
        usersBets,
        participates,
        isOpen,
        showPtsDelta,
        viewerUserId,
        viewerPicks,
        multiGameDay,
        weekdayPathLayout,
    }) => {
        const userBetsNode = _.map(_.orderBy(participates, 'rank'), (participate) => {
            return (
                <UserBet
                    participate={participate}
                    key={participate.userId}
                    isOpen={isOpen}
                    showPtsDelta={showPtsDelta}
                    viewerUserId={viewerUserId}
                    viewerPicks={viewerPicks}
                    multiGameDay={multiGameDay}
                    weekdayPathLayout={weekdayPathLayout}
                    bet={
                        _.find(usersBets, (u) => String(u.userId) === String(participate.userId)) || {}
                    }
                />
            );
        });
        return (
            <Modal.Content image scrolling style={{ maxHeight: '60vh', marginTop: '25px' }}>
                <ul className="users-bets-list">{userBetsNode}</ul>
            </Modal.Content>
        );
    };

    const participates = useSelector((state) => state.pools.participates);
    const otherBets = useSelector((state) => state.pools.otherBets);
    const { challenge, usersBets } = otherBets;

    const previewBuilt = useMemo(() => {
        if (!nextGoalPreview) return null;
        return buildNextGoalViewOthersRows(participates, nextGoalPreview);
    }, [nextGoalPreview, participates]);

    const weekdayBuilt = useMemo(() => {
        if (!weekdayPathPreview) return null;
        return buildWeekdayPathViewRows(participates, weekdayPathPreview);
    }, [weekdayPathPreview, participates]);

    if (previewBuilt) {
        const {
            splitScores,
            usersBets: previewBets,
            participatesWithRank: previewRanked,
            hypoTone,
        } = previewBuilt;
        const side = nextGoalPreview.side === 'away' ? 'away' : 'home';
        return (
            <div id="content" className="view-others-shell" style={{ margin: '35px 8px 8px 8px' }}>
                <section>
                    <NextGoalSplitPanelHeader
                        challenge={nextGoalPreview.challenge}
                        splitScores={splitScores}
                        side={side}
                        hypoTone={hypoTone}
                    />
                    <BetsList
                        usersBets={previewBets}
                        participates={previewRanked}
                        isOpen={false}
                        showPtsDelta
                    />
                </section>
            </div>
        );
    }

    if (weekdayBuilt) {
        const {
            segments,
            usersBets: wBets,
            participatesWithRank: wRanked,
            variant,
            showPtsDelta,
            viewerUserId: wViewerUserId,
            viewerPicks: wViewerPicks,
            multiGameDay: wMultiGameDay,
        } = weekdayBuilt;
        return (
            <div id="content" className="view-others-shell" style={{ margin: '35px 8px 8px 8px' }}>
                <section>
                    <WeekdayPathSplitPanelHeader variant={variant} dateLabel={weekdayPathPreview.dateLabel} segments={segments} />
                    <BetsList
                        usersBets={wBets}
                        participates={wRanked}
                        isOpen={false}
                        showPtsDelta={showPtsDelta}
                        viewerUserId={wViewerUserId}
                        viewerPicks={wViewerPicks}
                        multiGameDay={wMultiGameDay}
                        weekdayPathLayout
                    />
                </section>
            </div>
        );
    }

    const othersParticipatesRanked = getParticipatesWithRank(participates);
    return (
        <div id="content" className="view-others-shell" style={{ margin: '35px 8px 8px 8px' }}>
            {challenge ? (
                <section>
                    <ChallengeDetails challenge={challenge} />
                    <BetsList
                        usersBets={usersBets}
                        participates={othersParticipatesRanked}
                        isOpen={challenge.isOpen}
                        showPtsDelta={false}
                    />
                </section>
            ) : (
                ''
            )}
        </div>
    );
};

export default ViewOthers;
