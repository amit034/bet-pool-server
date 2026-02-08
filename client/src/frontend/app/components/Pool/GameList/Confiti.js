import React, {useCallback, useEffect, useRef} from 'react';
import {useWindowSize} from 'react-use'
import ReactCanvasConfetti from "react-canvas-confetti";
const canvasStyles = {
    position: 'absolute',
    zIndex: -1,
    pointerEvents: "none",
    width: "100%",
    height: "100%",
    top: 0
};
const Confiti = ({challenge, goal}) => {
    const { width, height } = useWindowSize()
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
            origin: { y: 1.7 },
            ticks: 1000,
            gravity: 0.4,
            particleCount: Math.floor(800 * particleRatio)
        });
    }, []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 52,
            startVelocity: 55
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
            startVelocity: 25,
            decay: 0.92,
            scalar: 2.4
        });

        makeShot(0.1, {
            spread: 240,
            startVelocity: 45
        });
    }, [makeShot]);
    const animate =  () => {
        fire();
    }
    return (<ReactCanvasConfetti  width={width}
                              height={height} refConfetti={getInstance} style={canvasStyles} />)
}

export default Confiti;