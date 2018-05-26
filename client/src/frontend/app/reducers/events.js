import * as actions from '../actions/events'

function events(state = {
    isFetching: false,
    events:[]
  }, action) {
  switch (action.type) {
    case actions.GET_EVENTS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        events: []
      });
    case actions.GET_EVENTS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        events: action.events
      });
    case actions.GET_EVENTS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        events: [],
        errorMessage: action.message
      });
    default:
      return state;
  }
}

export default events;