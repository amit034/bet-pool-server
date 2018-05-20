import { combineReducers } from 'redux';
import auth from './auth';
import pools from './pools';
export default combineReducers({
    auth, pools
})