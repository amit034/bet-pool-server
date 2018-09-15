import axios from 'axios';
import _ from 'lodash';
import {authError, authHeader, getUserFromLocalStorage} from './auth'

export const GET_USER_POOLS_REQUEST = 'GET_USER_POOLS_REQUEST';
export const GET_USER_POOLS_SUCCESS = 'GET_USER_POOLS_SUCCESS';
export const GET_USER_POOLS_FAILURE = 'GET_USER_POOLS_FAILURE';
export const GET_POOL_GAMES_REQUEST = 'GET_POOL_GAMES_REQUEST';
export const GET_POOL_GAMES_SUCCESS = 'GET_POOL_GAMES_SUCCESS';
export const GET_POOL_GAMES_FAILURE = 'GET_POOL_GAMES_FAILURE';
export const GET_USER_BETS_REQUEST = 'GET_POOL_GAMES_REQUEST';
export const GET_USER_BETS_SUCCESS = 'GET_POOL_GAMES_SUCCESS';
export const UPDATE_USER_BET_REQUEST = 'UPDATE_USER_BET_REQUEST';
export const UPDATE_USER_BET_SUCCESS = 'UPDATE_USER_BET_SUCCESS';
export const UPDATE_USER_BET_FAILURE = 'UPDATE_USER_BET_FAILURE';
export const UPDATE_USER_BETS_REQUEST = 'UPDATE_USER_BET_REQUEST';
export const UPDATE_USER_BETS_SUCCESS = 'UPDATE_USER_BET_SUCCESS';
export const UPDATE_USER_BETS_FAILURE = 'UPDATE_USER_BET_FAILURE';
export const GET_USER_BETS_FAILURE = 'GET_POOL_GAMES_FAILURE';
export const GET_POOL_PARTICIPATES_SUCCESS = 'GET_POOL_PARTICIPATES_SUCCESS';

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

function requestPoolGames(poolId) {
  return {
    type: GET_POOL_GAMES_REQUEST,
    isFetching: true,
    poolId,
    games: []
  }
}

function receivePoolGames(poolId, games) {
  return {
    type: GET_POOL_GAMES_SUCCESS,
    isFetching: false,
      poolId,
      games
  }
}

function getPoolGamesFail(poolId, message) {
  return {
    type: GET_POOL_GAMES_FAILURE,
    isFetching: false,
    poolId,
    games: [],
    message
  }
}

function requestUserBets(userId, poolId) {
  return {
    type: GET_POOL_GAMES_REQUEST,
    isFetching: true,
    poolId,
    userId,
    bets: []
  }
}

function receiveUserBets(userId, poolId, bets) {
  return {
    type: GET_POOL_GAMES_SUCCESS,
    isFetching: false,
  poolId,
  userId,
  bets: bets
  }
}

function getUserBetsFail(userId, poolId, message) {
  return {
    type: GET_POOL_GAMES_FAILURE,
    isFetching: false,
      poolId,
      userId,
      bets: [],
    message
  }
}

function postUserBets(userId, poolId) {
  return {
    type: UPDATE_USER_BETS_REQUEST,
    isFetching: true,
    poolId,
    userId
  }
}
function postUserBet(userId, poolId) {
  return {
    type: UPDATE_USER_BET_REQUEST,
    isFetching: true,
    poolId,
    userId
  }
}

