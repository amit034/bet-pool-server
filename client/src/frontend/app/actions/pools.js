import axios from 'axios';
import _ from 'lodash';
import { history } from '../index';
import {authError, authHeader, getUserFromLocalStorage} from './auth';

export const GET_USER_POOLS_REQUEST = 'GET_USER_POOLS_REQUEST';
export const GET_USER_POOLS_SUCCESS = 'GET_USER_POOLS_SUCCESS';
export const GET_USER_POOLS_FAILURE = 'GET_USER_POOLS_FAILURE';
export const GET_POOL_GAMES_REQUEST = 'GET_POOL_GAMES_REQUEST';
export const GET_POOL_GAMES_SUCCESS = 'GET_POOL_GAMES_SUCCESS';
export const GET_POOL_GAMES_FAILURE = 'GET_POOL_GAMES_FAILURE';
export const GET_USER_BETS_REQUEST = 'GET_USER_BETS_REQUEST';
export const GET_USER_BETS_SUCCESS = 'GET_USER_BETS_SUCCESS';
export const UPDATE_USER_BET_REQUEST = 'UPDATE_USER_BET_REQUEST';
export const UPDATE_USER_BET_SUCCESS = 'UPDATE_USER_BET_SUCCESS';
export const UPDATE_USER_BET_FAILURE = 'UPDATE_USER_BET_FAILURE';
export const UPDATE_USER_BETS_REQUEST = 'UPDATE_USER_BET_REQUEST';
export const UPDATE_USER_BETS_SUCCESS = 'UPDATE_USER_BET_SUCCESS';
export const UPDATE_USER_BETS_FAILURE = 'UPDATE_USER_BET_FAILURE';
export const GET_USER_BETS_FAILURE = 'GET_POOL_GAMES_FAILURE';
export const GET_POOL_PARTICIPATES_REQUEST = 'GET_POOL_PARTICIPATES_REQUEST';
export const GET_POOL_PARTICIPATES_SUCCESS = 'GET_POOL_PARTICIPATES_SUCCESS';
export const JOIN_TO_POOL_SUCCESS = 'JOIN_TO_POOL_SUCCESS';
export const GET_CHALLENGE_PARTICIPATES_REQUEST = 'GET_CHALLENGE_PARTICIPATES_REQUEST';
export const GET_CHALLENGE_PARTICIPATES_SUCCESS = 'GET_CHALLENGE_PARTICIPATES_SUCCESS';
export const UPDATE_CHALLEGE_SUCCESS = 'UPDATE_CHALLEGE_SUCCESS';
export const CLEAR_GOAL_ANIMA = 'CLEAR_GOAL_ANIMA';
export const GET_POOL_GOALS_SUCCESS = 'GET_POOL_GOALS_SUCCESS';
export const GET_POOL_GOALS_FAILURE = 'GET_POOL_GOALS_FAILURE';
export const GET_POOL_PREVIEW_REQUEST = 'GET_POOL_PREVIEW_REQUEST';
export const GET_POOL_PREVIEW_SUCCESS = 'GET_POOL_PREVIEW_SUCCESS';
export const GET_POOL_PREVIEW_FAILURE = 'GET_POOL_PREVIEW_FAILURE';
export const CLEAR_POOL_PREVIEW = 'CLEAR_POOL_PREVIEW';


function requestUserPools(userId) {
    return {
        type: GET_USER_POOLS_REQUEST,
        isFetching: true,
        userId,
        pools: []
    };
}

export function clearGoalAnima(challengeId){
    return{
        type: CLEAR_GOAL_ANIMA,
        challengeId
    };
}

export function updateChallenge(challenge) {
    return {
        type: UPDATE_CHALLEGE_SUCCESS,
        isFetching: false,
        challenge
    };
}

function receiveUserPools(userId, pools) {
    return {
        type: GET_USER_POOLS_SUCCESS,
        isFetching: false,
        userId,
        pools
    };
}

function getUserPoolsFail(message) {
    return {
        type: GET_USER_POOLS_FAILURE,
        isFetching: false,
        pools: [],
        message
    };
}

function requestPoolGames(poolId) {
    return {
        type: GET_POOL_GAMES_REQUEST,
        isFetching: true,
        poolId,
        games: []
    };
}

function receivePoolGames(poolId, games) {
    return {
        type: GET_POOL_GAMES_SUCCESS,
        isFetching: false,
        poolId,
        games
    };
}

function getPoolGamesFail(poolId, message) {
    return {
        type: GET_POOL_GAMES_FAILURE,
        isFetching: false,
        poolId,
        games: [],
        message
    };
}

function requestUserBets(userId, poolId) {
    return {
        type: GET_USER_BETS_REQUEST,
        isFetching: true,
        poolId,
        userId,
        bets: []
    };
}

function receiveUserBets(userId, poolId, bets) {
    return {
        type: GET_USER_BETS_SUCCESS,
        isFetching: false,
        poolId,
        userId,
        bets: bets
    };
}

