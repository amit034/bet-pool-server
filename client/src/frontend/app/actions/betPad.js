
export const FOCUSED = 'FOCUSED';
export const UN_FOCUSED = 'UN_FOCUSED';
export function setFocused(betId, value, top, betFieldName) {
    return dispatch => {
        dispatch({
            type: FOCUSED,
            betId,
            value,
            top,
            betFieldName
        });
    };
}

export function clearFocused() {
    return dispatch => {
        dispatch({
            type: UN_FOCUSED
        });
    };
}


