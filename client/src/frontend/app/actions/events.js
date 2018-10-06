import axios from 'axios';
import {authError, authHeader} from './auth'
export const GET_EVENTS_REQUEST = 'GET_EVENTS_REQUEST';
export const GET_EVENTS_SUCCESS = 'GET_EVENTS_SUCCESS';
export const GET_EVENTS_FAILURE = 'GET_EVENTS_FAILURE';

function requestEvents() {
  return {
    type: GET_EVENTS_REQUEST,
    isFetching: true,
    events: []
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

