'use strict';
import _ from 'lodash';

export function getParticipatesWithRank(participates) {
    if(_.isEmpty(participates)) {
        return [];
    }
    const sortedParticipates = _.orderBy(participates, ['score', 'medals.3', 'medals.2', 'medals.1'], ['desc', 'desc', 'desc', 'desc']);
    const first = _.first(_.filter(sortedParticipates, {isBot: false}));
    const {participatesWithRank} = _.reduce(sortedParticipates, (agg, participate) => {
        if (!agg.prvIsBot){
            agg.cnt++;
        }
        if (!_.isEqual(participate.medals, agg.medals) || agg.prvIsBot) {
            if (participate.isBot) {
                agg.rank = '-';
            } else {
                agg.rank = agg.cnt;
                agg.medals = participate.medals;
            }
        }
        agg.prvIsBot  = participate.isBot;
        agg.participatesWithRank.push(_.assign(participate, {rank: agg.rank}));
        return agg;
    }, {participatesWithRank: [], rank: 1, cnt: 0, prvIsBot: first.isBot, medals: first.medals});
    return participatesWithRank;
}

