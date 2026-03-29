import React from 'react';

const getOrdinalSuffix = (n) => {
    if (n == null) return { number: '–', suffix: '' };
    const num = Number(n);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return { number: num, suffix: s[(v - 20) % 10] || s[v] || s[0] };
};

const RoundSummary = ({ currentRank, totalPoints }) => {
    const { number, suffix } = getOrdinalSuffix(currentRank);
    return (
        <div className="round-summary">
            <div className="round-summary__title">Round Summary</div>
            <div className="round-summary__body">
                <div className="round-summary__stat">
                    <span className="round-summary__stat-number">{number}</span>
                    <span className="round-summary__stat-suffix">{suffix}</span>
                </div>
                <div className="round-summary__middle">
                    <span className="round-summary__label">Current rank</span>
                    <svg className="round-summary__wave" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12 Q12 4 22 12 T42 12 T62 12 T78 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                    <span className="round-summary__label">Total points<br/>this round</span>
                </div>
                <div className="round-summary__stat">
                    <span className="round-summary__stat-number">{totalPoints || 0}</span>
                    <span className="round-summary__stat-unit">pts</span>
                </div>
            </div>
        </div>
    );
};

export default RoundSummary;
