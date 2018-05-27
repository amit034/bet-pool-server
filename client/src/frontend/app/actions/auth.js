import axios from 'axios';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

function requestLogin(creds) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
    creds
  }
}

function receiveLogin(user) {
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    user: user
  }
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    message
  }
}
export function authHeader() {

    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.apiAccessToken) {
        return { 'Authorization': 'Bearer ' + user.apiAccessToken };
    } else {
        return {};
    }
}
export function authError(err) {
    let action = {};
    if (err && err.response && err.response.status == 401){
        localStorage.removeItem('user');
        localStorage.removeItem('apiAccessToken');
        action = loginError(err.message);
    }
    return action;
}
export function getUserFromLocalStorage() {
    let currentUser;
    try{
        currentUser = JSON.parse(localStorage.getItem('user'));
    }catch (e) {
        currentUser = {}
    }
    return currentUser;
}
export function loginUser(creds) {

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(requestLogin(creds));

    return axios.post('http://localhost:3000/api/auth/login', creds)
      .then((response) => {
          const user = response.data;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('apiAccessToken', user.apiAccessToken);
          // Dispatch the success action
          dispatch(receiveLogin(user))
      }).catch((err) => {
          dispatch(loginError(err.message));
      });
  }
}

