'use strict';
import React, {useEffect} from 'react';
import _ from 'lodash';
import {useHistory} from 'react-router-dom';
import  {getUserBets, updateUserBet} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch} from 'react-redux';
import GameList from './GameList/GameList';

const PoolContainer = (props) => {
    const dispatch = useDispatch();
    let history = useHistory();
    useEffect(() => {
        const {match, socket} = props;
        const poolId = match.params.id;
        dispatch(getUserBets(poolId));
        socket.emit('joinPool', poolId);
        return () => {
            const {match, socket} = props;
            const poolId = match.params.id;
            socket.emit('leavePool', poolId);
        };
    }, [dispatch]);

    function onBetKetChange(challengeId, key, value) {
        const bet = _.get(props.bets, challengeId);
        _.set(bet, key, value);
        dispatch(updateUserBet(props.match.params.id, challengeId, bet));
    }

    function onBetChange(challengeId, updatedBet) {
        const bet = _.get(props.bets, challengeId);
        _.assign(bet, _.pick(updatedBet, ['score1', 'score2']));
        dispatch(updateUserBet(props.match.params.id, challengeId, bet));
    }

    function onShowOthers(challengeId) {
        history.push(`/pools/${props.match.params.id}/challenges/${challengeId}/participates`);
    }

    return (<div id="content" className="ui container">
                <GameList poolId={props.match.params.id} onBetChange={onBetChange}
                          onBetKeyChange={onBetKetChange}
                          onShowOthers={onShowOthers} />
                <NavigationMenu/>
            </div>);
}
export default PoolContainer;