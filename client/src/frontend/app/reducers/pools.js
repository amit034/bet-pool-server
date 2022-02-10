import * as poolActions from '../actions/pools';
import _ from 'lodash';
import update from 'immutability-helper';

function pools(state = {
    isFetching: false,
    afterJoin: false,
    pools: {},
    otherBets: {},
    games: {},
    bets: {},
    participates: {},
    goals: {}
}, action) {
    switch (action.type) {
        case poolActions.GET_USER_POOLS_REQUEST:
            return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
        case poolActions.GET_USER_POOLS_SUCCESS:
            return update(state, { isFetching: { $set: false }, pools: { $set: _.keyBy(action.pools, 'poolId') }, errorMessage: { $set: null } });
        case poolActions.GET_USER_POOLS_FAILURE:
            return update(state, { isFetching: { $set: false }, pools: { $set: [] }, errorMessage: { $set: action.message } });
        case poolActions.GET_POOL_GAMES_REQUEST:
            return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
        case poolActions.GET_POOL_GAMES_SUCCESS:
            return update(state, {isFetching: {$set: false}, games: {$set:_.keyBy(action.games, 'id')}, errorMessage: {$set: null}});
        case poolActions.UPDATE_CHALLEGE_SUCCESS: {
            const challengeId = action.challenge.id;
            const bet = _.cloneDeep(_.get(state.bets, challengeId));
            if (bet) {
                bet.challenge = action.challenge;
                return update(state, {
                    isFetching: {$set: false},
                    goals: {$merge: {[challengeId]: challengeId}},
                    bets: {$merge: {[challengeId]: bet}},
                    errorMessage: {$set: null}
                });
            }
            return update(state, {isFetching: {$set: false}, errorMessage: {$set: null}});
        }
        case poolActions.CLEAR_GOAL_ANIMA:{
            const challengeId = action.challengeId;
            return update(state , {goals:{$splice: challengeId}});
        }
        case poolActions.GET_USER_BETS_REQUEST:
            return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
        case poolActions.GET_USER_BETS_SUCCESS:
            return update(state, { isFetching: { $set: false }, bets: { $set: _.keyBy(action.bets, 'challenge.id') }, errorMessage: { $set: null } });
        case poolActions.GET_POOL_PARTICIPATES_REQUEST:
            return update(state, { isFetching: { $set: true }, otherBets: { $set: {} }, errorMessage: { $set: null } });
        case poolActions.GET_CHALLENGE_PARTICIPATES_REQUEST:
            return update(state, { isFetching: { $set: true }, otherBets: { $set: {} }, errorMessage: { $set: null } });
        case poolActions.GET_POOL_PARTICIPATES_SUCCESS:
            return update(state, { isFetching: { $set: false }, participates: { $set: action.participates }, errorMessage: { $set: null } });
        case poolActions.JOIN_TO_POOL_SUCCESS:
            return update(state, { isFetching: { $set: false }, afterJoin: { $set: true }, pools: { $merge: { [action.poolId]: action.pool } }, participates: { $set: action.participates }, errorMessage: { $set: null } });
        case poolActions.GET_CHALLENGE_PARTICIPATES_SUCCESS:
            return update(state, { isFetching: { $set: false }, otherBets: { $merge: { challenge: action.challenge, usersBets: action.usersBets } }, errorMessage: { $set: null } });
        case poolActions.UPDATE_USER_BET_REQUEST:
            return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
        case poolActions.UPDATE_USER_BET_SUCCESS:
            return update(state, { isFetching: { $set: false }, bets: { $merge: { [action.challengeId]: action.bet } }, errorMessage: { $set: null } });
        // return update(state, {isFetching: {$set: false}, bets: {$apply: (bets) => bets.map((bet) => {
        //     if (bet.id === action.bet.id) {
        //         bet.score1 = action.score1;
        //         bet.score2 = action.score2;
        //     }
        //     return bet;
        // })}, errorMessage: {$set: null}});
        case poolActions.UPDATE_USER_BET_FAILURE:
            return update(state, { isFetching: { $set: false }, errorMessage: { $set: action.message } });
        case poolActions.UPDATE_USER_BETS_REQUEST:
            return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
        case poolActions.UPDATE_USER_BETS_SUCCESS:
            return update(state, {isFetching: {$set: false, bets: {$set: action.bets}, errorMessage: {$set: null}}});
        case poolActions.UPDATE_USER_BETS_FAILURE:
            return update(state, { isFetching: { $set: false }, errorMessage: { $set: action.message } });
        default:
            return state;
    }
}

export default pools;