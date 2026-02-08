import * as actions from '../actions/events'
import update from "immutability-helper";
import _ from "lodash";
import * as poolActions from "../actions/pools";
import {GET_EVENTS_CHALLENGES_FAILURE} from "../actions/events";

function events(state = {
    isFetching: false,
    events: {},
    challenges: {}
  }, action) {
  switch (action.type) {
    case actions.GET_EVENTS_REQUEST:
      return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
    case actions.GET_EVENTS_SUCCESS:
      return update(state, { isFetching: { $set: false }, events: { $set: _.keyBy(action.events, 'eventId') }, errorMessage: { $set: null } });
    case actions.GET_EVENTS_FAILURE:
      return update(state, { isFetching: { $set: false }, events: { $set: [] }, errorMessage: { $set: action.message } });
    case actions.GET_EVENTS_CHALLENGES_REQUEST:
      return update(state, { isFetching: { $set: true }, errorMessage: { $set: null } });
    case actions.GET_EVENTS_CHALLENGES_SUCCESS:
      return update(state, {isFetching: {$set: false}, challenges: {$set:_.keyBy(action.challenges, 'challengeId')}, errorMessage: {$set: null}});
    case actions.GET_EVENTS_CHALLENGES_FAILURE:
      return update(state, { isFetching: { $set: false }, challenges: { $set: [] }, errorMessage: { $set: action.message } });
    default:
      return state;
  }
}

export default events;