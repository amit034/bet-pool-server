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
export function registerUser(creds) {

  return dispatch => {
    if(creds.password != creds.password2){
        dispatch(loginError( "password not match"));
    }
    dispatch(requestLogin(creds));

    return axios.post('http://localhost:3000/api/auth/register', creds)
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
export function verifyFacebookToken(response) {
    return dispatch => {
        axios.post('http://localhost:3000/api/auth/facebook', {access_token: response.accessToken, appName:'betPool'},{
                        headers: {
                            'Content-Type': 'application/json',
                        }
        }).then(r => {
            const user = r.data;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('apiAccessToken', user.apiAccessToken);
            // Dispatch the success action
            dispatch(receiveLogin(user))
        }).catch((err) => {
          dispatch(loginError(err.message));
        });
    }
}

export function verifyGoogleToken(response) {
    return dispatch => {
       // const tokenBlob = new Blob([JSON.stringify({access_token: response.accessToken}, null, 2)], {type : 'application/json'});
       // const options = {
       //     method: 'POST',
       //     body: tokenBlob,
       //     mode: 'cors',
       //     cache: 'default'
       // };
        axios.post('http://localhost:3000/api/auth/google',{access_token: response.accessToken, appName:'betPool'},{
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then(r => {
            const user = r.data;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('apiAccessToken', user.apiAccessToken);
            dispatch(receiveLogin(user))
        }).catch((err) => {
          dispatch(loginError(err.message));
        });
    }
}

export function registerWithFacebookToken(response){
    return dispatch => {
           axios.post('http://localhost:3000/api/auth/register/facebook',{access_token: response.accessToken, appName:'betPool'},{
                   headers: {
                       'Content-Type': 'application/json',
                   }
               }).then(r => {
               const user = r.data;
               localStorage.setItem('user', JSON.stringify(user));
               localStorage.setItem('apiAccessToken', user.apiAccessToken);
               dispatch(receiveLogin(user))
           }).catch((err) => {
             dispatch(loginError(err.message));
           });
       }
}


export function registerWithGoogleToken(response){
    return dispatch => {
           axios.post('http://localhost:3000/api/auth/register/google',{access_token: response.accessToken, appName:'betPool'},{
                   headers: {
                       'Content-Type': 'application/json',
                   }
               }).then(r => {
               const user = r.data;
               localStorage.setItem('user', JSON.stringify(user));
               localStorage.setItem('apiAccessToken', user.apiAccessToken);
               dispatch(receiveLogin(user))
           }).catch((err) => {
             dispatch(loginError(err.message));
           });
       }
}
