import { combineReducers } from 'redux';
import auth from './auth';
import pools from './pools';
import events from './events';
export default combineReducers({
    auth, pools, events
})