import React, { useMemo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { getParticipatesWithRank } from '../../../utils';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Modal } from 'semantic-ui-react';
import { buildNextGoalViewOthersRows } from './viewOthersNextGoalPreview';

function NextGoalSplitHeader({ challenge, splitScores, side }) {
    const {
        id,
        game: { homeTeam, awayTeam },
        playAt,
        status,
    } = challenge;
    const { currentH, currentA, proposedH, proposedA } = splitScores;
    const scoringLabel =
        side === 'home'
            ? homeTeam.shortName || homeTeam.name || 'Home'
            : awayTeam.shortName || awayTeam.name || 'Away';
    const isLive = ['IN_PLAY', 'PAUSED', 'EXTRA_TIME'].includes(status);

    return (
        <Modal.Header>
            <li className="challenge-row challenge-row--score-split" key={id}>
                <div className="game-title game-title--score-split">
                    <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                    <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                </div>
                <div className="view-others-score-split">
                    <div className="view-others-score-split__inner">
                        <div className="view-others-score-split__current">
                            <div className="view-others-score-split__watermarks" aria-hidden>
                                <img src={homeTeam.flag} alt="" className="view-others-score-split__wm view-others-score-split__wm--l" />
                                <img src={awayTeam.flag} alt="" className="view-others-score-split__wm view-others-score-split__wm--r" />
                            </div>
                            <div className="view-others-score-split__current-row">
                                <div className="view-others-score-split__mini-flag">
                                    <img src={homeTeam.flag} alt="" />
                                </div>
                                <div className="view-others-score-split__current-center">
                                    <div className="view-others-score-split__score-live">
                                        {currentH} : {currentA}
                                    </div>
                                    <div className="view-others-score-split__live-tag">
                                        {isLive ? 'Live match' : 'Current score'}
                                    </div>
                                </div>
                                <div className="view-others-score-split__mini-flag">
                                    <img src={awayTeam.flag} alt="" />
                                </div>
                            </div>
                        </div>
                        <div className={classNames('view-others-score-split__next', `view-others-score-split__next--${side}`)}>
                            <div className="view-others-score-split__watermarks view-others-score-split__watermarks--next" aria-hidden>
                                <img src={homeTeam.flag} alt="" className="view-others-score-split__wm" />
                                <img src={awayTeam.flag} alt="" className="view-others-score-split__wm" />
                            </div>
                            <div className="view-others-score-split__next-kicker">If {scoringLabel} scores next…</div>
                            <div className="view-others-score-split__next-title">Hypothetical</div>
                            <div className="view-others-score-split__next-score">
                                {proposedH} : {proposedA}
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </Modal.Header>
    );
}

const ViewOthers = ({ clickOnBetChange, nextGoalPreview }) => {
    const MatchResult = ({ challenge: { score1, score2, isOpen, odds1, odds2, oddsX } }) => {
        return !isOpen ? (
            <div className="game-result">
                {score1} : {score2}
            </div>
        ) : (
            <div className="game-odds">
                <div className="odds-title-row">
                    <div>Home</div>
                    <div>Draw</div>
                    <div>Away</div>
                </div>
                <div className="odds-title-values">
                    <div>{odds1}</div>
                    <div>{oddsX}</div>
                    <div>{odds2}</div>
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
            game: { homeTeam, awayTeam },
            playAt,
        } = challenge;
        return (
            <Modal.Header>
                <li className="challenge-row" key={id}>
                    <div className="game-title">
                        <div className="game-day">{moment(playAt).format('ddd DD/MM')} -</div>
                        <div className="game-hour">{moment(playAt).format('H:mm')}</div>
                    </div>
                    <div className="game-body">
                        <TeamScore team={homeTeam} />
                        <MatchResult challenge={challenge} />
                        <TeamScore team={awayTeam} reverse={true} />
                    </div>
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
    const UserBet = ({ participate, bet, isOpen, showPtsDelta }) => {
        return (
            <li className="user-bet-row">
                <div className="user-bet-side">
                    <img
                        className="user-bet-image"
                        src={participate.picture}
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
                    </div>
                </div>
                <div className="user-bet-medal">{!isOpen ? <Medal score={bet.score} medal={bet.medal} /> : ''}</div>
                <div className="user-bet-score">
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
                </div>
            </li>
        );
    };

    const BetsList = ({ usersBets, participates, isOpen, showPtsDelta }) => {
        const userBetsNode = _.map(_.orderBy(participates, 'rank'), (participate) => {
            return (
                <UserBet
                    participate={participate}
                    key={participate.userId}
                    isOpen={isOpen}
                    showPtsDelta={showPtsDelta}
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

    if (previewBuilt) {
        const { splitScores, usersBets: previewBets, participatesWithRank: previewRanked } = previewBuilt;
        const side = nextGoalPreview.side === 'away' ? 'away' : 'home';
        return (
            <div id="content" className="view-others-shell" style={{ margin: '35px 8px 8px 8px' }}>
                <section>
                    <NextGoalSplitHeader
                        challenge={nextGoalPreview.challenge}
                        splitScores={splitScores}
                        side={side}
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

    const viewableUsersIds = _.map(usersBets, 'userId');
    const othersParticipatesRanked = _.filter(getParticipatesWithRank(participates), ({ userId }) =>
        _.includes(viewableUsersIds, userId)
    );
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
