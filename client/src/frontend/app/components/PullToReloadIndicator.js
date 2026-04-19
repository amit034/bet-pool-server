'use strict';
import React, { useEffect, useRef, useState } from 'react';

const PULL_PX = 96;
const MAX_PULL_TRACK = 140;

function scrollChainAtTop(el) {
    if (!el) return false;
    let n = el;
    while (n && n !== document.documentElement) {
        if (n.scrollTop > 2) return false;
        n = n.parentElement;
    }
    const wy = window.scrollY || document.documentElement.scrollTop || 0;
    return wy <= 2;
}

function touchInsideOpenDropdownOrModal(el) {
    if (!el || typeof document === 'undefined' || !document.querySelectorAll) return false;
    const nodes = document.querySelectorAll('.ui.dropdown.visible, .ui.dropdown .menu.visible');
    for (let i = 0; i < nodes.length; i += 1) {
        if (nodes[i].contains(el)) return true;
    }
    return false;
}

function shouldIgnoreTouchTarget(el) {
    if (!el || !el.closest) return true;
    if (el.closest('.top-menu, .bottom-menu, .ui.modal.visible, .ui.dimmer.visible')) return true;
    if (touchInsideOpenDropdownOrModal(el)) return true;
    return false;
}

function touchStartsInPullRegion(clientY) {
    const menu = document.querySelector('.top-menu');
    const bottom = menu ? menu.getBoundingClientRect().bottom : 56;
    const band = Math.min(340, typeof window !== 'undefined' ? window.innerHeight * 0.38 : 280);
    return clientY >= bottom && clientY <= bottom + band;
}

function hasTouchScreen() {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
}

/**
 * Touch pull-down for full page reload, with browser-style progress feedback.
 */
export default function PullToReloadIndicator({ enabled }) {
    const [pullPx, setPullPx] = useState(0);
    const armedRef = useRef(false);
    const startYRef = useRef(0);
    const rafRef = useRef(null);
    const pendingPullRef = useRef(0);

    useEffect(() => {
        if (!enabled || !hasTouchScreen()) return undefined;

        const flushPull = () => {
            rafRef.current = null;
            setPullPx(pendingPullRef.current);
        };

        const scheduleSetPull = (px) => {
            pendingPullRef.current = px;
            if (rafRef.current == null) {
                rafRef.current = requestAnimationFrame(flushPull);
            }
        };

        const reset = () => {
            armedRef.current = false;
            pendingPullRef.current = 0;
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            setPullPx(0);
        };

        const onTouchStart = (e) => {
            if (e.touches.length !== 1) return;
            const target = e.touches[0].target;
            if (shouldIgnoreTouchTarget(target)) return;
            if (!scrollChainAtTop(target)) return;
            if (!touchStartsInPullRegion(e.touches[0].clientY)) return;
            startYRef.current = e.touches[0].clientY;
            armedRef.current = true;
        };

        const onTouchMove = (e) => {
            if (!armedRef.current || e.touches.length !== 1) return;
            const t = e.touches[0];
            if (!scrollChainAtTop(t.target)) {
                reset();
                return;
            }
            const dy = t.clientY - startYRef.current;
            if (dy <= 0) {
                scheduleSetPull(0);
                return;
            }
            scheduleSetPull(Math.min(dy, MAX_PULL_TRACK));
        };

        const onTouchEnd = (e) => {
            if (!armedRef.current) {
                setPullPx(0);
                return;
            }
            const dy = e.changedTouches[0].clientY - startYRef.current;
            armedRef.current = false;
            pendingPullRef.current = 0;
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (dy >= PULL_PX && scrollChainAtTop(e.changedTouches[0].target)) {
                setPullPx(PULL_PX);
                window.location.reload();
                return;
            }
            setPullPx(0);
        };

        const onTouchCancel = () => {
            reset();
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('touchcancel', onTouchCancel, { passive: true });
        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchCancel);
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [enabled]);

    if (!enabled || !hasTouchScreen()) return null;

    const progress = Math.min(1, pullPx / PULL_PX);
    const ready = pullPx >= PULL_PX;
    const visible = pullPx > 6;
    const arcRotate = progress * 340;
    const hudLift = Math.min(28, pullPx * 0.22);
    const opacity = Math.min(1, pullPx / 18);

    return (
        <div
            className={`pull-to-reload-hud${visible ? ' pull-to-reload-hud--visible' : ''}`}
            style={{
                opacity,
                transform: `translate(-50%, ${hudLift}px)`,
            }}
            aria-hidden="true"
        >
            <div className={`pull-to-reload-hud__pill${ready ? ' pull-to-reload-hud__pill--ready' : ''}`}>
                <div className="pull-to-reload-hud__mark">
                    <div
                        className="pull-to-reload-hud__arc"
                        style={{ transform: `rotate(${arcRotate}deg)` }}
                    />
                    <i className="sync icon pull-to-reload-hud__sync-icon" />
                </div>
                <span className="pull-to-reload-hud__label">
                    {ready ? 'Release to reload' : 'Pull to reload page'}
                </span>
            </div>
        </div>
    );
}
