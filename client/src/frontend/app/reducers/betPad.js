import * as betPadActions from '../actions/betPad'

function betPad(state = {
}, action) {
    switch (action.type) {
        case betPadActions.FOCUSED:
            return Object.assign({}, state, {
                betId: action.betId,
                value: action.value,
                top: action.top,
                betFieldName: action.betFieldName
            });
        case betPadActions.UN_FOCUSED:
        return Object.assign({}, state, {
        });
        default:
            return state;
    }
}

export default betPad;