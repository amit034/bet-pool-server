'use strict';
import _ from 'lodash';

export function getParticipatesWithRank(participates) {
    if(_.isEmpty(participates)) {
        return [];
    }
    const sortedParticipates = _.orderBy(participates, ['score', 'medals.3', 'medals.2', 'medals.1'], ['desc', 'desc', 'desc', 'desc']);
    const first = _.first(sortedParticipates);
    const {participatesWithRank} = _.reduce(sortedParticipates, (agg, participate, idx) => {
        if (!_.isEqual(participate.medals, agg.medals)) {
            agg.rank = idx + 1;
            agg.medals = participate.medals;
        }
        agg.participatesWithRank.push(_.assign(participate, {rank: agg.rank}));
        return agg;
    }, {participatesWithRank: [], rank: 1, medals: first.medals});
    return participatesWithRank;
}

