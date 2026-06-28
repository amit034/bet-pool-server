import _ from 'lodash';

export function getGroupStandingsForMatch(standings, homeTeamId, awayTeamId) {
    if (_.isEmpty(standings)) {
        return [];
    }
    const homeRow = _.find(standings, {teamId: homeTeamId});
    const awayRow = _.find(standings, {teamId: awayTeamId});
    const group = homeRow?.group || awayRow?.group;
    if (!group) {
        return [];
    }
    return _.sortBy(_.filter(standings, {group}), 'position');
}
