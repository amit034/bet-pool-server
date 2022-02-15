import React from 'react';
import Confiti from './Confiti';
import classNames from "classnames";

const canvasStyles = {
    position: 'absolute',
    zIndex: -1,
    pointerEvents: "none",
    width: "100%",
    height: "100%",
    top: 0
};
const Goal = ({challenge, goal}) => {
    const className = classNames('goal');

    const MatchResult = ({challenge: {score1, score2}, goal}) => {
        const homeTeamClass = classNames( 'home-team', {'blink' : goal === 'homeTeam'});
        const awayTeamClass = classNames( 'away-team', {'blink' : goal === 'awayTeam'});
        return (<div className="game-result">
          <div className={homeTeamClass}>{score1}</div>
        <div className="points__versus">&#58;</div>
        <div className={awayTeamClass}>{score2}</div>
        </div>);
    };
    const TeamScore = ({team: {flag, name}, reverse, blink}) => {
        const className = classNames('team-score', {'team-reverse': reverse});
        const teamClassName = classNames( 'team-details', {'blink' : blink});
        return (<div className={className}>
            <div className={teamClassName}>
                <div className="team-name">{name}</div>
                <div className="team-flag">
                    <img className="team-image" src={flag} alt={name} title={name}/>
                </div>

            </div>
        </div>);
    };
    const ChallengeDetails = ({challenge, goal}) => {
        const {game: {homeTeam, awayTeam}} = challenge;
        return (<div className="game-body">
                <TeamScore team={homeTeam} blink={goal === 'homeTeam'}/>
                <MatchResult challenge={challenge} goal={goal} />
                <TeamScore team={awayTeam} reverse={true} blink={goal === 'awayTeam'} />
            </div>);
    };
    return (<div  className={className}>
        <Confiti/>
        <ChallengeDetails challenge={challenge} goal={goal}/>
    </div>)
}

export default Goal;