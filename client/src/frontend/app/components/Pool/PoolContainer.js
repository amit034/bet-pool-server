'use strict';
import React, {useEffect} from 'react';
import _ from 'lodash';
import {io} from "socket.io-client";
import {Route, useRouteMatch} from 'react-router-dom';
import {clearGoalAnima, getUserBets, updateChallenge} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch, useSelector} from 'react-redux';
import GameList from './GameList/GameList';
import LeadersContainer from './LeadersContainer';
const PoolContainer = (props) => {
    const dispatch = useDispatch();
    const match = useRouteMatch();
    const bets = useSelector(state => state.pools.bets);
    const poolId = match.params.id;

    const updateChallengeInPool = (challenge)=>{
        dispatch(updateChallenge(challenge));
        const {challengeId, score1, score2} = challenge;
        const prev = _.find(bets, challengeId);
        if (prev) {
            const {score1: prevScore1, score2: prevScore2} = prev;
            if ((prevScore1 !==null && score1 > prevScore1) || (prevScore2 !==null && score2 > prevScore2)) {
                setTimeout(() => {
                    clearGoalAnima(challengeId);
                }, 3000);
            }
        }
    };
    useEffect(() => {
        const socket = io();
        socket.on('updateChallenge', updateChallengeInPool);
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