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

export function getGroupStandingsBothSides(standings, homeTeamId, awayTeamId) {
    if (_.isEmpty(standings)) {
        return { homeRows: [], awayRows: [], sameGroup: true };
    }
    const homeRow = _.find(standings, {teamId: homeTeamId});
    const awayRow = _.find(standings, {teamId: awayTeamId});
    const homeGroup = homeRow?.group;
    const awayGroup = awayRow?.group;
    if (!homeGroup && !awayGroup) {
        return { homeRows: [], awayRows: [], sameGroup: true };
    }
    if (homeGroup && awayGroup && homeGroup !== awayGroup) {
        return {
            homeRows: _.sortBy(_.filter(standings, {group: homeGroup}), 'position'),
            awayRows: _.sortBy(_.filter(standings, {group: awayGroup}), 'position'),
            sameGroup: false,
        };
    }
    const group = homeGroup || awayGroup;
    return {
        homeRows: _.sortBy(_.filter(standings, {group}), 'position'),
        awayRows: [],
        sameGroup: true,
    };
}
