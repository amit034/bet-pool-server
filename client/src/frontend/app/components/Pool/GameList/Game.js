import React from 'react';
import moment from 'moment';
import TeamScore from './TeamScore';
import classNames from 'classnames';

const CLASS_NAMES = {
    ROW: 'game-row',
    TITLE: 'game-title',
    DAY: 'game-day',
    HOUR: 'game-hour',
    MORE: 'game-more',
    BODY: 'game-body',
};

const MatchResult = ({result, closed, challengeId, onShowOthers}) => {
    const onClick = () => onShowOthers(challengeId);
    const className = classNames('match-tip-image circular teal icon link small fitted', {
        'users': closed,
        'lightbulb': !closed
    });
    return (<div className="game-result">
        <div className="match-tip"><i class={className} onClick={onClick} /></div>
        <div className="match-result">{result.score1} : {result.score2}</div>
    </div>);
};


const Game = ({bet, showDay, onShowOthers, onBetChange}) => {
    const {score1, score2, challenge: {_id: challengeId, result, game: {team1, team2}, playAt}, closed} = bet;
    return (<li className={CLASS_NAMES.ROW}>
        <div className={CLASS_NAMES.TITLE}>
            <div className={CLASS_NAMES.DAY}>
                {showDay ? moment(playAt).format('ddd DD/MM') : ''}
            </div>
            <div className={CLASS_NAMES.HOUR}>{moment(playAt).format('H:mm')}</div>
            <div className={CLASS_NAMES.MORE}></div>
        </div>
        <div className={CLASS_NAMES.BODY}>
            <TeamScore team={team1}
                       teamBet={score1}
                       closed={closed}
                       challengeId={challengeId}
                       onBetChange={onBetChange}
                       betFieldName="score1"
            />
            <MatchResult result={result}
                         closed={closed}
                         onShowOthers={onShowOthers}
                         challengeId={challengeId}
            />
            <TeamScore reverse
                       team={team2}
                       teamBet={score2}
                       closed={closed}
                       challengeId={challengeId}
                       betFieldName="score2"
                       onBetChange={onBetChange}
            />
        </div>

    </li>);
};

export default Game;
