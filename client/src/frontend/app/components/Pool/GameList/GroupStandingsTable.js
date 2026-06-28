import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';

const GroupStandingsTable = ({rows, highlightTeamIds = []}) => {
    if (_.isEmpty(rows)) {
        return null;
    }
    const highlightSet = new Set(_.map(highlightTeamIds, String));

    return (
        <div className="group-standings">
            <table className="group-standings__table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th className="group-standings__team-col">Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GF</th>
                        <th>GA</th>
                        <th>GD</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(rows, (row) => {
                        const team = row.team || {};
                        const isHighlighted = highlightSet.has(String(row.teamId));
                        return (
                            <tr
                                key={row.teamId}
                                className={classNames({'group-standings__row--highlight': isHighlighted})}
                            >
                                <td>{row.position}</td>
                                <td className="group-standings__team-col">
                                    {team.flag ? (
                                        <img
                                            className="group-standings__flag"
                                            src={team.flag}
                                            alt=""
                                        />
                                    ) : null}
                                    <span className="group-standings__team-label">
                                        {team.code || team.shortName || team.name || '—'}
                                    </span>
                                </td>
                                <td>{row.playedGames}</td>
                                <td>{row.won}</td>
                                <td>{row.draw}</td>
                                <td>{row.lost}</td>
                                <td>{row.goalsFor}</td>
                                <td>{row.goalsAgainst}</td>
                                <td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                <td>{row.points}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default GroupStandingsTable;