function getUserBetsFail(userId, poolId, message) {
    return {
        type: GET_USER_BETS_FAILURE,
        isFetching: false,
        poolId,
        userId,
        bets: [],
        message
    };
}

function postUserBets(userId, poolId) {
    return {
        type: UPDATE_USER_BETS_REQUEST,
        isFetching: true,
        poolId,
        userId
    };
}

function postUserBet(userId, poolId) {
    return {
        type: UPDATE_USER_BET_REQUEST,
        isFetching: true,
        poolId,
        userId
    };
}

function userBetsUpdated(userId, poolId, bets) {
    return {
        type: UPDATE_USER_BETS_SUCCESS,
        isFetching: false,
        bets,
        poolId,
        userId
    };
}

function userBetUpdated(userId, poolId, challengeId, bet) {
    return {
        type: UPDATE_USER_BET_SUCCESS,
        isFetching: false,
        poolId,
        userId,
        challengeId,
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
    };
}

function postUserBetFail(userId, poolId, message) {
    return {
        type: UPDATE_USER_BET_FAILURE,
        isFetching: false,
        poolId,
        userId,
        message
    };
}
function requestPoolParticipates(userId, poolId){
    return {
        type: GET_POOL_PARTICIPATES_REQUEST,
        isFetching: true,
        poolId,
        userId,
    };
}
function requestChallengeParticipates(userId, poolId){
    return {
           type: GET_CHALLENGE_PARTICIPATES_REQUEST,
           isFetching: true,
           poolId,
           userId,
       };
}
function receiveJoinToPool(userId, poolId, pool, participates) {
    return {
        type: JOIN_TO_POOL_SUCCESS,
        isFetching: false,
        afterJoin: true,
        poolId,
        pool,
        userId,
        participates: participates
    };
}
function receiveParticipates(userId, poolId, participates) {
    return {
        type: GET_POOL_PARTICIPATES_SUCCESS,
        isFetching: false,
        poolId,
        userId,
        participates: participates
    };
}

function receiveChallengeParticipates(poolId, {challenge, usersBets}) {
    return {
        type: GET_CHALLENGE_PARTICIPATES_SUCCESS,
        isFetching: false,
        poolId,
        challenge,
        usersBets
    };
}
export function getPoolGames(poolId, userId) {
    return dispatch => {
        userId = userId || getUserFromLocalStorage().userId;
        dispatch(requestPoolGames(poolId));

        return axios.get(`/api/${userId}/pools/${poolId}/games`, {headers: authHeader()})
            .then((response) => {
                const games = response.data;
                dispatch(receivePoolGames(poolId, games));
            }).catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                dispatch(getPoolGamesFail(err.message));
            });
    };
}

let userPoolsInflightKey = null;
let userPoolsInflightPromise = null;

function userPoolsRequestKey(qs) {
    const isActive = qs && qs.isActive != null ? String(qs.isActive) : 'true';
    const code = qs && qs.code != null ? String(qs.code) : '';
    return `${isActive}|${code}`;
}

export function getUserPools(qs) {
    const requestKey = userPoolsRequestKey(qs);

    return (dispatch) => {
        if (userPoolsInflightKey === requestKey && userPoolsInflightPromise) {
            return userPoolsInflightPromise;
        }

        const userId = getUserFromLocalStorage().userId;
        dispatch(requestUserPools(userId));
        userPoolsInflightKey = requestKey;
        userPoolsInflightPromise = axios
            .get(`/api/${userId}/pools`, {headers: authHeader(), params: qs})
            .then((response) => {
                dispatch(receiveUserPools(userId, response.data));
            })
            .catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                dispatch(getUserPoolsFail(err.message));
            })
            .finally(() => {
                if (userPoolsInflightKey === requestKey) {
                    userPoolsInflightKey = null;
                    userPoolsInflightPromise = null;
                }
            });

        return userPoolsInflightPromise;
    };
}

export function getUserBets(poolId, userId) {

    return dispatch => {
        userId = userId || getUserFromLocalStorage().userId;
        dispatch(requestUserBets(userId, poolId));
        return axios.get(`/api/${userId}/pools/${poolId}/bets`, {headers: authHeader()})
            .then((response) => {
                const bets = response.data;
                dispatch(receiveUserBets(userId, poolId, bets));
            }).catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                dispatch(getUserBetsFail(err.message));
            });
    };
}

export function updateUserBets(poolId, bets, userId) {
    return dispatch => {
        userId = userId || getUserFromLocalStorage().userId;
        dispatch(postUserBets(userId, poolId));
        return axios.post(`/api/${userId}/pools/${poolId}/bets`, bets, {headers: authHeader()})
            .then((response) => {
                const bets = response.data;
                dispatch(userBetsUpdated(userId, poolId, bets));
            }).catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                dispatch(postUserBetsFail(err.message));
            });
    };
}


