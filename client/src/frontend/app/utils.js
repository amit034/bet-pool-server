'use strict';
import _ from 'lodash';

export function getParticipatesWithRank(participates) {
    if (_.isEmpty(participates)) {
        return {};
    }
    const [first, ...others] = _.orderBy(participates, ['score', 'medals.3', 'medals.2', 'medals.1'], ['desc', 'desc', 'desc', 'desc']);
    const { participatesWithRank } = _.reduce(others, (agg, participate, idx) => {
        if (!_.isEqual(participate.medals, agg.medals)) {
            agg.rank = idx + 2;
            agg.medals = participate.medals;
        }
        agg.participatesWithRank.push(_.assign(participate, { rank: agg.rank }));
        return agg;
    }, { participatesWithRank: [_.assign({}, first, { rank: 1 })], rank: 1, medals: first.medals });
    return participatesWithRank;
}

export function getParticipatesWithRank1(participates) {
    if (_.isEmpty(participates)) {
        return {};
    }
    const [first, ...others] = _.orderBy(participates, ['score', 'medals.3', 'medals.2', 'medals.1'], ['desc', 'desc', 'desc', 'desc']);
    const { participatesWithRank } = _.reduce(others, (agg, participate) => {
        if (_.isEqual(participate.medals, agg.medals)) {
            agg.participatesWithRank.push(_.assign(participate, { rank: agg.rank }));
            agg.rank++;
        }
        else {
            agg.rank++;
            agg.medals = participate.medals;
            agg.participatesWithRank.push(_.assign(participate, { rank: agg.rank }));
        }
        return agg;

    }, { participatesWithRank: [_.assign({}, first, { rank: 1 })], rank: 1, medals: first.medals });
    return participatesWithRank;
}
