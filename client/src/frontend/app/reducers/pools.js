import * as poolActions from '../actions/pools'
import _ from 'lodash';

function pools(state = {
    isFetching: false,
    pools: [],
    games: [],
    bets: [],
    participates: []
}, action) {
    switch (action.type) {
        case poolActions.GET_USER_POOLS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                pools: [],
                userId: action.userId
            });
        case poolActions.GET_USER_POOLS_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                pools: action.pools
            });
        case poolActions.GET_USER_POOLS_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                pools: [],
                errorMessage: action.message
            });
        case poolActions.GET_POOL_GAMES_REQUEST:
            return Object.assign({}, state, {
                isFetching: false,
                games: [],
                errorMessage: action.message
            });
        case poolActions.GET_USER_POOLS_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                games: action.games
            });
        case poolActions.GET_USER_BETS_REQUEST:
            return Object.assign({}, state, {
                isFetching: false,
                bets: [],
                errorMessage: action.message
            });
        case poolActions.GET_USER_BETS_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                bets: action.bets
            });
        case poolActions.GET_POOL_PARTICIPATES_SUCCESS:
            const poolId = action.poolId;
            const pool = _.find(state.pools, {_id: poolId});
            if (pool) {
                pool.participates = action.participates;
            }
            return Object.assign({}, state, {
                isFetching: false,
                pools: state.pools,
                participates: action.participates
            });
        case poolActions.UPDATE_USER_BET_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
            });
        case poolActions.UPDATE_USER_BET_SUCCESS:
            const updated = action.bet;
            const userBets = state.bets;
            const bet = _.find(userBets, (storeBet) => storeBet._id === updated._id);
            if (bet){
                bet.score1 = updated.score1;
                bet.score2 = updated.score2;
            }
            return Object.assign({}, state, {
                isFetching: false,
                bets: userBets
            });
        case poolActions.UPDATE_USER_BET_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
            });
        case poolActions.UPDATE_USER_BETS_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
            });
        case poolActions.UPDATE_USER_BETS_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
            });
        case poolActions.UPDATE_USER_BETS_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
            });
        default:
            return state;
    }
}

export default pools;