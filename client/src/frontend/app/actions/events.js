import axios from 'axios';
import {authError, authHeader} from './auth'
export const GET_EVENTS_REQUEST = 'GET_EVENTS_REQUEST';
export const GET_EVENTS_SUCCESS = 'GET_EVENTS_SUCCESS';
export const GET_EVENTS_FAILURE = 'GET_EVENTS_FAILURE';
export const GET_EVENTS_CHALLENGES_REQUEST = 'GET_EVENTS_CHALLENGES_REQUEST';
export const GET_EVENTS_CHALLENGES_SUCCESS = 'GET_EVENTS_CHALLENGES_SUCCESS';
export const GET_EVENTS_CHALLENGES_FAILURE = 'GET_EVENTS_CHALLENGES_FAILURE';
function requestEvents() {
  return {
    type: GET_EVENTS_REQUEST,
    isFetching: true,
    events: []
  }
}

function requestEventsChallenges() {
  return {
    type: GET_EVENTS_CHALLENGES_REQUEST,
    isFetching: true,
    challenges: []
  }
}
function receiveEventsChallenges() {
    return {
        type: GET_EVENTS_CHALLENGES_SUCCESS,
        isFetching: true,
        challenges: []
    }
}
function getEventsChallengesFail(message) {
    return {
        type: GET_EVENTS_CHALLENGES_FAILURE,
        isFetching: false,
        challenges: [],
        message
    }
}
function receiveEvents(events) {
  return {
    type: GET_EVENTS_SUCCESS,
    isFetching: false,
    events
  }
}

function getEventsFail(message) {
  return {
    type: GET_EVENTS_FAILURE,
    isFetching: false,
    events: [],
    message
  }
}

export function getEvents() {
  return dispatch => {
    dispatch(requestEvents());
    return axios.get(`/api/admin/events`, {headers: authHeader()})
      .then((response) => {
          const events = response.data;
          dispatch(receiveEvents(events))
      }).catch((err) => {
          const authErr = authError(err);
          if (authErr) dispatch(authErr);
          dispatch(getEventsFail(err.message));
      });
  }
}
export function getChallenges(eventId) {
  return dispatch => {
    dispatch(requestEventsChallenges());
    return axios.get(`/api/admin/events/${eventId}/challenges`, {headers: authHeader()})
        .then((response) => {
          const challenges = response.data;
          dispatch(receiveEventsChallenges(challenges))
        }).catch((err) => {
          const authErr = authError(err);
          if (authErr) dispatch(authErr);
          dispatch(getEventsChallengesFail(err.message));
        });
  }
}

