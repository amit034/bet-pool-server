import React from 'react';

const DateGroupHeader = ({ dateLabel, bestCaseRank, worstCaseRank, pending, onBestCaseClick, onWorstCaseClick }) => {
    const bestDisplay = pending ? '-' : bestCaseRank != null ? bestCaseRank : '–';
    const worstDisplay = pending ? '-' : worstCaseRank != null ? worstCaseRank : '–';

    const bestPillProps =
        onBestCaseClick && !pending
            ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: onBestCaseClick,
                  onKeyDown: (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onBestCaseClick();
                      }
                  },
              }
            : {};

    const worstPillProps =
        onWorstCaseClick && !pending
            ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: onWorstCaseClick,
                  onKeyDown: (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onWorstCaseClick();
                      }
                  },
              }
            : {};

    return (
        <div className="date-group-header">
            <span className="date-group-header__date">{dateLabel}</span>
            <div className="date-group-header__badges">
                <span
                    className={`date-group-header__pill date-group-header__pill--best${
                        pending ? ' date-group-header__pill--pending' : ''
                    }`}
                    {...bestPillProps}
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
                    {...worstPillProps}
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
