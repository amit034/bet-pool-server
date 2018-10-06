import { combineReducers } from 'redux';
import auth from './auth';
import pools from './pools';
import betPad from './betPad';
import events from './events';
export default combineReducers({
    auth, pools, events, betPad
})