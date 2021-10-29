'use strict';
import _ from 'lodash';

export function getParticipatesWithRank(participates) {
    if(_.isEmpty(participates)) {
        return {};
    }
    const [first, ...others] = _.orderBy(participates, ['score', 'medals.3', 'medals.2', 'medals.1'], ['desc', 'desc', 'desc', 'desc']);
    const {participatesWithRank} = _.reduce(others, (agg, participate) => {
        if (!_.isEqual(participate.medals, agg.medals)) {
            agg.rank++;
            agg.medals = participate.medals;
        }
        agg.participatesWithRank.push(_.assign(participate, {rank: agg.rank}));
        return agg;
    }, {participatesWithRank: [_.assign({}, first, {rank: 1})], rank: 1, medals: first.medals});
    return participatesWithRank;
}