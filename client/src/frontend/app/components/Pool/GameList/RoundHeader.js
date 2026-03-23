// RoundHeader.js (final refined)

import React from 'react';

const RoundHeader = ({
    roundNum,
    userName,
    currentRank,
    bestCaseRank,
    worstCaseRank,
}) => {
    // We don't need volatility for this minimal version
    return (
        <div className="round-header">
            <span className="round-title">Round No: {roundNum}</span>
            <div className="round-header-stats"> 
                {/* 1. User/Rank stat */}
                <span className="round-stat round-stat-rank">
                    <i className="round-stat-icon round-stat-icon--user" aria-hidden="true" />
                    {userName}:&nbsp;
                    Rank:&nbsp;
                    {/* Wrapped the value in a specific span for distinct styling */}
                    <span className="round-stat__value">
                        {currentRank != null ? currentRank : '–'}
                    </span>
                </span>

                {/* 2. Best case stat */}
                <span className="round-stat">
                    <i className="round-stat-icon round-stat-icon--bolt" aria-hidden="true" />
                    Best case:&nbsp;
                    <span className="round-stat__value">
                        {bestCaseRank != null ? bestCaseRank : '–'}
                    </span>
                </span>

                {/* 3. Worst case stat */}
                <span className="round-stat">
                    <i className="round-stat-icon round-stat-icon--warning" aria-hidden="true" />
                    Worst case:&nbsp;
                    <span className="round-stat__value">
                        {worstCaseRank != null ? worstCaseRank : '–'}
                    </span>
                </span>
            </div>
        </div>
    );
};

export default RoundHeader;