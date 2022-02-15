import React, {useCallback, useEffect, useRef} from 'react';
import ReactCanvasConfetti from "react-canvas-confetti";
import classNames from "classnames";
import {Modal} from "semantic-ui-react";
import moment from "moment";
const canvasStyles = {
    position: 'absolute',
    zIndex: -1,
    pointerEvents: "none",
    width: "100%",
    height: "100%",
    top: 0
};
const Goal = ({challenge, goal}) => {
    const marqueeEl = useRef(null);
    const refAnimationInstance = useRef(null);
    useEffect(() => {
            animate();
    },[]);
    const getInstance = useCallback((instance) => {
        refAnimationInstance.current = instance;
    }, []);

    const makeShot = useCallback((particleRatio, opts) => {
        refAnimationInstance.current &&
        refAnimationInstance.current({
            ...opts,
            gravity: 0.2,
            origin: { y: 0.7 },
            particleCount: Math.floor(500 * particleRatio)
        });
    }, []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 52,
            startVelocity: 200
        });

        makeShot(0.2, {
            spread: 120
        });

        makeShot(0.35, {
            spread: 200,
            decay: 0.91,
            scalar: 1.6
        });

        makeShot(0.1, {
            spread: 240,
            startVelocity: 90,
            decay: 0.92,
            scalar: 2.4
        });

        makeShot(0.1, {
            spread: 240,
            startVelocity: 170
        });
    }, [makeShot]);
    const animate =  () => {
        fire();
        // return new Promise((resolve) => {
        //     marqueeEl.current.children[-1].addEventListener('animationend', resolve)
        // })
    }

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
        <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
        {/*<div className="marquee" ref={marqueeEl} hidden>*/}
        {/*    <span className="marquee__letter">G</span>*/}
        {/*    <span className="marquee__letter">o</span>*/}
        {/*    <span className="marquee__letter">o</span>*/}
        {/*    <span className="marquee__letter">o</span>*/}
        {/*    <span className="marquee__letter">a</span>*/}
        {/*    <span className="marquee__letter">a</span>*/}
        {/*    <span className="marquee__letter">a</span>*/}
        {/*    <span className="marquee__letter">l</span>*/}
        {/*    <span className="marquee__letter">l</span>*/}
        {/*    <span className="marquee__letter">l</span>*/}
        {/*</div>*/}
        {/*<div className="points">*/}
        {/*    <span className="points__team points__team--blue">{score1}</span>*/}
        {/*    <span className="points__versus">&#58;</span>*/}
        {/*    <span className="points__team points__team--red">{score2}</span>*/}
        {/*</div>*/}
        <ChallengeDetails challenge={challenge} goal={goal}/>
    </div>)
}

export default Goal;