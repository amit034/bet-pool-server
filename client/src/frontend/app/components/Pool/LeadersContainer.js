import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router-dom';
import classNames from 'classnames';
import _ from 'lodash';
import {getParticipatesWithRank} from '../../utils';
import {getUserFromLocalStorage} from '../../actions/auth';
import {getPoolGoals} from '../../actions/pools';
import LeaderboardReplay, {SPEED_MS} from './LeaderboardReplay';
import RoundGamesPanel from './RoundGamesPanel';
import {buildChallengeMetaFromBets, buildReplaySnapshots} from '../../utils/leaderboardReplay';
import {getPoolScoringFromState} from '../../utils/betScoring';
import UserAvatar from '../UserAvatar';
import {Loader} from 'semantic-ui-react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/swiper.scss';
import SwiperCore, {Pagination} from 'swiper';

SwiperCore.use([Pagination]);

function buildSlideRows(participates, live, numberOfRounds) {
    const roundSlides = _.map(_.range(numberOfRounds), (roundId) => {
        return _.map(participates, ({rounds, userId, ...others}) => {
            const {bets} = _.get(rounds, roundId, {score: 0, medals: {1: 0, 2: 0, 3: 0}});
            const {roundScore, roundMedals} = _.reduce(bets, (agg, bet) => {
                if (bet.medal && (live || bet.status === 'FINISHED')) {
                    agg.roundScore += bet.score;
                    _.set(agg.roundMedals, bet.medal, _.get(agg.roundMedals, bet.medal, 0) + (1 * bet.factor));
                }
                return agg;
            }, {roundScore: 0, roundMedals: {1: 0, 2: 0, 3: 0}});
            return {
                ...others,
                userId,
                score: roundScore,
                medals: roundMedals
            };
        });
    });

    const allTimeRow = _.map(participates, ({rounds, userId, ...others}) => {
        let score = 0;
        const medals = {1: 0, 2: 0, 3: 0};
        _.forEach(_.range(numberOfRounds), (rid) => {
            const {bets} = _.get(rounds, rid, {bets: []});
            _.forEach(bets, (bet) => {
                if (bet.medal && (live || bet.status === 'FINISHED')) {
                    score += bet.score;
                    _.set(medals, bet.medal, _.get(medals, bet.medal, 0) + (1 * bet.factor));
                }
            });
        });
        return {
            ...others,
            userId,
            score,
            medals
        };
    });

    return {roundSlides, allTimeRow};
}

function LeaderRow({participate, rank, isCurrentUser}) {
    const medals = _.map(_.forOwnRight(participate.medals), (medal, idx) => {
        const medalClass = classNames('icon star large fitted', {
            'bronze-medal': idx === '1',
            'sliver-medal': idx === '2',
            'gold-medal': idx === '3'
        });
        return (
            <div key={idx} className="leader-medal">
                <i className={medalClass} />
                <div className="medal-badge">{medal}</div>
            </div>
        );
    });
    const rankNum = Number(rank);
    const topThreeHighlight = Number.isFinite(rankNum) && rankNum >= 1 && rankNum <= 3;

    return (
        <li
            className={classNames('leader-row', {
                'leader-row--current-user': isCurrentUser,
                [`leader-row--rank-${rankNum}`]: topThreeHighlight,
            })}
        >
            <div className="leader-body">
                <div className="leader-rank">{rank}.</div>
                <div className="leader-side">
                    <UserAvatar
                        className="leader-image"
                        user={participate}
                        alt={participate.username}
                        title={participate.username}
                    />
                </div>
                <div className="leader-center">
                    <div className="leader-name">{participate.firstName} {participate.lastName}</div>
                    <div className="leader-medals">{medals}</div>
                    <div className="leader-score-box">
                        <span className="leader-score-numbers">{participate.score}</span>
                    </div>
                </div>
            </div>
        </li>
    );
}

