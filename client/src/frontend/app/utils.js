'use strict';
import _ from 'lodash';

export function getUsersRanking(participates) {
    const [first, ...others] = _.orderBy(participates, ['score', 'medals.3', 'medals.2'], ['desc', 'desc', 'desc']);
    const {ranking} = _.reduce(others, (agg, participate) => {
        if (!_.isEqual(participate.medals, agg.medals)) {
            agg.pos++;
            agg.medals = participate.medals;
        }
        agg.ranking[participate.userId] = agg.pos;
        return agg;
    }, {ranking: {[first.userId]: 1}, pos: 1, medals: first.medals});
    return ranking;
}