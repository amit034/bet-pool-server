import * as poolActions from '../actions/pools'
import _ from 'lodash';
import update from 'immutability-helper';

function pools(state = {
    isFetching: false,
    pools: {},
    games: {},
    bets: {},
    participates: {}
}, action) {
    switch (action.type) {
        case poolActions.GET_USER_POOLS_REQUEST:
            return update(state, {isFetching: {$set: true}, errorMessage: {$set: null}});
        case poolActions.GET_USER_POOLS_SUCCESS:
            return update(state, {isFetching: {$set: false},  pools: {$set: _.keyBy(action.pools, '_id')}, errorMessage: {$set: null}});
        case poolActions.GET_USER_POOLS_FAILURE:
            return update(state, {isFetching: {$set: false}, pools: {$set: []}, errorMessage: {$set: action.message}});
        case poolActions.GET_POOL_GAMES_REQUEST:
            return update(state, {isFetching: {$set: true}, errorMessage: {$set: null}});
        case poolActions.GET_POOL_GAMES_SUCCESS:
            return update(state, {isFetching: {$set: false}, games: {$set:_.keyBy(action.games, '_id')}, errorMessage: {$set: null}});
        case poolActions.GET_USER_BETS_REQUEST:
            return update(state, {isFetching: {$set: true}, errorMessage: {$set: null}});
        case poolActions.GET_USER_BETS_SUCCESS:
            return update(state, {isFetching: {$set: false}, bets: {$set: _.keyBy(action.bets, 'challenge._id')}, errorMessage: {$set: null}});
        case poolActions.GET_POOL_PARTICIPATES_SUCCESS:
            // return update(state, {isFetching: {$set: false}, pools: {$apply: (pools) => pools.map((pool) => {
            //     if (pool._id === action.poolId) {
            //         pool.participates = action.participates
            //     }
            //     return pool;
            // })}, participates: {$set: action.participates}, errorMessage: {$set: null}});
            return update(state, {isFetching: {$set: false}, pools: {$merge: {[action.poolId]: action.pool}},participates: {$set: action.participates}, errorMessage: {$set: null}});
        case poolActions.UPDATE_USER_BET_REQUEST:
            return update(state, {isFetching: {$set: true}, errorMessage: {$set: null}});
        case poolActions.UPDATE_USER_BET_SUCCESS:
            return update(state, {isFetching: {$set: false}, bets: {$merge: {[action.challengeId]: action.bet}}, errorMessage: {$set: null}});
            // return update(state, {isFetching: {$set: false}, bets: {$apply: (bets) => bets.map((bet) => {
            //     if (bet._id === action.bet._id) {
            //         bet.score1 = action.score1;
            //         bet.score2 = action.score2;
            //     }
            //     return bet;
            // })}, errorMessage: {$set: null}});
        case poolActions.UPDATE_USER_BET_FAILURE:
            return update(state, {isFetching: {$set: false}, errorMessage: {$set: action.message}});
        case poolActions.UPDATE_USER_BETS_REQUEST:
            return update(state, {isFetching: {$set: true}, errorMessage: {$set: null}});
        case poolActions.UPDATE_USER_BETS_SUCCESS:
            return update(state, {isFetching: {$set: false,  bets: {$set: action.bets}, errorMessage: {$set: null}}});
        case poolActions.UPDATE_USER_BETS_FAILURE:
            return update(state, {isFetching: {$set: false}, errorMessage: {$set: action.message}});
        default:
            return state;
    }
}

export default pools;