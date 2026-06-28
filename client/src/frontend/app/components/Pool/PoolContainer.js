'use strict';
import React, {useEffect, useCallback} from 'react';
import _ from 'lodash';
import {io} from 'socket.io-client';
import {Route, Switch, useRouteMatch, useLocation, useHistory} from 'react-router-dom';
import {Loader, Message} from 'semantic-ui-react';
import {clearGoalAnima, getUserBets, updateChallenge, getPoolParticipates, fetchPoolPreview, clearPoolPreview, fetchPoolStandings} from '../../actions/pools';
import NavigationMenu from './NavigationMenu';
import {useDispatch, useSelector} from 'react-redux';
import GameList from './GameList/GameList';
import LeadersContainer from './LeadersContainer';
import PoolPreview from './PoolPreview';

const socket = io();

function useQuery() {
    const {search} = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

const PoolContainer = (props) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const query = useQuery();
    const match = useRouteMatch();
    const bets = useSelector(state => state.pools.bets);
    const standingsByPoolId = useSelector(state => state.pools.standingsByPoolId);
    const previewById = useSelector(state => state.pools.poolPreviewById);
    const previewLoading = useSelector(state => state.pools.poolPreviewLoading);
    const previewError = useSelector(state => state.pools.poolPreviewError);
    const betsRef = React.useRef(bets);
    React.useEffect(() => {
        betsRef.current = bets;
    }, [bets]);
    const poolId = match.params.id;
    const poolBaseUrl = props.match.url;
    const wantsBetting = query.get('active') === 'true';
    const previewMode = query.get('preview') === '1';
    const joinCode = query.get('joinCode') || '';
    const inviteToken = query.get('inviteToken') || '';
    const preview = previewById[String(poolId)];
    const poolDataFetchedRef = React.useRef(null);

    const updateChallengeInPool = useCallback((challenge) => {
        dispatch(updateChallenge(challenge));
        const {id: challengeId, score1, score2} = challenge;
        const prev = _.find(betsRef.current, challengeId);
        if (prev) {
            const {score1: prevScore1, score2: prevScore2} = prev;
            if ((prevScore1 !== null && score1 > prevScore1) || (prevScore2 !== null && score2 > prevScore2)) {
                setTimeout(() => {
                    clearGoalAnima(challengeId);
                }, 1500);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchPoolPreview(poolId, {joinCode, inviteToken}));
        return () => {
            dispatch(clearPoolPreview(poolId));
        };
    }, [dispatch, poolId, joinCode, inviteToken]);

    const isParticipant = Boolean(preview && preview.isParticipant);
    const showPreviewScreen = previewMode || (preview && !isParticipant);
    const bettingActive = !showPreviewScreen && isParticipant;

    useEffect(() => {
        poolDataFetchedRef.current = null;
    }, [poolId]);

    useEffect(() => {
        if (!wantsBetting && !isParticipant) {
            return;
        }
        if (poolDataFetchedRef.current === poolId) {
            return;
        }
        poolDataFetchedRef.current = poolId;
        dispatch(getUserBets(poolId));
        dispatch(getPoolParticipates(poolId));
    }, [wantsBetting, isParticipant, dispatch, poolId]);

    useEffect(() => {
        if (!bettingActive || _.isEmpty(bets)) {
            return;
        }
        if (standingsByPoolId[String(poolId)]) {
            return;
        }
        const eventIds = _.uniq(
            _.map(_.values(bets), (bet) => _.get(bet, 'challenge.game.eventId')).filter(Boolean)
        );
        if (!_.isEmpty(eventIds)) {
            dispatch(fetchPoolStandings(poolId, eventIds));
        }
    }, [bettingActive, poolId, bets, standingsByPoolId, dispatch]);

    useEffect(() => {
        if (!bettingActive) {
            return undefined;
        }
        socket.emit('joinPool', poolId);
        const handler = (challenge) => {
            updateChallengeInPool(challenge);
        };
        socket.on('updateChallenge', handler);
        return () => {
            socket.off('updateChallenge', handler);
            socket.emit('leavePool', poolId);
        };
    }, [bettingActive, poolId, updateChallengeInPool]);

    const handleJoined = useCallback(() => {
        dispatch(fetchPoolPreview(poolId, {joinCode, inviteToken})).then(() => {
            history.replace(`/pools/${poolId}?active=true`);
        });
    }, [dispatch, poolId, joinCode, inviteToken, history]);

    const handleDismissPreview = useCallback(() => {
        history.push('/pools');
    }, [history]);

    const infoMode = previewMode && isParticipant;

    if (previewLoading && !preview && !previewError) {
        return (
            <div id="content" className="ui container">
                <Loader active inline="centered">Loading…</Loader>
            </div>
        );
    }

    if (previewError && !preview && !wantsBetting) {
        return (
            <div id="content" className="ui container">
                <Message negative>{previewError}</Message>
            </div>
        );
    }

    if (showPreviewScreen) {
        return (
            <div id="content" className="ui container">
                <PoolPreview
                    poolId={poolId}
                    preview={preview}
                    loading={previewLoading && !preview}
                    error={previewError}
                    infoMode={infoMode}
                    joinCodeInitial={joinCode}
                    onJoined={handleJoined}
                    onDismiss={handleDismissPreview}
                />
                <NavigationMenu previewMode />
            </div>
        );
    }

    return (
        <div id="content" className="ui container">
            <Switch>
                <Route exact path={`${poolBaseUrl}/participates`} component={LeadersContainer} />
                <Route exact path={poolBaseUrl}>
                    <GameList poolId={poolId} />
                </Route>
            </Switch>
            <NavigationMenu />
        </div>
    );
};

export default PoolContainer;
