'use strict';
import React, {useEffect, useCallback} from 'react';
import _ from 'lodash';
import {io} from "socket.io-client";
import {Route, useRouteMatch} from 'react-router-dom';
import {clearGoalAnima, getUserBets, updateChallenge, getPoolParticipates} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch, useSelector} from 'react-redux';
import GameList from './GameList/GameList';
import LeadersContainer from './LeadersContainer';
const socket = io();
const PoolContainer = (props) => {
    const dispatch = useDispatch();
    const match = useRouteMatch();
    const bets = useSelector(state => state.pools.bets);
    const betsRef = React.useRef(bets);
    React.useEffect(() => {
        betsRef.current = bets;
    });
    const poolId = match.params.id;
    const updateChallengeHandler = (challenge) => {
        dispatch(updateChallenge(challenge));
        const {id, score1, score2} = challenge;
        const prev = _.get(betsRef.current, id);
        if (prev) {
            const {score1: prevScore1, score2: prevScore2} = prev;
            if ((prevScore1 !==null && score1 > prevScore1) || (prevScore2 !==null && score2 > prevScore2)) {
                dispatch(clearGoalAnima(id));
            }
        }
    }
    useEffect(() => {
        dispatch(getUserBets(poolId));
        dispatch(getPoolParticipates(poolId));
        socket.emit('joinPool', poolId);
        const handler = (challenge) => {updateChallengeHandler(challenge)};
        socket.on('updateChallenge', handler);
        return () => {
            socket.off('updateChallenge', handler);
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