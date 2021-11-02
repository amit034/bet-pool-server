'use strict';
import React, {useEffect} from 'react';
import _ from 'lodash';
import {useHistory, Route, useRouteMatch} from 'react-router-dom';
import  {getUserBets, updateUserBet} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch, useSelector} from 'react-redux';
import GameList from './GameList/GameList';
import LeadersContainer from './LeadersContainer';
const PoolContainer = (props) => {
    const bets = useSelector(state => state.pools.bets);
    const dispatch = useDispatch();
    let history = useHistory();
    const {url} = useRouteMatch();
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
        const bet = _.get(bets, challengeId);
        _.set(bet, key, value);
        dispatch(updateUserBet(props.match.params.id, challengeId, bet));
    }

    function onBetChange(challengeId, updatedBet) {
        const bet = _.get(bets, challengeId);
        const match = props.match;
        _.assign(bet, _.pick(updatedBet, ['score1', 'score2']));
        dispatch(updateUserBet(match.params.id, challengeId, bet));
    }
    function onShowOthers(challengeId) {
        history.push(`/pools/${match.params.id}/challenges/${challengeId}/participates`);
    }

    return (<div id="content" className="ui container">
             <Route path={`${props.match.path}/participates`} component={LeadersContainer}/>
            <Route path={`${props.match.path}`} component={GameList}/>
        <NavigationMenu/>
    </div>);
}
export default PoolContainer;