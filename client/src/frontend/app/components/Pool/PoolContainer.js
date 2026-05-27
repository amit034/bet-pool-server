'use strict';
import React, {useEffect, useCallback, useState} from 'react';
import _ from 'lodash';
import {io} from 'socket.io-client';
import {Route, useRouteMatch, useLocation, useHistory} from 'react-router-dom';
import {Loader} from 'semantic-ui-react';
import {clearGoalAnima, getUserBets, updateChallenge, getPoolParticipates, fetchPoolPreview, clearPoolPreview} from '../../actions/pools';
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
    const previewById = useSelector(state => state.pools.poolPreviewById);
    const previewLoading = useSelector(state => state.pools.poolPreviewLoading);
    const previewError = useSelector(state => state.pools.poolPreviewError);
    const betsRef = React.useRef(bets);
    React.useEffect(() => {
        betsRef.current = bets;
    }, [bets]);
    const poolId = match.params.id;
    const previewMode = query.get('preview') === '1';
    const joinCode = query.get('joinCode') || '';
    const inviteToken = query.get('inviteToken') || '';
    const preview = previewById[String(poolId)];
    const [showBetting, setShowBetting] = useState(false);

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

    const isParticipant = preview && preview.isParticipant;
    const showPreviewScreen = previewMode || (preview && !preview.isParticipant && !showBetting);

    useEffect(() => {
        if (!showPreviewScreen && preview && isParticipant) {
            dispatch(getUserBets(poolId));
            dispatch(getPoolParticipates(poolId));
            socket.emit('joinPool', poolId);
            const handler = (challenge) => { updateChallengeInPool(challenge); };
            socket.on('updateChallenge', handler);
            return () => {
                socket.off('updateChallenge', handler);
                socket.emit('leavePool', poolId);
            };
        }
        return undefined;
    }, [dispatch, poolId, showPreviewScreen, preview, isParticipant, updateChallengeInPool, previewMode]);

    const handleJoined = useCallback(() => {
        setShowBetting(true);
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
            <Route exact path={`${props.match.path}/participates`} component={LeadersContainer} />
            <Route exact path={props.match.path} component={() => <GameList poolId={poolId} />} />
            <NavigationMenu />
        </div>
    );
};

export default PoolContainer;