const LeadersContainer = () => {
    const dispatch = useDispatch();
    const match = useRouteMatch();
    const poolId = match.params.id;
    const participatesRaw = useSelector((state) => state.pools.participates);
    const participates = useMemo(() => {
        if (Array.isArray(participatesRaw)) {
            return participatesRaw;
        }
        return _.values(participatesRaw || {});
    }, [participatesRaw]);
    const bets = useSelector((state) => state.pools.bets);
    const isFetching = useSelector((state) => state.pools.isFetching);
    const goalsLog = useSelector((s) => _.get(s.pools.goalsLogByPool, String(poolId), null));
    const poolsState = useSelector((s) => s.pools);

    const [live, setLive] = useState(1);
    const [swiperActiveIndex, setSwiperActiveIndex] = useState(0);
    const [replayOpen, setReplayOpen] = useState(false);
    const [replayStep, setReplayStep] = useState(0);
    const [replayPlaying, setReplayPlaying] = useState(false);
    const [replaySpeedIdx, setReplaySpeedIdx] = useState(1);
    const [showRoundGames, setShowRoundGames] = useState(1);

    const numberOfRounds = _.size(_.get(_.first(participates), 'rounds', []));
    const {poolFactors, scoringMode} = getPoolScoringFromState(poolsState, poolId);
    const challengeMeta = useMemo(() => buildChallengeMetaFromBets(bets), [bets]);
    const sortedLogs = useMemo(() => _.sortBy(goalsLog || [], (g) => new Date(g.createdAt).getTime()), [goalsLog]);

    const {roundSlides, allTimeRow} = useMemo(
        () => buildSlideRows(participates, live, numberOfRounds),
        [participates, live, numberOfRounds]
    );

    const slidesData = useMemo(() => {
        const roundsMeta = _.map(_.range(numberOfRounds), (roundIndex) => {
            const roundId = _.get(participates[0], ['rounds', roundIndex, 'round']);
            return {
                kind: 'round',
                roundIndex,
                roundId,
                title: `Round ${roundIndex + 1}`,
                roundScore: roundSlides[roundIndex]
            };
        });
        return _.concat(roundsMeta, [{
            kind: 'all',
            title: 'All Time',
            roundScore: allTimeRow
        }]);
    }, [numberOfRounds, participates, roundSlides, allTimeRow]);

    const slidesForSwiper = useMemo(() => _.reverse([...slidesData]), [slidesData]);

    const logicalSlide = slidesData[slidesData.length - 1 - swiperActiveIndex] || _.last(slidesData);

    const replayScope = useMemo(() => {
        if (!logicalSlide) {
            return {roundId: undefined, roundIndex: undefined};
        }
        if (logicalSlide.kind === 'all') {
            return {roundId: undefined, roundIndex: undefined};
        }
        return {
            roundId: logicalSlide.roundId != null ? _.toInteger(logicalSlide.roundId) : undefined,
            roundIndex: logicalSlide.roundIndex
        };
    }, [logicalSlide]);

    const snapshots = useMemo(() => {
        if (_.isEmpty(participates)) {
            return [];
        }
        return buildReplaySnapshots(participates, poolFactors, sortedLogs, challengeMeta, {
            ...replayScope,
            scoringMode
        });
    }, [participates, poolFactors, sortedLogs, challengeMeta, replayScope, scoringMode]);

    const maxStep = Math.max(0, snapshots.length - 1);
    const safeStep = Math.min(replayStep, maxStep);
    const emptySnap = {leaders: [], logEntry: null, gameScores: {}};
    const currentSnap = snapshots[safeStep] || emptySnap;

    useEffect(() => {
        const hasLiveGames = _.some(bets, bet => {
            const challengeStatus = _.get(bet, 'challenge.status');
            return _.includes(['IN_PLAY', 'PAUSED', 'EXTRA_TIME'], challengeStatus);
        });
        setShowRoundGames(hasLiveGames || replayPlaying || safeStep > 0 ? 1 : 0);
    }, [bets, replayPlaying, safeStep]);

    useEffect(() => {
        if (!replayOpen) {
            return undefined;
        }
        dispatch(getPoolGoals(poolId));
    }, [replayOpen, poolId, dispatch]);

    useEffect(() => {
        if (!showRoundGames || !logicalSlide) {
            return undefined;
        }
        dispatch(getPoolGoals(poolId));
    }, [showRoundGames, poolId, dispatch, logicalSlide?.kind, logicalSlide?.roundId]);

    useEffect(() => {
        if (!replayPlaying || maxStep <= 0) {
            return undefined;
        }
        if (safeStep >= maxStep) {
            setReplayPlaying(false);
            return undefined;
        }
        const ms = SPEED_MS[Math.min(replaySpeedIdx, SPEED_MS.length - 1)] || 1000;
        const t = setTimeout(() => setReplayStep((s) => Math.min(s + 1, maxStep)), ms);
        return () => clearTimeout(t);
    }, [replayPlaying, safeStep, maxStep, replaySpeedIdx]);

    const resetReplay = useCallback(() => {
        setReplayStep(0);
        setReplayPlaying(false);
    }, []);

    /* Reset scrubber when changing round/board — not when goals load (e.g. opening replay dock) */
    useEffect(() => {
        resetReplay();
    }, [swiperActiveIndex, replayScope.roundId, replayScope.roundIndex, resetReplay]);

    const onToggleReplayPlay = useCallback(() => {
        setReplayPlaying((wasPlaying) => {
            if (!wasPlaying) {
                //setReplayStep(0);
                return true;
            }
            return false;
        });
    }, []);

    const me = getUserFromLocalStorage().userId;

    const handleClick = (e) => {
        e.preventDefault();
        setLive(!live);
    };

    if (_.isEmpty(participates) && isFetching) {
        return <Loader active inline="centered">Loading leaderboard…</Loader>;
    }

    return (
        <div className="leaders-layout">
            <div className="leaders-toolbar">
                <div className="live-toggle">
                    <div onClick={handleClick} className="live-toggle-switch">
                        <div className={live ? 'knob active' : 'knob'} />
                    </div>
                    <div className={live ? 'live-label active' : 'live-label'}>Live</div>
                </div>
                {logicalSlide && (
                    <div className="live-toggle live-toggle--show-games">
                        <div
                            onClick={() => setShowRoundGames((v) => !v)}
                            className="live-toggle-switch"
                            role="switch"
                            aria-checked={showRoundGames}
                        >
                            <div className={classNames('knob', {active: showRoundGames})} />
                        </div>
                        <div className="live-label active">Show games</div>
                    </div>
                )}
            </div>
            <div className="leader-swiper-host">
                <div className="leader-swiper-host__viewport">
                    <Swiper
                        pagination={{dynamicBullets: true}}
                        className="Swiper leader-swiper"
                        onSlideChange={(swiper) => setSwiperActiveIndex(swiper.activeIndex)}
                        onAfterInit={(swiper) => setSwiperActiveIndex(swiper.activeIndex)}
                    >
                        {_.map(slidesForSwiper, (slide, revIdx) => {
                            /* Live at step 0 with dock open (swipe); snapshot once playing, scrubbed, or paused mid-run */
                            const activeSlide = revIdx === swiperActiveIndex;
                            const useReplaySnapshot =
                                replayOpen &&
                                activeSlide &&
                                snapshots.length > 0 &&
                                (replayPlaying || safeStep > 0);
                            const leaders = useReplaySnapshot
                                ? currentSnap.leaders
                                : getParticipatesWithRank(slide.roundScore);
                            const listBlock = (
                                <>
                                    <div className="round-title">{slide.title} Leaders</div>
                                    <ul className="leader-list">
                                        {_.map(leaders, (participate) => (
                                            <LeaderRow
                                                key={participate.userId}
                                                participate={participate}
                                                rank={participate.rank}
                                                isCurrentUser={Number(participate.userId) === Number(me)}
                                            />
                                        ))}
                                    </ul>
                                </>
                            );
                            return (
                                <SwiperSlide key={`${slide.kind}-${slide.roundIndex ?? 'all'}`}>
                                    {showRoundGames ? (
                                        <div className="leaders-slide leaders-slide--split">
                                            <div className="leaders-split-body">
                                                <div className="leaders-split-body__main">
                                                    {listBlock}
                                                </div>
                                                <aside className="leaders-split-body__games" aria-label="Match scores">
                                                    <RoundGamesPanel
                                                        boardKind={slide.kind}
                                                        roundId={slide.kind === 'round' ? slide.roundId : null}
                                                        bets={bets}
                                                        sortedLogs={sortedLogs}
                                                        replayOpen={replayOpen && activeSlide}
                                                        replayStep={safeStep}
                                                        replayGameScores={
                                                            useReplaySnapshot && activeSlide
                                                                ? (currentSnap.gameScores || {})
                                                                : null
                                                        }
                                                    />
                                                </aside>
                                            </div>
                                        </div>
                                    ) : (
                                        listBlock
                                    )}
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
            <LeaderboardReplay
                open={replayOpen}
                onOpen={() => setReplayOpen(true)}
                onClose={() => {
                    setReplayOpen(false);
                    setReplayPlaying(false);
                }}
                step={safeStep}
                maxStep={maxStep}
                onStepChange={(n) => {
                    setReplayPlaying(false);
                    setReplayStep(n);
                }}
                playing={replayPlaying}
                onTogglePlay={onToggleReplayPlay}
                onReset={resetReplay}
                speedIdx={replaySpeedIdx}
                onSpeedChange={setReplaySpeedIdx}
                emptyLogMessage={replayOpen && _.isEmpty(sortedLogs)
                    ? 'No goal history yet for this pool. New goals are logged when live scores update.'
                    : null}
            />
        </div>
    );
};

export default LeadersContainer;
