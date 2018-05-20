import axios from 'axios';
import {authHeader} from './auth'
export const GET_USER_POOLS_REQUEST = 'GET_USER_POOLS_REQUEST';
export const GET_USER_POOLS_SUCCESS = 'GET_USER_POOLS_SUCCESS';
export const GET_USER_POOLS_FAILURE = 'GET_USER_POOLS_FAILURE';

function requestUserPools(userId) {
  return {
    type: GET_USER_POOLS_REQUEST,
    isFetching: true,
    userId,
    pools: []
  }
}

function receiveUserPools(userId, pools) {
  return {
    type: GET_USER_POOLS_SUCCESS,
    isFetching: false,
      userId,
      pools
  }
}

function getUserPoolsFail(message) {
  return {
    type: GET_USER_POOLS_FAILURE,
    isFetching: false,
    pools: [],
    message
  }
}

export function getUserPools(userId) {

  return dispatch => {
    let currentUser;
    try{
        currentUser = JSON.parse(localStorage.getItem('user'));
    }catch (e) {
        currentUser = {}
    }

    userId = userId || currentUser.userId;
    dispatch(requestUserPools(userId));

    return axios.get(`http://localhost:3000/api/${userId}/pools`, {headers: authHeader()})
      .then((response) => {
          const pools = response.data;
          dispatch(receiveUserPools(userId, pools))
      }).catch((err) => {
          dispatch(getUserPoolsFail(err.message));
      });
  }
}

