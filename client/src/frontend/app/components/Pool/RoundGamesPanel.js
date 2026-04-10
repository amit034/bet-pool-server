'use strict';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import {filterGoalLogsByRound} from '../../utils/leaderboardReplay';

function gameIdFromBet(bet) {
    return Number(_.get(bet, 'challenge.game.id') || _.get(bet, 'challenge.refId'));
}

function findBetForGameId(betsMap, gid, boardKind, roundId) {
    return _.find(_.values(betsMap || {}), (b) => {
        if (_.get(b, 'challenge.refName') !== 'Game') {
            return false;
        }
        if (gameIdFromBet(b) !== gid) {
            return false;
        }
        if (boardKind === 'round') {
            return Number(_.get(b, 'challenge.game.round')) === Number(roundId);
        }
        return true;
    });
}

function scoresFromReplayMap(replayGameScores, gid) {
    if (!replayGameScores) {
        return null;
    }
    const pair = replayGameScores[gid] || replayGameScores[String(gid)];
    if (!pair) {
        return [0, 0];
    }
    return [Number(pair[0]) || 0, Number(pair[1]) || 0];
}

/**
 * Match scores: home | score | away. Live: only games that appear in the goal log (empty until goals).
 * Replay: same gameScores as leaderboard; games appear as the timeline includes them.
 */
const RoundGamesPanel = ({
    boardKind,
    roundId,
    bets,
    sortedLogs,
    replayOpen,
    replayStep,
    replayGameScores
}) => {
    const [flashByGameId, setFlashByGameId] = useState({});
    const prevLatestSigRef = useRef({});

    const scopeLogs = useMemo(() => {
        if (boardKind === 'round' && roundId != null && roundId !== '') {
            return filterGoalLogsByRound(sortedLogs || [], roundId);
        }
        return sortedLogs || [];
    }, [boardKind, roundId, sortedLogs]);

    const appliedReplayLogs = useMemo(() => {
        if (!replayOpen || replayStep == null) {
            return [];
        }
        return scopeLogs.slice(0, Math.max(0, replayStep));
    }, [replayOpen, replayStep, scopeLogs]);

    const rows = useMemo(() => {
        const logsForIds = replayOpen && replayGameScores != null ? appliedReplayLogs : scopeLogs;
        const gameIds = _.uniq(_.map(logsForIds, (l) => Number(l.gameId))).filter((id) => id > 0);
        if (gameIds.length === 0) {
            return [];
        }
        const logsByGame = _.groupBy(logsForIds, (e) => Number(e.gameId));

        const built = _.map(gameIds, (gid) => {
            const bet = findBetForGameId(bets, gid, boardKind, roundId);
            if (!bet) {
                return null;
            }
            const c = bet.challenge || {};
            const home = _.get(bet, 'challenge.game.homeTeam') || {};
            const away = _.get(bet, 'challenge.game.awayTeam') || {};
            const playAt = new Date(_.get(bet, 'challenge.playAt') || 0).getTime();
            const glogs = logsByGame[gid] || [];
            const latest = _.maxBy(glogs, (l) => new Date(l.createdAt).getTime());

            let score1;
            let score2;
            let lastAt;

            if (replayOpen && replayGameScores) {
                const rp = scoresFromReplayMap(replayGameScores, gid);
                score1 = rp[0];
                score2 = rp[1];
                lastAt = latest ? new Date(latest.createdAt).getTime() : 0;
            } else {
                score1 = latest ? Number(latest.score1) : Number(c.score1);
                score2 = latest ? Number(latest.score2) : Number(c.score2);
                lastAt = latest ? new Date(latest.createdAt).getTime() : 0;
            }

            return {
                gid,
                bet,
                score1,
                score2,
                lastAt,
                playAt,
                home,
                away,
                latest
            };
        });

        return _.compact(built);
    }, [
        bets,
        boardKind,
        roundId,
        scopeLogs,
        appliedReplayLogs,
        replayOpen,
        replayGameScores
    ]);

    const ordered = useMemo(() => {
        return _.orderBy(rows, ['lastAt', 'playAt'], ['desc', 'desc']);
    }, [rows]);

    const scopeKey = boardKind === 'round' ? `r-${roundId}` : 'all';

    useEffect(() => {
        prevLatestSigRef.current = {};
    }, [scopeKey, replayOpen]);

    useEffect(() => {
        if (replayOpen) {
            return undefined;
        }
        const nextSig = {};
        _.forEach(ordered, (r) => {
            const log = r.latest;
            nextSig[r.gid] = log
                ? `${log.score1}-${log.score2}-${log.createdAt}`
                : `init-${r.score1}-${r.score2}`;
        });
        const prev = prevLatestSigRef.current;
        const toFlash = {};
        _.forEach(nextSig, (sig, gidStr) => {
            const gid = Number(gidStr);
            const old = prev[gid];
            if (old !== undefined && old !== sig) {
                toFlash[gid] = true;
            }
        });
        prevLatestSigRef.current = nextSig;
        if (_.isEmpty(toFlash)) {
            return undefined;
        }
        setFlashByGameId((prevFlash) => ({...prevFlash, ...toFlash}));
        const t = window.setTimeout(() => {
            setFlashByGameId((prevFlash) => {
                const next = {...prevFlash};
                _.forEach(toFlash, (_v, gid) => {
                    delete next[Number(gid)];
                });
                return next;
            });
        }, 2200);
        return () => window.clearTimeout(t);
    }, [ordered, replayOpen]);

    const title = boardKind === 'all' ? 'Matches' : 'Matches';

    return (
        <div className="round-games-panel">
            <div className="round-games-panel__title">{title}</div>
            <div className="round-games-panel__scroll">
                {ordered.length === 0 ? (
                    <div className="round-games-panel__empty">
                        {replayOpen
                            ? 'Scrub replay to see scores appear.'
                            : 'Scores appear here as goals are logged.'}
                    </div>
                ) : (
                    _.map(ordered, (r) => (
                        <div
                            key={r.gid}
                            className={classNames('round-games-row', {
                                'round-games-row--flash': flashByGameId[r.gid]
                            })}
                        >
                            <div className="round-games-row__flag">
                                {r.home.flag ? (
                                    <img src={r.home.flag} alt="" className="round-games-row__img" />
                                ) : (
                                    <span className="round-games-row__ph">—</span>
                                )}
                            </div>
                            <div className="round-games-row__score">
                                <span className="round-games-row__n">{r.score1}</span>
                                <span className="round-games-row__sep">-</span>
                                <span className="round-games-row__n">{r.score2}</span>
                            </div>
                            <div className="round-games-row__flag round-games-row__flag--away">
                                {r.away.flag ? (
                                    <img src={r.away.flag} alt="" className="round-games-row__img" />
                                ) : (
                                    <span className="round-games-row__ph">—</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RoundGamesPanel;
