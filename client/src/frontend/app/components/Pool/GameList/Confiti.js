import React, {useCallback, useEffect, useRef} from 'react';
import ReactCanvasConfetti from "react-canvas-confetti";

const canvasStyles = {
    position: 'absolute',
    zIndex: 9999,
    pointerEvents: "none",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0
};

const Confiti = ({challenge, goal}) => {
    const refAnimationInstance = useRef(null);
    const containerRef = useRef(null);
    
    useEffect(() => {
        if (goal) {
            const timer = setTimeout(() => {
                animate();
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [goal]);

    const getInstance = useCallback((instance) => {
        refAnimationInstance.current = instance;
    }, []);

    const makeShot = useCallback((particleRatio, opts) => {
        if (refAnimationInstance.current) {
            refAnimationInstance.current({
                ...opts,
                origin: { y: 1.7 },
                ticks: 1000,
                gravity: 0.4,
                particleCount: Math.floor(800 * particleRatio)
            });
        }
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
    
    const animate = () => {
        fire();
    }

    if (!goal) {
        return null;
    }

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <ReactCanvasConfetti 
                width={containerRef.current?.offsetWidth || 300}
                height={containerRef.current?.offsetHeight || 200} 
                refConfetti={getInstance} 
                style={canvasStyles} 
            />
        </div>
    )
}

export default Confiti;