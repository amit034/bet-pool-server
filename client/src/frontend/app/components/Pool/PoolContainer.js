'use strict';
import React, {useEffect} from 'react';
import _ from 'lodash';
import {io} from "socket.io-client";
import {useHistory, Route, useRouteMatch} from 'react-router-dom';
import {getPoolParticipates, getUserBets, updateChallenge, updateUserBet} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch, useSelector} from 'react-redux';
import GameList from './GameList/GameList';
import LeadersContainer from './LeadersContainer';
const PoolContainer = (props) => {
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
       // dispatch(getPoolParticipates(poolId));
        socket.emit('joinPool', poolId);
        return () => {
            socket.emit('leavePool', poolId);
        };
    }, []);

    return (<div id="content" className="ui container">
             <Route exact path={`${props.match.path}/participates`} component={LeadersContainer}/>
             <Route exact path={`${props.match.path}/`} component={() => <GameList poolId={poolId}/>}/>
            <NavigationMenu/>
            </div>);
}
export default PoolContainer;