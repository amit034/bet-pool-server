import React from 'react';
import cx from 'classnames';

const CLASS_NAMES = {
    SCORE: 'team-score',
    REVERSE: 'team-reverse',
    DETAILS: 'team-details',
    FLAG: 'team-flag',
    NAME: 'team-name',
    BET: 'game-bet',
    MORE: 'game-more',
    BODY: 'game-body',
};

const TeamScore = ({onBetChange, team: {flag, name}, teamBet, closed, challengeId, betFieldName, reverse}) => {
    const className = cx([CLASS_NAMES.SCORE], {[CLASS_NAMES.REVERSE]: reverse});
    const onChange = (e) => {
        onBetChange(challengeId, betFieldName, e.target.value);
    };
    return (<div className={className}>
        <div className={CLASS_NAMES.DETAILS}>
            <img className={CLASS_NAMES.FLAG}
                 src={flag}
                 alt={name}
                 title={name}
                 role="presentation"
            />
            <span className={CLASS_NAMES.NAME}>
                {name}
            </span>
        </div>
        <div className={CLASS_NAMES.BET}>
            <input onChange={onChange}
                   value={teamBet}
                   disabled={closed}
            />
        </div>
    </div>);
};

export default TeamScore;
