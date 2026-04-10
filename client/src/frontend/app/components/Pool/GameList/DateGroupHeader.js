import React from 'react';

const DateGroupHeader = ({ dateLabel, bestCaseRank, worstCaseRank, pending }) => {
    const bestDisplay = pending ? 'Pending' : bestCaseRank != null ? bestCaseRank : '–';
    const worstDisplay = pending ? 'Pending' : worstCaseRank != null ? worstCaseRank : '–';

    return (
        <div className="date-group-header">
            <span className="date-group-header__date">{dateLabel}</span>
            <div className="date-group-header__badges">
                <span
                    className={`date-group-header__pill date-group-header__pill--best${
                        pending ? ' date-group-header__pill--pending' : ''
                    }`}
                >
                    <span className="date-group-header__pill-text">
                        <span className="date-group-header__pill-label">Best Case:&nbsp;</span>
                        <span className="date-group-header__pill-value">{bestDisplay}</span>
                    </span>
                </span>
                <span
                    className={`date-group-header__pill date-group-header__pill--worst${
                        pending ? ' date-group-header__pill--pending' : ''
                    }`}
                >
                    <span className="date-group-header__pill-text">
                        <span className="date-group-header__pill-label">Worst Case:&nbsp;</span>
                        <span className="date-group-header__pill-value">{worstDisplay}</span>
                    </span>
                </span>
            </div>
        </div>
    );
};

export default DateGroupHeader;
