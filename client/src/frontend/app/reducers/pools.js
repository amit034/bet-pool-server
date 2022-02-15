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
            const {id: challengeId, score1, score2, status} = action.challenge;
            const bet = _.cloneDeep(_.get(state.bets, challengeId));
            if (bet) {
                const {score1: prevScore1, score2: prevScore2} = bet.challenge;
                let side = null;
                if (prevScore1 !== score1 && score1 > 0) {
                    side = 'homeTeam';
                }
                if (prevScore2 !== score2 && score2 > 0) {
                    side = 'awayTeam';
                }
                bet.challenge = _.assign({}, bet.challenge , {score1, score2, status});
                return update(state, {
                    isFetching: {$set: false},
                    goals: side !== null ? {$merge: {[challengeId]: side}} :  {$unset: [challengeId]} ,
                    bets: {$merge: {[challengeId]: bet}},
                    errorMessage: {$set: null}
                });
            }
            return update(state, {isFetching: {$set: false}, errorMessage: {$set: null}});
        }
        case poolActions.CLEAR_GOAL_ANIMA: {
            const clearId = action.challengeId;
            return update(state , {goals:{$unset: [clearId]}});
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
            return update(state, {
                isFetching: { $set: false },
                bets: { $merge: { [action.challengeId]: action.bet } },
                errorMessage: { $set: null } });
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