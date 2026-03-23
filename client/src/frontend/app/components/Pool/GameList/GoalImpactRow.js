import React from 'react';

const ImpactItem = ({ impact }) => {
    if (!impact) return <div style={{ flex: 1 }}></div>;

    const isUp = impact.rankDiff > 0;
    const isDown = impact.rankDiff < 0;
    const arrow = isUp ? '↑' : (isDown ? '↓' : '');
    
    // UI Colors based on the screenshot
    const impactColor = isUp ? '#7ED321' : (isDown ? '#FF5E5E' : '#9B9B9B');

    const styles = {
        itemContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flex: 1,
            fontFamily: 'sans-serif',
        },
        impactGroup: {
            display: 'flex',
            alignItems: 'center',
            color: impactColor,
            fontWeight: 'bold',
            minWidth: '40px',
        },
        arrow: {
            fontSize: '1.2rem',
            marginRight: '2px',
        },
        rank: {
            fontSize: '1.1rem',
        },
        points: {
            fontSize: '0.9rem',
            color: impactColor,
            width: '35px',
            textAlign: 'center',
        },
        scoreLabel: {
            fontSize: '1rem',
            color: '#FFFFFF',
            fontWeight: 'normal',
            minWidth: '35px',
        }
    };

    return (
        <div style={styles.itemContainer}>
            <div style={styles.impactGroup}>
                <span style={styles.arrow}>{arrow}</span>
                <span style={styles.rank}>{Math.abs(impact.rankDiff)}</span>
                <span style={styles.points}>({impact.scoreDiff}pts)</span>
            </div>
            <span style={styles.scoreLabel}>{impact.gameScoreLabel}</span>
        </div>
    );
};

const GoalImpactRow = ({ homeImpact, awayImpact }) => {
    return (
        <div className="game-impact-footer" style={{
            display: 'flex',
            width: '100%',
            paddingTop: '10px',
            marginTop: '5px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', // The "line break" separator
            alignItems: 'center'
        }}>
            <ImpactItem impact={homeImpact} />
            {/* Spacer to align with the central MatchResult (score:score) column */}
            <div style={{ width: '60px' }}></div> 
            <ImpactItem impact={awayImpact} />
        </div>
    );
};

export default GoalImpactRow;