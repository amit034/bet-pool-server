import React from 'react';

const RoundHeader = ({
    roundNum,
    userName,
    currentRank,
    bestCaseRank,
    worstCaseRank,
}) => {
    return (
        <div className="round-header">
            <span className="round-title">Round No: {roundNum}</span>
            <div className="round-header-stats">
                <span className="round-stat round-stat-rank">
                    <i className="user icon round-stat-icon round-stat-icon--user" aria-hidden="true" />
                    <span className="round-stat__body">
                        <span className="round-stat__label">{userName}:&nbsp;Rank:&nbsp;</span>
                        <span className="round-stat__value">
                            {currentRank != null ? currentRank : '–'}
                        </span>
                    </span>
                </span>

                <span className="round-stat round-stat-best">
                    <i className="lightning icon round-stat-icon round-stat-icon--bolt" aria-hidden="true" />
                    <span className="round-stat__body">
                        <span className="round-stat__label">Best case:&nbsp;</span>
                        <span className="round-stat__value">
                            {bestCaseRank != null ? bestCaseRank : '–'}
                        </span>
                    </span>
                </span>

                <span className="round-stat round-stat-worst">
                    <i className="exclamation triangle icon round-stat-icon round-stat-icon--warning" aria-hidden="true" />
                    <span className="round-stat__body">
                        <span className="round-stat__label">Worst case:&nbsp;</span>
                        <span className="round-stat__value">
                            {worstCaseRank != null ? worstCaseRank : '–'}
                        </span>
                    </span>
                </span>
            </div>
        </div>
    );
};

export default RoundHeader;