export function updateUserBet(poolId, challengeId, bet, userId) {
    return dispatch => {
        userId = userId || getUserFromLocalStorage().userId;
       // dispatch(postUserBet(userId, poolId));
        return axios.post(`/api/${userId}/pools/${poolId}/challengeS/${challengeId}`, bet, {headers: authHeader()})
            .then((response) => {
                const bet = response.data;
                dispatch(userBetUpdated(userId, poolId, challengeId, bet));
            }).catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                dispatch(postUserBetFail(err.message));
            });
    };
}

function requestPoolPreview(poolId) {
    return {type: GET_POOL_PREVIEW_REQUEST, poolId};
}

function receivePoolPreview(poolId, preview) {
    return {type: GET_POOL_PREVIEW_SUCCESS, poolId, preview};
}

function poolPreviewFail(poolId, message) {
    return {type: GET_POOL_PREVIEW_FAILURE, poolId, message};
}

export function clearPoolPreview(poolId) {
    return {type: CLEAR_POOL_PREVIEW, poolId};
}

export function fetchPoolPreview(poolId, {joinCode, inviteToken} = {}) {
    return dispatch => {
        const userId = getUserFromLocalStorage().userId;
        dispatch(requestPoolPreview(poolId));
        const params = {};
        if (joinCode) {
            params.joinCode = joinCode;
        }
        if (inviteToken) {
            params.inviteToken = inviteToken;
        }
        return axios.get(`/api/${userId}/pools/${poolId}/preview`, {
            headers: authHeader(),
            params
        })
            .then((response) => {
                dispatch(receivePoolPreview(poolId, response.data));
                return response.data;
            })
            .catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                const msg = _.get(err, 'response.data.error', err.message);
                dispatch(poolPreviewFail(poolId, msg));
                return Promise.reject(err);
            });
    };
}

export function joinPool(poolId, {code} = {}) {
    return dispatch => {
        const userId = getUserFromLocalStorage().userId;
        const body = code ? {code} : {};
        return axios.post(`/api/${userId}/pools/${poolId}/join`, body, {headers: authHeader()})
            .then((response) => {
                const pool = response.data;
                const participates = pool.participates || [];
                dispatch(receiveJoinToPool(userId, poolId, pool, participates));
                return pool;
            })
            .catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                return Promise.reject(err);
            });
    };
}

export function invitePoolParticipants(poolId, body) {
    const userId = getUserFromLocalStorage().userId;
    return axios.post(`/api/${userId}/pools/${poolId}/invites`, body, {headers: authHeader()})
        .then((response) => response.data);
}

export function fetchPendingPoolInvites(poolId) {
    const userId = getUserFromLocalStorage().userId;
    return axios.get(`/api/${userId}/pools/${poolId}/invites/pending`, {headers: authHeader()})
        .then((response) => response.data);
}

export function getPoolParticipates(poolId) {
    return dispatch => {
        const userId = getUserFromLocalStorage().userId;
        dispatch(requestPoolParticipates(userId, poolId));
        return axios.get(`/api/${userId}/pools/${poolId}/participates`, {headers: authHeader()})
        .then((response) => {
            const participate = response.data;
            dispatch(receiveParticipates(userId, poolId, participate));
        }).catch((err) => {
            const authErr = authError(err);
            if (!_.isEmpty(authErr)){
                dispatch(authErr);
            }
        });
    };
}

function receivePoolGoals(poolId, entries) {
    return {type: GET_POOL_GOALS_SUCCESS, poolId, entries};
}

function getPoolGoalsFail(poolId, message) {
    return {type: GET_POOL_GOALS_FAILURE, poolId, message};
}

function normalisePoolGoalsPayload(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (typeof data === 'string' && /<\s*html[\s>]/i.test(data)) {
        return null;
    }
    return [];
}

export function getPoolGoals(poolId) {
    return dispatch => {
        const userId = getUserFromLocalStorage().userId;
        return axios.get(`/api/${userId}/pools/${poolId}/goals`, {headers: authHeader()})
            .then((response) => {
                const entries = normalisePoolGoalsPayload(response.data);
                if (entries === null) {
                    dispatch(getPoolGoalsFail(poolId,
                        'Goals request returned HTML instead of JSON (check API URL / dev proxy).'));
                    return;
                }
                dispatch(receivePoolGoals(poolId, entries));
            })
            .catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)) {
                    dispatch(authErr);
                }
                dispatch(getPoolGoalsFail(poolId, err.message));
            });
    };
}

export function getChallengeParticipates(poolId, challengeId, userId) {
    return dispatch => {
        userId = userId || getUserFromLocalStorage().userId;
        dispatch(requestChallengeParticipates(userId, poolId));
        return axios.get(`/api/${userId}/pools/${poolId}/challenges/${challengeId}`, {headers: authHeader()})
            .then((response) => {
                const {challenge, usersBets} = response.data;
                dispatch(receiveChallengeParticipates(poolId, {challenge, usersBets}));
            }).catch((err) => {
                const authErr = authError(err);
                if (!_.isEmpty(authErr)){
                    dispatch(authErr);
                }
            });
    };
}