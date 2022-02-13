import React, {useCallback, useEffect, useRef} from 'react';
import ReactCanvasConfetti from "react-canvas-confetti";
import classNames from "classnames";
const canvasStyles = {
    position: 'absolute',
    zIndex: -1,
    pointerEvents: "none",
    width: "100%",
    height: "100%",
    top: 0
};
const Goal = ({score1, score2, side}) => {
    const marqueeEl = useRef(null);
    const refAnimationInstance = useRef(null);
    useEffect(() => {
        if (marqueeEl && marqueeEl.current) {
            animate();
        }
    },[marqueeEl]);
    const getInstance = useCallback((instance) => {
        refAnimationInstance.current = instance;
    }, []);

    const makeShot = useCallback((particleRatio, opts) => {
        refAnimationInstance.current &&
        refAnimationInstance.current({
            ...opts,
            ticks: 600,
            origin: { y: 0.7 },
            particleCount: Math.floor(200 * particleRatio)
        });
    }, []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 26,
            startVelocity: 55
        });

        makeShot(0.2, {
            spread: 60
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45
        });
    }, [makeShot]);
    const animate =  () => {
        fire();
        // return new Promise((resolve) => {
        //     marqueeEl.current.children[-1].addEventListener('animationend', resolve)
        // })
    }

    const className = classNames('goal', {
        'goal--blue': side === 'score1',
        'goal--red': side === 'score2'
    });
    return (<div  className={className}>
        <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
        <div className="marquee" ref={marqueeEl} hidden>
            <span className="marquee__letter">G</span>
            <span className="marquee__letter">o</span>
            <span className="marquee__letter">o</span>
            <span className="marquee__letter">o</span>
            <span className="marquee__letter">a</span>
            <span className="marquee__letter">a</span>
            <span className="marquee__letter">a</span>
            <span className="marquee__letter">l</span>
            <span className="marquee__letter">l</span>
            <span className="marquee__letter">l</span>
        </div>
        <div className="points">
            <span className="points__team points__team--blue">{score1}</span>
            <span className="points__versus">&#58;</span>
            <span className="points__team points__team--red">{score2}</span>
        </div>
    </div>)
}

export default Goal;