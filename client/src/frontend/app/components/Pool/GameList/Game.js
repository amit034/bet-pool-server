import React, {useEffect, useRef, useState} from 'react';
import classNames from "classnames";
import moment from "moment";
import _ from "lodash";
import {Form} from 'semantic-ui-react';
import Goal from "./Goal";
const Game = ({bet, goal, onMatchClick, onBetKeyChange, isCurrent}) => {
    const {
        score1, score2, score, medal,
        challenge} = bet;
    const {id: challengeId, isOpen, score1: c_score1, score2: c_score2,
        game: {homeTeam, awayTeam}, playAt, factorId} = challenge
    const currentDayRef = useRef(null);
    const className = classNames('match-tip-image circular icon link small fitted', {
        'users': !isOpen,
        'lightbulb': isOpen
    });
    function clickOnBetKeyChange(challengeId, betFieldName, score) {
        onBetKeyChange(challengeId, betFieldName, score);
        return true;
    }
    function  handleFocus ({ target }) {
        const el = target;
        setTimeout(function () {
            el.select();
        }, 0);
    }
    useEffect(() => {
        if (currentDayRef && currentDayRef.current /* + other conditions */) {
            currentDayRef.current.scrollIntoView({behavior: 'smooth', block: 'start' })
        }
    },[currentDayRef]);
    const TeamScore = ({team: {flag, shortName, name}, teamBet, closed, challengeId, betFieldName, reverse}) => {
        const className = classNames('team-score', {'team-reverse': reverse});
        const val = _.toString(teamBet);
        const editable  = (<input id="betInput" onFocus={handleFocus}
                                  type='number'
                                  onChange={(e) => {
                                      clickOnBetKeyChange(challengeId, betFieldName, e.target.value);
                                  }} value={val}/>);
        return (<div className={className} ref={isCurrent ? currentDayRef : null}>
            <div className="team-bet game-body-column">
                <div className="game-body-column-center">
                    {closed ? <div className="team-bet-closed">{val}</div> : editable}
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
        const className = classNames('bet-score-medal', {
            'no-medal': medal === 0,
            'bronze-medal': medal === 1,
            'sliver-medal': medal === 2,
            'gold-medal': medal === 3
        });
        return <div className="bet-score">
            <label className={className}>{score}</label>
        </div>
    };

    const MatchResult = ({score1, score2}) => {
        return (<div className="game-result game-body-column">
            <div className="match-result game-body-column-center">{score1} : {score2}</div>
            <div className="game-body-column-footer">&nbsp;</div>
        </div>);
    };
    const betRow = (<section style={{display: "contents"}}>
                    <div className="game-side">
                        <div className="game-side-score">
                            {!isOpen ? <Medal score={score} medal={medal}/> : ''}
                        </div>
                        <div className="game-side-title">
                            {factorId > 1 ? 'Main Event' : ''}
                        </div>
                    </div>
                    <div className="game-center">
                        <div className="game-title">
                            <div className="match-tip">
                                <i className={className}
                                   onClick={() => onMatchClick(challengeId, !isOpen)}></i>
                                {/* <i className={className} onClick={() => this.onAnimation()}></i> */}
                            </div>

                            {/*<div className="game-day">{moment(playAt).format('DD/MM/YYYY')}</div>*/}
                            {/*< div className="game-more">{factorId > 1 ? 'Main Event': ''}</div>*/}
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
                    </div></section>)
    return (
            <li className="game-row" data={challengeId}>
                {goal? <Goal challenge={challenge} goal={goal}/> : betRow}
            </li>)
}

export default Game;