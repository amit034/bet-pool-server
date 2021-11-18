'use strict';
import React, {useEffect} from 'react';
import _ from 'lodash';
import {io} from "socket.io-client";
import {useHistory, Route, useRouteMatch} from 'react-router-dom';
import {getPoolParticipates, getUserBets, updateChallenge, updateUserBet} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch} from 'react-redux';
import GameList from './GameList/GameList';
import LeadersContainer from './LeadersContainer';
const PoolContainer = (props) => {
    //const bets = useSelector(state => state.pools.bets);
    const dispatch = useDispatch();
    let history = useHistory();
    const match = useRouteMatch();
    const poolId = match.params.id;

    useEffect(() => {
        const socket = io();
        socket.on('updateChallenge',(challenge)=>{
            dispatch(updateChallenge(challenge));
        });
        dispatch(getUserBets(poolId));
        dispatch(getPoolParticipates(poolId));
        socket.emit('joinPool', poolId);
        return () => {
            socket.emit('leavePool', poolId);
        };
    }, []);

    function onBetKeyChange(bet, challengeId, key, value) {
        _.set(bet, key, value);
        // _.set(bet, "score2" , 2);
        dispatch(updateUserBet(props.match.params.id, challengeId, bet));
    }

    function onBetChange(bet, updatedBet) {
        const match = props.match;
        _.assign(bet, _.pick(updatedBet, ['score1', 'score2']));
        dispatch(updateUserBet(match.params.id, challengeId, bet));
    }
    function onShowOthers(challengeId) {
        history.push(`/pools/${match.params.id}/challenges/${challengeId}/participates`);
    }

    return (<div id="content" className="ui container">
             <Route exact path={`${props.match.path}/participates`} component={LeadersContainer}/>
             <Route exact path={`${props.match.path}/`} component={() => <GameList poolId={poolId} onBetKeyChange={onBetKeyChange} onBetChange={onBetChange} onShowOthers={onShowOthers} />}/>
            <NavigationMenu/>
            </div>);
}
export default PoolContainer;