import * as poolActions from '../actions/pools'

function pools(state = {
    isFetching: false,
    pools:[]
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
    case poolActions.LOGIN_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        pools: [],
        errorMessage: action.message
      });
    default:
      return state;
  }
}

export default pools;