'use strict';
import React, {useCallback, useRef} from 'react';
import classNames from 'classnames';
import {Icon} from 'semantic-ui-react';

/** Step interval ms per goal log: 2x = 0.5s (index 0), 1x = 1s (index 1). */
const SPEED_MS = [500, 1000];

const SWIPE_UP_MIN_PX = 32;
const MAX_HORIZONTAL_DRIFT_PX = 64;

/**
 * Minimal floating dock: closed = long grip line + swipe up; open = transport + scrub + close.
 */
const LeaderboardReplay = ({
    open,
    onOpen,
    onClose,
    step,
    maxStep,
    onStepChange,
    playing,
    onTogglePlay,
    onReset,
    speedIdx,
    onSpeedChange,
    emptyLogMessage
}) => {
    const safeMax = Math.max(0, maxStep);
    const safeStep = Math.min(step, safeMax);
    const is2x = speedIdx === 0;
    const pointerStart = useRef(null);

    const set1x = () => onSpeedChange(1);
    const set2x = () => onSpeedChange(0);

    const clearPointerStart = useCallback(() => {
        pointerStart.current = null;
    }, []);

    const onHandlePointerDown = useCallback((e) => {
        e.stopPropagation();
        if (e.pointerType === 'mouse' && e.button !== 0) {
            return;
        }
        pointerStart.current = {y: e.clientY, x: e.clientX};
        if (e.pointerType !== 'touch') {
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    }, []);

    const tryOpenFromSwipe = useCallback(
        (clientY, clientX) => {
            const start = pointerStart.current;
            pointerStart.current = null;
            if (!start) {
                return;
            }
            const dy = start.y - clientY;
            const dx = Math.abs(clientX - start.x);
            if (dy > SWIPE_UP_MIN_PX && dx < MAX_HORIZONTAL_DRIFT_PX) {
                onOpen();
            }
        },
        [onOpen]
    );

    const onHandlePointerUp = useCallback(
        (e) => {
            e.stopPropagation();
            tryOpenFromSwipe(e.clientY, e.clientX);
            if (e.pointerType !== 'touch' && e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
        },
        [tryOpenFromSwipe]
    );

    const onHandlePointerCancel = useCallback(
        (e) => {
            e.stopPropagation();
            clearPointerStart();
            try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }
            } catch (err) {
                /* ignore */
            }
        },
        [clearPointerStart]
    );

    const onHandleTouchStart = useCallback((e) => {
        e.stopPropagation();
        if (e.touches.length !== 1) {
            return;
        }
        const t = e.touches[0];
        pointerStart.current = {y: t.clientY, x: t.clientX};
    }, []);

    const onHandleTouchEnd = useCallback(
        (e) => {
            e.stopPropagation();
            const t = e.changedTouches[0];
            if (t) {
                tryOpenFromSwipe(t.clientY, t.clientX);
            }
        },
        [tryOpenFromSwipe]
    );

    return (
        <div className="leader-replay-dock" aria-hidden={false}>
            <div className="leader-replay-dock__inner">
                {!open ? (
                    <div
                        className="leader-replay-dock__handle"
                        role="button"
                        tabIndex={0}
                        aria-label="Swipe up to open goal replay"
                        onPointerDown={onHandlePointerDown}
                        onPointerUp={onHandlePointerUp}
                        onPointerCancel={onHandlePointerCancel}
                        onTouchStart={onHandleTouchStart}
                        onTouchEnd={onHandleTouchEnd}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onOpen();
                            }
                        }}
                    >
                        <span className="leader-replay-dock__handle-line" aria-hidden />
                    </div>
                ) : (
                    <div className="leader-replay-dock__panel leader-replay-dock__panel--minimal">
                        <div className="leader-replay-dock__controls">
                            <button
                                type="button"
                                className="leader-replay-dock__icon-btn leader-replay-dock__icon-btn--sm"
                                onClick={onReset}
                                aria-label="Reset replay"
                            >
                                <Icon name="undo" />
                            </button>
                            <button
                                type="button"
                                className="leader-replay-dock__icon-btn leader-replay-dock__icon-btn--sm"
                                onClick={onTogglePlay}
                                aria-label={playing ? 'Pause' : 'Play'}
                            >
                                <Icon name={playing ? 'pause' : 'play'} />
                            </button>
                            <div className="leader-replay-dock__speed">
                                <button
                                    type="button"
                                    className={classNames('leader-replay-dock__speed-btn', {
                                        'leader-replay-dock__speed-btn--active': !is2x
                                    })}
                                    onClick={set1x}
                                >
                                    1x
                                </button>
                                <button
                                    type="button"
                                    className={classNames('leader-replay-dock__speed-btn', {
                                        'leader-replay-dock__speed-btn--active': is2x
                                    })}
                                    onClick={set2x}
                                >
                                    2x
                                </button>
                            </div>
                            <button
                                type="button"
                                className="leader-replay-dock__icon-btn leader-replay-dock__icon-btn--sm leader-replay-dock__close-btn"
                                onClick={onClose}
                                aria-label="Close replay"
                            >
                                <Icon name="close" />
                            </button>
                        </div>
                        <input
                            type="range"
                            className="leader-replay-dock__scrub"
                            min={0}
                            max={safeMax}
                            value={safeStep}
                            onChange={(e) => {
                                onStepChange(parseInt(e.target.value, 10));
                            }}
                        />
                        {emptyLogMessage ? (
                            <p className="leader-replay-dock__empty leader-replay-dock__empty--minimal">{emptyLogMessage}</p>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardReplay;
export {SPEED_MS};