function userBetsUpdated(userId, poolId, bets) {
  return {
    type: UPDATE_USER_BETS_SUCCESS,
    isFetching: false,
  poolId,
  userId
  }
}
function userBetUpdated(userId, poolId, bet) {
    return {
        type: UPDATE_USER_BET_SUCCESS,
        isFetching: false,
        poolId,
        userId,
        bet
      };
}
function postUserBetsFail(userId, poolId, message) {
  return {
    type: UPDATE_USER_BETS_FAILURE,
    isFetching: false,
      poolId,
      userId,
    message
  }
}
function postUserBetFail(userId, poolId, message){
    return {
        type: UPDATE_USER_BET_FAILURE,
        isFetching: false,
        poolId,
        userId,
        message
      }
}
function receiveParticipates(userId, poolId, participates) {
    return {
        type: GET_POOL_PARTICIPATES_SUCCESS,
        isFetching: false,
        poolId,
        userId,
        participates: participates
    }
}
export function getPoolGames(poolId, userId){
    return dispatch => {
        userId = userId || getUserFromLocalStorage().userId;
        dispatch(requestPoolGames(poolId));

        return axios.get(`http://localhost:3000/api/${userId}/pools/${poolId}/games`, {headers: authHeader()})
          .then((response) => {
              const games = response.data;
              dispatch(receivePoolGames(poolId, games))
          }).catch((err) => {
              const authErr = authError(err);
              if (authErr) dispatch(authErr);
              dispatch(getPoolGamesFail(err.message));
          });
      }
}
export function getUserPools(userId) {

  return dispatch => {
    userId = userId || getUserFromLocalStorage().userId;
    dispatch(requestUserPools(userId));
    return axios.get(`http://localhost:3000/api/${userId}/pools`, {headers: authHeader()})
      .then((response) => {
          const pools = response.data;
          dispatch(receiveUserPools(userId, pools))
      }).catch((err) => {
          const authErr = authError(err);
          if (authErr) dispatch(authErr);
          dispatch(getUserPoolsFail(err.message));
      });
  }
}

export function getUserBets(poolId, userId) {

  return dispatch => {
    userId = userId || getUserFromLocalStorage().userId;
    dispatch(requestUserBets(userId, poolId));
    return axios.get(`http://localhost:3000/api/${userId}/pools/${poolId}/bets`, {headers: authHeader()})
      .then((response) => {
          const bets = response.data;
          dispatch(receiveUserBets(userId, poolId, bets))
      }).catch((err) => {
          const authErr = authError(err);
          if (authErr) dispatch(authErr);
          dispatch(getUserBetsFail(err.message));
      });
  }
}

export function updateUserBets(poolId, bets, userId){
    return dispatch => {
       userId = userId || getUserFromLocalStorage().userId;
       dispatch(postUserBets(userId, poolId));
       return axios.post(`http://localhost:3000/api/${userId}/pools/${poolId}/bets`, bets, {headers: authHeader()})
         .then((response) => {
             const bets = response.data;
             dispatch(userBetsUpdated(userId, poolId, bets))
         }).catch((err) => {
             const authErr = authError(err);
             if (authErr) dispatch(authErr);
             dispatch(postUserBetsFail(err.message));
         });
     }
}


export function updateUserBet(poolId, bet, userId){
    return dispatch => {
       userId = userId || getUserFromLocalStorage().userId;
       const challengeId = _.get(bet , 'challenge._id');
       dispatch(postUserBet(userId, poolId));
       return axios.post(`http://localhost:3000/api/${userId}/pools/${poolId}/challengeS/${challengeId}`, bet, {headers: authHeader()})
         .then((response) => {
             const bet = response.data;
             dispatch(userBetUpdated(userId, poolId, bet))
         }).catch((err) => {
             const authErr = authError(err);
             if (authErr) dispatch(authErr);
             dispatch(postUserBetFail(err.message));
         });
     }
}

export function joinPool(poolId) {
    return dispatch => {
           const userId = getUserFromLocalStorage().userId;
           return axios.post(`http://localhost:3000/api/${userId}/pools/${poolId}/join`,null, {headers: authHeader()})
             .then((response) => {
                 const participate = response.data;
                 dispatch(receiveParticipates(userId, poolId, participate))
             }).catch((err) => {
                 const authErr = authError(err);
                 if (authErr) dispatch(authErr);
             });
         }
}

export function getPoolParticipates(poolId, userId) {
    return dispatch => {
           userId = userId || getUserFromLocalStorage().userId;
           return axios.get(`http://localhost:3000/api/${userId}/pools/${poolId}/participates`, {headers: authHeader()})
             .then((response) => {
                 const participate = response.data;
                 dispatch(receiveParticipates(userId, poolId, participate))
             }).catch((err) => {
                 const authErr = authError(err);
                 if (authErr) dispatch(authErr);
             });
         }
}