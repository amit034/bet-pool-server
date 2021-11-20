import React from 'react';
import classNames from "classnames";
import moment from "moment";
import _ from "lodash";

function GameComponent({bet, onMatchClick, onBetKeyChange}){
    const {
        score1, score2, score, medal,
        challenge: {id: challengeId, isOpen, score1: c_score1, score2: c_score2,
            game: {homeTeam, awayTeam}, playAt, factorId}
    } = bet;
    const gameSideClassName = classNames('game-side', {'main-event': factorId > 1});
    const className = classNames('match-tip-image circular teal icon link small fitted', {
        'users': !isOpen,
        'lightbulb': isOpen
    });
    function clickOnBetKeyChange(challengeId, betFieldName, score) {
        onBetKeyChange(challengeId, betFieldName, score);
    }
    function  handleFocus ({ target }) {
        const el = target;
        setTimeout(function () {
            el.select();
        }, 0);
    }

    const TeamScore = ({team: {flag, shortName, name}, teamBet, closed, challengeId, betFieldName, reverse}) => {
        const className = classNames('team-score', {'team-reverse': reverse});
        return (<div className={className}>
            <div className="team-bet game-body-column">
                <div className="game-body-column-center">
                    <input id="betInput" onFocus={handleFocus}
                           onChange={(e) => {
                               return clickOnBetKeyChange(challengeId, betFieldName, e.target.value);
                           }} value={_.toString(teamBet)}
                           disabled={closed}>
                    </input>
                </div>
                <div className="team-name game-body-column-footer">{shortName}</div>
            </div>
            <div className="team-details game-body-column">
                <div className="game-body-column-center">
                    <div className="team-flag">
                        <img alt={name} title={name} src={flag}/>
                    </div>
                </div>
                <div className="game-body-column-footer">&nbsp;</div>
            </div>
        </div>);
    };
    const Medal = ({score, medal}) => {
        const className = classNames('icon star large fitted', {
            'outline': medal === 0,
            'bronze-medal': medal === 1,
            'sliver-medal': medal === 2,
            'gold-medal': medal === 3
        });
        return <div className="bet-score">
            <div className="bet-score-points">{score}</div>
            <div className="bet-score-medal"><i className={className}></i></div>
        </div>
    };

    const MatchResult = ({score1, score2}) => {
        return (<div className="game-result game-body-column">
            <div className="match-result game-body-column-center">{score1} : {score2}</div>
            <div className="game-body-column-footer">&nbsp;</div>
        </div>);
    };
    return (
            <li className="game-row" data={challengeId} key={challengeId}>
                <div className={gameSideClassName}>
                    {factorId > 1 ? 'Main Event' : ''}
                </div>
                <div className="game-center">
                    <div className="game-title">
                        <div className="match-tip">
                            <i className={className}
                               onClick={() => onMatchClick(challengeId, !isOpen)}></i>
                            {/* <i className={className} onClick={() => this.onAnimation()}></i> */}
                        </div>
                        {!isOpen ? <Medal score={score} medal={medal}/> : ''}
                        <div className="game-day">{moment(playAt).format('DD/MM/YYYY')}</div>
                        {/* < div className="game-more">{factor > 1 ? 'Main Event': ''}</div> */}
                        <div className="game-hour">{moment(playAt).format('H:mm')}</div>

                    </div>
                    <div className="game-body">
                        <TeamScore team={homeTeam} teamBet={score1} closed={!isOpen} challengeId={challengeId}
                                   betFieldName="score1"/>
                        <MatchResult score1={c_score1} score2={c_score2} closed={!isOpen}
                                     challengeId={challengeId}/>
                        <TeamScore team={awayTeam} teamBet={score2} closed={!isOpen} challengeId={challengeId}
                                   betFieldName="score2"
                                   reverse={true}/>
                    </div>
                </div>
            </li>)
}

export default React.memo(GameComponent, (prevGame, nextGame) => {
    return _.isEqual(_.get(prevGame, 'bet'), _.get(nextGame, 'bet'));
});