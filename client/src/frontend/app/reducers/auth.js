import * as authActions from '../actions/auth'

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
function auth(state = {
    isFetching: false,
    isAuthenticated: localStorage.getItem('apiAccessToken') ? true : false
  }, action) {
  switch (action.type) {
    case authActions.LOGIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
        user: action.creds
      });
    case authActions.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: ''
      });
    case authActions.LOGIN_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message
      });
    case authActions.LOGOUT_SUCCESS:
          return Object.assign({}, state, {
            isFetching: false,
            isAuthenticated: false,
          });
    default:
      return state;
  }
}

export default auth;